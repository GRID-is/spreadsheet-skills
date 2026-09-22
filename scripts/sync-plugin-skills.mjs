#!/usr/bin/env node
// Copies the skills the agent-tools plugin bundles from skills/ into
// plugins/agent-tools/skills/, so the plugin stays a plain directory (no
// symlinks) and the top-level skills remain the single source. Part of
// `npm run sync`; `--check` fails when the copies are stale.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const CHECK = process.argv.includes("--check");
const PLUGIN_SKILLS = ["spreadsheet-mcp", "excel-formula-debugging"];
const DEST = path.join(ROOT, "plugins/agent-tools/skills");

function listFiles(dir, prefix = "") {
  const out = new Map();
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const rel = path.join(prefix, entry.name);
    if (entry.isDirectory()) for (const [k, v] of listFiles(path.join(dir, entry.name), rel)) out.set(k, v);
    else out.set(rel, fs.readFileSync(path.join(dir, entry.name), "utf8"));
  }
  return out;
}

let changed = 0;
for (const name of PLUGIN_SKILLS) {
  const src = listFiles(path.join(ROOT, "skills", name));
  const dst = listFiles(path.join(DEST, name));
  const stale = [...src].some(([k, v]) => dst.get(k) !== v) || [...dst.keys()].some((k) => !src.has(k));
  if (!stale) continue;
  changed++;
  if (CHECK) {
    console.log(`would update: plugins/agent-tools/skills/${name}`);
    continue;
  }
  fs.rmSync(path.join(DEST, name), { recursive: true, force: true });
  fs.cpSync(path.join(ROOT, "skills", name), path.join(DEST, name), { recursive: true });
  console.log(`copied skills/${name} to plugins/agent-tools/skills/${name}`);
}

if (CHECK && changed) {
  console.error("Plugin skill copies are stale. Run `npm run sync`.");
  process.exit(1);
}
if (!changed) console.log(CHECK ? "Plugin skill copies are up to date." : "Plugin skills unchanged.");
