#!/usr/bin/env node
// Regenerates the API reference files inside the skills from the type
// definitions shipped in the installed @grid-is packages.
//
//   npm run sync          regenerate the reference files and version stamps
//   npm run sync -- --check   exit 1 if regenerating would change anything
//
// Both modes exit 1 without writing anything if a symbol named explicitly in
// the config is no longer exported by the package, or if a SKILL.md lacks a
// generated block marker. A package release that drops or renames an API must
// fail the sync, not silently vanish from the reference.
//
// The prose in each SKILL.md is written by hand. Only the files under
// reference/ that start with the GENERATED marker, and the marked blocks in
// SKILL.md, are produced here. See scripts/api-reference.config.mjs for which
// symbols go into which file.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";
import { TARGETS, CATALOGUE } from "./api-reference.config.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const CHECK = process.argv.includes("--check");
const MARKER = "<!-- GENERATED FILE. Do not edit by hand. Regenerate with `npm run sync`. -->";

let changed = 0;
const errors = [];
const pending = [];

function pkgVersion(pkg) {
  const p = path.join(ROOT, "node_modules", pkg, "package.json");
  return JSON.parse(fs.readFileSync(p, "utf8")).version;
}

// Writes are queued so that nothing touches the tree if an error turns up
// later in the run.
function writeFile(file, content) {
  pending.push([file, content]);
}

function flushWrites() {
  for (const [file, content] of pending) {
    const abs = path.join(ROOT, file);
    const current = fs.existsSync(abs) ? fs.readFileSync(abs, "utf8") : null;
    if (current === content) continue;
    changed++;
    if (CHECK) {
      console.log(`would change: ${file}`);
      continue;
    }
    fs.mkdirSync(path.dirname(abs), { recursive: true });
    fs.writeFileSync(abs, content);
    console.log(`wrote ${file}`);
  }
}

// ---------------------------------------------------------------------------
// Type definition parsing

const isDeclaration = (n) =>
  ts.isClassDeclaration(n) ||
  ts.isInterfaceDeclaration(n) ||
  ts.isTypeAliasDeclaration(n) ||
  ts.isFunctionDeclaration(n) ||
  ts.isVariableStatement(n) ||
  ts.isEnumDeclaration(n);

const declNames = (n) =>
  ts.isVariableStatement(n) ? n.declarationList.declarations.map((d) => d.name.getText()) : [n.name?.getText()];

// Parses one .d.ts file. Returns the declarations by local name, the set of
// exported names, and a map from exported name to local name (for
// `export { local as exported }`).
function parseFile(file) {
  const source = ts.createSourceFile(file, fs.readFileSync(file, "utf8"), ts.ScriptTarget.Latest, true);
  const decls = new Map();
  const exported = new Set();
  const exportAlias = new Map();
  const imports = [];
  for (const n of source.statements) {
    if (isDeclaration(n)) {
      for (const nm of declNames(n)) {
        if (!nm) continue;
        if (!decls.has(nm)) decls.set(nm, []);
        decls.get(nm).push(n);
        if (n.modifiers?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword)) {
          exported.add(nm);
          exportAlias.set(nm, nm);
        }
      }
    } else if (ts.isExportDeclaration(n) && n.exportClause && ts.isNamedExports(n.exportClause)) {
      for (const e of n.exportClause.elements) {
        exported.add(e.name.text);
        exportAlias.set(e.name.text, e.propertyName?.text ?? e.name.text);
      }
    } else if (ts.isImportDeclaration(n) && n.importClause?.namedBindings && ts.isNamedImports(n.importClause.namedBindings)) {
      const spec = n.moduleSpecifier.text;
      if (spec.startsWith(".")) {
        for (const e of n.importClause.namedBindings.elements) {
          imports.push({ local: e.name.text, remote: e.propertyName?.text ?? e.name.text, spec });
        }
      }
    }
  }
  return { source, decls, exported, exportAlias, imports };
}

