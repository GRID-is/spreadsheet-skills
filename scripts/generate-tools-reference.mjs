#!/usr/bin/env node
// Regenerates the agent-tools catalogue (name, description, parameters of
// every tool) from the installed @grid-is/agent-tools package, by asking the
// package itself rather than reading docs. Run through `npm run sync`.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createGridTools } from "@grid-is/agent-tools";
import { z } from "zod";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const CHECK = process.argv.includes("--check");
const MARKER = "<!-- GENERATED FILE. Do not edit by hand. Regenerate with `npm run sync`. -->";

// Tool names by group, in the order the docs present them. Any tool the
// package adds that is not listed here lands in "Other" so it is never lost.
const GROUPS = [
  ["Workbook lifecycle", ["loadWorkbook", "createWorkbook", "saveWorkbook", "listWorkbooks", "selectWorkbook"]],
  ["Understand", ["describeStructure", "generateWorkbookContext", "symbols", "viewRange", "captureRange", "inspect", "findCells"]],
  ["Audit", ["precedents", "dependents", "listErrors", "getStyles", "getComments", "getComment"]],
  ["Edit", ["editCells", "fillCells", "editCellStyles", "manageSheets", "manageRowsAndColumns"]],
  ["Model", ["readCalculatedValues", "runFormula", "goalSeek", "whatIf"]],
  ["Escape hatch", ["executeOfficeJs"]],
];

// Files that receive the catalogue. Each skill that documents the tools gets
// its own copy so it is complete when installed alone.
const OUTPUTS = [
  "skills/spreadsheet-mcp/reference/tools.md",
  "skills/spreadsheet-agent-tools/reference/tools.md",
  "skills/excel-formula-debugging/reference/tools.md",
  "skills/spreadsheet-ai-assistant/reference/tools.md",
];

const version = JSON.parse(fs.readFileSync(path.join(ROOT, "node_modules/@grid-is/agent-tools/package.json"), "utf8")).version;

function describeType(schema) {
  if (!schema) return "unknown";
  if (schema.enum) return schema.enum.map((v) => JSON.stringify(v)).join(" | ");
  if (schema.anyOf) return schema.anyOf.map(describeType).join(" | ");
  if (schema.type === "array") return `${describeType(schema.items)}[]`;
  if (schema.type === "object" && schema.properties) {
    const inner = Object.entries(schema.properties)
      .map(([k, v]) => `${k}${(schema.required ?? []).includes(k) ? "" : "?"}: ${describeType(v)}`)
      .join(", ");
    return `{ ${inner} }`;
  }
  return Array.isArray(schema.type) ? schema.type.join(" | ") : (schema.type ?? "unknown");
}

function renderTool(tool) {
  const schema = z.toJSONSchema(z.object(tool.inputSchema));
  const required = new Set(schema.required ?? []);
  const props = Object.entries(schema.properties ?? {});
  const lines = [`### ${tool.name}`, "", tool.description.trim(), ""];
  if (props.length === 0) {
    lines.push("No parameters. Call with an empty object.", "");
    return lines.join("\n");
  }
  lines.push("| Parameter | Type | Required | Description |", "|---|---|---|---|");
  for (const [name, p] of props) {
    const desc = (p.description ?? "").replace(/\|/g, "\\|").replace(/\s+/g, " ");
    lines.push(`| \`${name}\` | \`${describeType(p).replace(/\|/g, "\\|")}\` | ${required.has(name) ? "yes" : "no"} | ${desc} |`);
  }
  lines.push("");
  return lines.join("\n");
}

const tools = createGridTools();
const byName = new Map(tools.map((t) => [t.name, t]));
const placed = new Set();

const out = [
  MARKER,
  "",
  "# @grid-is/agent-tools: tool catalogue",
  "",
  `Generated from \`@grid-is/agent-tools@${version}\` by calling \`createGridTools()\`. ` +
    `${tools.length} tools. Every tool operates on the active workbook, the one most recently loaded, created or selected. ` +
    "Parameter types are the JSON Schema derived from each tool's zod schema.",
  "",
];
for (const [title, names] of GROUPS) {
  const present = names.filter((n) => byName.has(n));
  if (!present.length) continue;
  out.push(`## ${title}`, "");
  for (const n of present) {
    out.push(renderTool(byName.get(n)));
    placed.add(n);
  }
}
const other = tools.filter((t) => !placed.has(t.name));
if (other.length) {
  out.push("## Other", "");
  for (const t of other) out.push(renderTool(t));
}
const content = out.join("\n").replace(/\n{3,}/g, "\n\n");

let changed = 0;
for (const file of OUTPUTS) {
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
if (CHECK && changed) {
  console.error(`${changed} tool reference file(s) out of date. Run \`npm run sync\`.`);
  process.exit(1);
}
if (!changed) console.log(CHECK ? "Tool reference files are up to date." : "Tool reference unchanged.");
