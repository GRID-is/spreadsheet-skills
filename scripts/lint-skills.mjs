#!/usr/bin/env node
// Checks that every skill's code fences only use identifiers that exist in the
// installed @grid-is packages, and that every SKILL.md has the frontmatter
// the Agent Skills spec requires.
//
//   npm run lint
//
// What is checked in code fences (js, ts, jsx, tsx, mjs):
//   - names imported from "@grid-is/*" must be exported by that package
//   - `.name(` method calls must be a member of some class or interface in the
//     packages, or a well-known JavaScript or DOM method
//   - `Model.name` and `ValueSnapshot.name` static accesses must exist
// Anything else in a fence is not checked.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
// One entry per import specifier, so a subpath such as "@grid-is/agent-tools/tools"
// is checked against its own type file and not against the root's exports.
const PACKAGES = {
  "@grid-is/spreadsheet-engine": "dist/index.d.ts",
  "@grid-is/spreadsheet-viewer": "dist/index.d.ts",
  "@grid-is/spreadsheet-editor": "dist/index.d.ts",
  "@grid-is/agent-tools": "dist/index.d.ts",
  "@grid-is/agent-tools/tools": "dist/tools.d.ts",
};
const packageDir = (specifier) => specifier.split("/").slice(0, 2).join("/");

// Methods that appear in examples but belong to JavaScript, Node, the DOM,
// React, zod or the MCP SDK rather than to a GRID package. The lint rejects
// any method call it cannot attribute to a GRID type, so when an example
// legitimately uses a new external API, add its method names here.
const KNOWN_METHODS = new Set(
  `map filter find findIndex forEach push pop shift unshift join slice splice concat flat flatMap some every reduce sort reverse includes indexOf
   entries keys values assign create freeze fromEntries then catch finally resolve reject all allSettled
   log info warn error debug table dir group groupEnd time timeEnd
   toString toFixed toISOString toLocaleString valueOf toJSON stringify parse
   split trim trimEnd trimStart replace replaceAll startsWith endsWith padStart padEnd toUpperCase toLowerCase charCodeAt fromCharCode match test exec repeat at
   has get set add delete clear size
   arrayBuffer json text blob formData ok status
   readFile writeFile readFileSync writeFileSync existsSync mkdirSync readdirSync stat
   createElement getElementById querySelector appendChild removeChild click createObjectURL revokeObjectURL addEventListener removeEventListener setAttribute
   useState useEffect useRef useMemo useCallback useReducer render createRoot
   object string number boolean array optional describe toJSONSchema
   isArray isFinite isNaN isInteger max min round floor ceil abs random now
   send close connect listen post use listen run execute
   generateText streamText tool invoke call bind
   messages create beta tools
   readline question prompt
   cwd exit env query`
    .split(/\s+/)
    .filter(Boolean),
);

// Collect exported names and member names for one import specifier.
// Only the entry file decides what is public. Relative imports are followed
// for member and static names, but their export clauses are ignored: a bundled
// chunk such as agent-tools' index-*.d.ts re-exports its declarations under
// minified aliases (`runFormula as C`) that the package does not expose.
function collect(specifier, dts) {
  const file = path.join(ROOT, "node_modules", packageDir(specifier), dts);
  if (!fs.existsSync(file)) return { exported: new Set(), members: new Set(), statics: new Map() };
  const seen = new Set();
  const exported = new Set();
  const members = new Set();
  const statics = new Map();
  const visitFile = (f, isEntry) => {
    if (seen.has(f) || !fs.existsSync(f)) return;
    seen.add(f);
    const src = ts.createSourceFile(f, fs.readFileSync(f, "utf8"), ts.ScriptTarget.Latest, true);
    for (const n of src.statements) {
      if (isEntry && ts.isExportDeclaration(n) && n.exportClause && ts.isNamedExports(n.exportClause)) {
        for (const e of n.exportClause.elements) exported.add(e.name.text);
      }
      if (ts.isImportDeclaration(n) && n.moduleSpecifier.text.startsWith(".")) {
        visitFile(path.resolve(path.dirname(f), n.moduleSpecifier.text.replace(/\.js$/, ".d.ts")), false);
        // An import is not a re-export. A bundled entry point imports its own
        // internals (Style, CalcProps, Buffer) and exports only some of them,
        // so only the export clause above decides what is public. Where it
        // renames (`export { ready as formulaParserReady }`) the public name is
        // the exported one, and the local name stays internal.
      }
      if (isEntry && n.modifiers?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword)) {
        if (ts.isVariableStatement(n)) n.declarationList.declarations.forEach((d) => exported.add(d.name.getText()));
        else if (n.name) exported.add(n.name.getText());
      }
      if (ts.isClassDeclaration(n) || ts.isInterfaceDeclaration(n)) {
        const cls = n.name?.getText();
        for (const m of n.members) {
          const name = m.name?.getText?.();
          if (!name) continue;
          members.add(name);
          if (m.modifiers?.some((x) => x.kind === ts.SyntaxKind.StaticKeyword) && cls) {
            if (!statics.has(cls)) statics.set(cls, new Set());
            statics.get(cls).add(name);
          }
        }
      }
      if (ts.isTypeAliasDeclaration(n) && ts.isTypeLiteralNode(n.type)) {
        for (const m of n.type.members) {
          const name = m.name?.getText?.();
          if (name) members.add(name);
        }
      }
    }
  };
  visitFile(file, true);
  return { exported, members, statics };
}