// Loads a package entry point and follows relative re-exports, so bundled
// chunk files (`export { x as C } from "./chunk"`) resolve to real declarations.
function loadDeclarations(pkg, dts) {
  const file = path.join(ROOT, "node_modules", pkg, dts);
  const entry = parseFile(file);
  const decls = new Map(entry.decls);
  for (const imp of entry.imports) {
    const target = path.resolve(path.dirname(file), imp.spec.replace(/\.js$/, ".d.ts"));
    if (!fs.existsSync(target)) continue;
    const chunk = parseFile(target);
    const localInChunk = chunk.exportAlias.get(imp.remote) ?? imp.remote;
    const nodes = chunk.decls.get(localInChunk);
    if (nodes && !decls.has(imp.local)) decls.set(imp.local, nodes);
  }
  const exported = new Set();
  for (const name of entry.exported) {
    const local = entry.exportAlias.get(name) ?? name;
    if (decls.has(local)) {
      if (local !== name) decls.set(name, decls.get(local));
      exported.add(name);
    }
  }
  return { source: entry.source, exported, decls };
}

function jsDocOf(node) {
  const docs = node.jsDoc;
  if (!docs || docs.length === 0) return { text: "", params: [], returns: "", examples: [], tags: new Set() };
  const doc = docs[docs.length - 1];
  const text = commentText(doc.comment);
  const params = [];
  const examples = [];
  const tags = new Set();
  let returns = "";
  for (const tag of doc.tags ?? []) {
    const name = tag.tagName.text;
    tags.add(name);
    if (name === "param") params.push({ name: tag.name?.getText() ?? "", text: commentText(tag.comment) });
    else if (name === "returns" || name === "return") returns = commentText(tag.comment);
    else if (name === "example") examples.push(commentText(tag.comment));
  }
  return { text, params, returns, examples, tags };
}

function commentText(comment) {
  if (!comment) return "";
  if (typeof comment === "string") return comment.trim();
  return comment
    .map((part) => (part.kind === ts.SyntaxKind.JSDocText ? part.text : `{@link ${part.name?.getText() ?? ""}}`))
    .join("")
    .trim();
}

function isHidden(member, doc) {
  if (member.modifiers?.some((m) => m.kind === ts.SyntaxKind.PrivateKeyword || m.kind === ts.SyntaxKind.ProtectedKeyword))
    return true;
  const name = member.name?.getText?.() ?? "";
  if (name.startsWith("_") || name.startsWith("#")) return true;
  if (doc.tags.has("internal") || doc.tags.has("hidden") || doc.tags.has("ignore")) return true;
  return false;
}

// The identifier a declaration declares, as a node, when there is exactly one.
// `export { ready as formulaParserReady }` leaves the declaration itself named
// `ready`, so the reference has to rename it or it documents a name the package
// does not export.
function declNameNode(node) {
  if (ts.isVariableStatement(node)) {
    const ds = node.declarationList.declarations;
    return ds.length === 1 ? ds[0].name : null;
  }
  return node.name ?? null;
}

function signature(node, publicName) {
  // The declaration text without leading JSDoc, normalised to one line per
  // declaration and two-space indentation.
  let text = node.getText();
  // Rename by offset rather than by regex, so an identical name elsewhere in
  // the signature (a parameter, a type reference) is left alone.
  const nameNode = publicName ? declNameNode(node) : null;
  if (nameNode && nameNode.getText() !== publicName) {
    const at = nameNode.getStart() - node.getStart();
    text = text.slice(0, at) + publicName + text.slice(at + nameNode.getText().length);
  }
  text = text.replace(/^(export |declare |default )+/g, "");
  text = text.replace(/\t/g, "  ");
  text = text.replace(/;\s*$/, "");
  // Bundlers suffix colliding type names with $1, $2. The public name has no suffix.
  text = text.replace(/\$\d+\b/g, "");
  return text;
}