const api = {};
const allMembers = new Set();
const allStatics = new Map();
// @grid-is/agent-tools installs the engine under this alias; examples that
// share a Model with the tools import it from there.
const ALIASES = { "@grid-is/apiary": "@grid-is/spreadsheet-engine" };
for (const [specifier, dts] of Object.entries(PACKAGES)) {
  const c = collect(specifier, dts);
  api[specifier] = { exported: c.exported };
  c.members.forEach((n) => allMembers.add(n));
  for (const [cls, names] of c.statics) {
    if (!allStatics.has(cls)) allStatics.set(cls, new Set());
    names.forEach((n) => allStatics.get(cls).add(n));
  }
}
// Members also count as known methods; ".readValue(" is fine anywhere.
const knownMethods = new Set([...KNOWN_METHODS, ...allMembers]);

// MCP tool names appear as calls in agent-facing examples.
const toolNames = new Set();
try {
  const { createGridTools } = await import("@grid-is/agent-tools");
  for (const t of createGridTools()) toolNames.add(t.name);
} catch {
  // Package missing; the import check above will already fail.
}

const problems = [];
function problem(file, line, message) {
  problems.push(`${path.relative(ROOT, file)}:${line}: ${message}`);
}

function lintFences(file, text) {
  const fence = /^```(\w*)[^\n]*\n([\s\S]*?)^```/gm;
  let m;
  while ((m = fence.exec(text))) {
    const lang = m[1].toLowerCase();
    if (!["js", "ts", "jsx", "tsx", "mjs", "javascript", "typescript"].includes(lang)) continue;
    const code = m[2];
    const startLine = text.slice(0, m.index).split("\n").length + 1;
    const lineOf = (idx) => startLine + code.slice(0, idx).split("\n").length - 1;

    const imp = /import\s+(?:type\s+)?\{([^}]*)\}\s+from\s+["'](@grid-is\/[\w-]+(?:\/[\w-]+)?)["']/g;
    let im;
    while ((im = imp.exec(code))) {
      const pkg = ALIASES[im[2]] ?? im[2];
      const names = im[1].split(",").map((s) => s.trim().replace(/^type\s+/, "").split(/\s+as\s+/)[0]).filter(Boolean);
      if (!api[pkg]) {
        problem(file, lineOf(im.index), `unknown package ${pkg}`);
        continue;
      }
      for (const n of names) {
        if (!api[pkg].exported.has(n)) problem(file, lineOf(im.index), `${pkg} does not export ${n}`);
      }
    }

    const call = /\.([A-Za-z_]\w*)\s*\(/g;
    let c;
    while ((c = call.exec(code))) {
      const name = c[1];
      if (knownMethods.has(name) || toolNames.has(name)) continue;
      problem(file, lineOf(c.index), `unknown method .${name}() (not in any @grid-is type definition)`);
    }

    const stat = /\b(Model|ValueSnapshot|Workbook)\.([A-Za-z_]\w*)/g;
    let s;
    while ((s = stat.exec(code))) {
      const known = allStatics.get(s[1]);
      if (known && !known.has(s[2])) problem(file, lineOf(s.index), `${s[1]}.${s[2]} is not a static member of ${s[1]}`);
    }
  }
}

function lintFrontmatter(file, text) {
  const fm = text.match(/^---\n([\s\S]*?)\n---/);
  if (!fm) return problem(file, 1, "missing frontmatter");
  const name = fm[1].match(/^name:\s*(.+)$/m)?.[1]?.trim();
  const desc = fm[1].match(/^description:\s*([\s\S]*?)(?=\n\w+:|$)/m)?.[1]?.trim();
  const dir = path.basename(path.dirname(file));
  if (!name) problem(file, 1, "frontmatter has no name");
  else if (name !== dir) problem(file, 1, `frontmatter name "${name}" does not match folder "${dir}"`);
  if (!desc) problem(file, 1, "frontmatter has no description");
  else if (desc.length > 1024) problem(file, 1, `description is ${desc.length} characters, the spec caps it at 1024`);
  if (/—/.test(text)) problem(file, text.slice(0, text.indexOf("—")).split("\n").length, "em dash in skill text");
}

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(p);
    else if (entry.name.endsWith(".md")) {
      const text = fs.readFileSync(p, "utf8");
      if (entry.name === "SKILL.md") lintFrontmatter(p, text);
      if (!text.startsWith("<!-- GENERATED FILE")) lintFences(p, text);
    }
  }
}

walk(path.join(ROOT, "skills"));
walk(path.join(ROOT, "plugins"));

if (problems.length) {
  console.error(problems.join("\n"));
  console.error(`\n${problems.length} problem(s).`);
  process.exit(1);
}
console.log("Skills lint passed.");