// JSDoc bodies sometimes carry their own markdown headings. Push them below
// the generated hierarchy so the file outline stays class > member.
function demote(text) {
  return text.replace(/^#{1,6} /gm, "#### ");
}

function block(title, doc, sig) {
  const out = [];
  out.push(`### ${title}`, "");
  out.push("```ts", sig, "```", "");
  if (doc.text) out.push(demote(doc.text), "");
  if (doc.params.length) {
    for (const p of doc.params) out.push(`- \`${p.name}\`${p.text ? `: ${p.text}` : ""}`);
    out.push("");
  }
  if (doc.returns) out.push(`Returns: ${doc.returns}`, "");
  for (const ex of doc.examples) {
    // Examples are already fenced in most JSDoc; fence them when they are not.
    out.push(ex.includes("```") ? ex : "```ts\n" + ex + "\n```", "");
  }
  return out.join("\n");
}

function memberTitle(member, className) {
  const name = member.name?.getText?.() ?? "constructor";
  const isStatic = member.modifiers?.some((m) => m.kind === ts.SyntaxKind.StaticKeyword);
  if (ts.isConstructorDeclaration(member)) return `new ${className}()`;
  if (ts.isGetAccessor(member) || ts.isSetAccessor(member) || ts.isPropertyDeclaration(member) || ts.isPropertySignature(member))
    return `${isStatic ? `${className}.` : ""}${name}`;
  return `${isStatic ? `${className}.` : ""}${name}()`;
}

// A property declared as `name: typeof fn` where `fn` is a function declared
// in the same file is really a method. Render the function's signatures and
// JSDoc under the property's name.
function resolveTypeofProperty(member, decl) {
  if (!ts.isPropertyDeclaration(member) || !member.type || !ts.isTypeQueryNode(member.type)) return null;
  const target = member.type.exprName.getText();
  const fns = (decl.decls.get(target) ?? []).filter(ts.isFunctionDeclaration);
  if (!fns.length) return null;
  const name = member.name.getText();
  const sigs = fns.map((fn) => signature(fn).replace(/^function\s+\w+/, name));
  const doc = fns.map(jsDocOf).find((d) => d.text) ?? jsDocOf(fns[0]);
  return { sigs, doc };
}

function renderClassLike(node, name, decl) {
  const doc = jsDocOf(node);
  const out = [];
  const kind = ts.isInterfaceDeclaration(node) ? "interface" : "class";
  const heritage = node.heritageClauses?.map((h) => h.getText()).join(" ") ?? "";
  out.push(`## ${kind} ${name}${heritage ? ` ${heritage}` : ""}`, "");
  if (doc.text) out.push(demote(doc.text), "");
  for (const ex of doc.examples) out.push(ex.includes("```") ? ex : "```ts\n" + ex + "\n```", "");

  const seen = new Map();
  for (const member of node.members) {
    const mdoc = jsDocOf(member);
    if (isHidden(member, mdoc)) continue;
    if (ts.isIndexSignatureDeclaration(member)) continue;
    const viaTypeof = resolveTypeofProperty(member, decl);
    const title = viaTypeof ? `${member.name.getText()}()` : memberTitle(member, name);
    const sigs = viaTypeof ? viaTypeof.sigs : [signature(member)];
    const docForMember = viaTypeof ? viaTypeof.doc : mdoc;
    // Overloads share a title; merge their signatures.
    if (seen.has(title)) {
      seen.get(title).sigs.push(...sigs);
      if (!seen.get(title).doc.text && docForMember.text) seen.get(title).doc = docForMember;
      continue;
    }
    seen.set(title, { sigs, doc: docForMember, deprecated: docForMember.tags.has("deprecated") });
  }
  for (const [title, m] of seen) {
    out.push(block(title + (m.deprecated ? " (deprecated)" : ""), m.doc, m.sigs.join("\n")));
  }
  return out.join("\n");
}

function renderSimple(nodes, name) {
  const node = nodes[0];
  const doc = jsDocOf(node);
  const kind = ts.isFunctionDeclaration(node)
    ? "function"
    : ts.isTypeAliasDeclaration(node)
      ? "type"
      : ts.isEnumDeclaration(node)
        ? "enum"
        : "const";
  const sigs = nodes.map((n) => signature(n, name));
  return block(`${kind} ${name}${kind === "function" ? "()" : ""}`, doc, sigs.join("\n"));
}

function renderSymbol(decl, name) {
  const nodes = decl.decls.get(name);
  if (!nodes) return null;
  const node = nodes[0];
  if (ts.isClassDeclaration(node) || ts.isInterfaceDeclaration(node)) return renderClassLike(node, name, decl);
  return renderSimple(nodes, name);
}

function kindOf(decl, name) {
  const node = decl.decls.get(name)?.[0];
  if (!node) return "unknown";
  if (ts.isClassDeclaration(node)) return "class";
  if (ts.isInterfaceDeclaration(node)) return "interface";
  if (ts.isTypeAliasDeclaration(node)) return "type";
  if (ts.isFunctionDeclaration(node)) return "function";
  if (ts.isEnumDeclaration(node)) return "enum";
  return "const";
}

// ---------------------------------------------------------------------------
// Rendering per target

function renderOutput(target, output, decl, version) {
  const lines = [MARKER, "", `# ${output.title}`, ""];
  lines.push(
    `Generated from \`${target.package}@${version}\` (\`${target.dts}\`). ` +
      `Every public symbol listed here exists in that version. If the installed version differs, ` +
      `read \`node_modules/${target.package}/${target.dts}\` instead; it is the source of truth.`,
    "",
  );
  if (output.intro) lines.push(output.intro, "");

  const included = new Set();
  const select = output.include ?? [];
  const names = [];
  for (const sel of select) {
    if (sel.startsWith("kind:")) {
      const k = sel.slice(5);
      for (const n of [...decl.exported].sort()) if (kindOf(decl, n) === k && !isClaimed(target, n, output)) names.push(n);
    } else if (sel === "rest") {
      for (const n of [...decl.exported].sort()) if (!isClaimed(target, n, output)) names.push(n);
    } else {
      names.push(sel);
    }
  }
  for (const n of names) {
    if (included.has(n)) continue;
    // "kind:" and "rest" selectors only ever yield exported names, so a miss
    // here is always a name listed explicitly in the config. That means the
    // package dropped or renamed it, which is exactly what this check is for.
    if (!decl.exported.has(n)) {
      errors.push(`${target.package}@${version} does not export ${n} (listed in ${output.file})`);
      continue;
    }
    const rendered = renderSymbol(decl, n);
    if (!rendered) continue;
    included.add(n);
    lines.push(rendered, "");
  }
  return lines.join("\n").replace(/\n{3,}/g, "\n\n");
}

// A symbol named explicitly in any output of this target belongs to that
// output; "kind:" and "rest" selectors skip it.
function isClaimed(target, name, current) {
  for (const o of target.outputs) {
    if (o === current) continue;
    if ((o.include ?? []).includes(name)) return true;
  }
  return false;
}

// ---------------------------------------------------------------------------
// Marked blocks inside SKILL.md files

function replaceBlock(text, tag, body, file) {
  const start = `<!-- generated:${tag} -->`;
  const end = `<!-- /generated:${tag} -->`;
  const i = text.indexOf(start);
  const j = text.indexOf(end);
  if (i === -1 || j === -1 || j < i) {
    errors.push(`${file} is missing the ${start} ... ${end} block`);
    return text;
  }
  return text.slice(0, i + start.length) + "\n" + body.trim() + "\n" + text.slice(j);
}

function catalogueBlock() {
  const lines = [];
  for (const group of CATALOGUE.groups) {
    lines.push(`**${group.title}**`, "");
    for (const s of group.skills) {
      lines.push(`- \`${s.name}\`: ${s.summary}`);
    }
    lines.push("");
  }
  lines.push(`Install any of them with \`npx skills add ${CATALOGUE.repo} --skill <name>\`. Full list: <https://github.com/${CATALOGUE.repo}>.`);
  return lines.join("\n");
}

function versionsBlock(packages) {
  const lines = packages.map((p) => `- \`${p}@${pkgVersion(p)}\``);
  return ["Written and verified against:", "", ...lines].join("\n");
}

function updateSkillFiles() {
  const skillsDir = path.join(ROOT, "skills");
  for (const dir of fs.readdirSync(skillsDir)) {
    const file = path.join(skillsDir, dir, "SKILL.md");
    if (!fs.existsSync(file)) continue;
    const rel = path.relative(ROOT, file);
    const original = fs.readFileSync(file, "utf8");
    let text = replaceBlock(original, "catalogue", catalogueBlock(), rel);
    const pkgs = CATALOGUE.groups.flatMap((g) => g.skills).find((s) => s.name === dir)?.packages ?? [];
    if (pkgs.length) text = replaceBlock(text, "versions", versionsBlock(pkgs), rel);
    writeFile(rel, text);
  }
}

// ---------------------------------------------------------------------------

for (const target of TARGETS) {
  const version = pkgVersion(target.package);
  const decl = loadDeclarations(target.package, target.dts);
  for (const output of target.outputs) {
    writeFile(output.file, renderOutput(target, output, decl, version));
  }
}
updateSkillFiles();

if (errors.length) {
  for (const e of errors) console.error(`error: ${e}`);
  console.error(`${errors.length} error(s). Nothing was written. Update scripts/api-reference.config.mjs or the skill files.`);
  process.exit(1);
}
flushWrites();

if (CHECK) {
  if (changed) {
    console.error(`${changed} file(s) out of date. Run \`npm run sync\`.`);
    process.exit(1);
  }
  console.log("API reference files are up to date.");
} else if (!changed) {
  console.log("Nothing changed.");
}
