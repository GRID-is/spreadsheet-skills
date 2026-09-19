#!/usr/bin/env node
// Runs the agent evals in evals/ with `claude plugin eval`. See evals/README.md.
//
//   npm run test:evals -- [claude plugin eval options]
//
// `claude plugin eval` evaluates a plugin, so this assembles one in .evals-plugin/
// (gitignored): a manifest, a copy of every skill, the grid MCP server that the
// spreadsheet-mcp skill relies on, and the cases. It then runs the CLI with the
// flags CI needs and any extra options given on the command line. Set CLAUDE_BIN
// to use a CLI other than the `claude` on PATH.

import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PLUGIN_NAME = "spreadsheet-skills";
const PLUGIN_DIR = path.join(ROOT, ".evals-plugin");
const RESULTS_DIR = path.join(ROOT, "evals", "results", new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19));

const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, "package.json"), "utf8"));
const engineSpec = pkg.devDependencies["@grid-is/spreadsheet-engine"];

fs.rmSync(PLUGIN_DIR, { recursive: true, force: true });
fs.mkdirSync(path.join(PLUGIN_DIR, ".claude-plugin"), { recursive: true });
fs.writeFileSync(
  path.join(PLUGIN_DIR, ".claude-plugin", "plugin.json"),
  JSON.stringify(
    {
      name: PLUGIN_NAME,
      version: "0.0.0",
      description: "Every GRID skill plus the grid MCP server, assembled for claude plugin eval.",
      mcpServers: { grid: { command: "npx", args: ["-y", "@grid-is/agent-tools"] } },
    },
    null,
    2,
  ) + "\n",
);
fs.cpSync(path.join(ROOT, "skills"), path.join(PLUGIN_DIR, "skills"), { recursive: true });
fs.cpSync(path.join(ROOT, "evals"), path.join(PLUGIN_DIR, "evals"), {
  recursive: true,
  filter: (src) => !src.includes(`${path.sep}results`),
});
for (const dirent of fs.readdirSync(path.join(PLUGIN_DIR, "evals"), { withFileTypes: true })) {
  const fixture = path.join(PLUGIN_DIR, "evals", dirent.name, "fixture.sh");
  if (dirent.isDirectory() && fs.existsSync(fixture)) {
    fs.writeFileSync(fixture, fs.readFileSync(fixture, "utf8").replaceAll("__ENGINE_SPEC__", engineSpec));
  }
}

fs.mkdirSync(RESULTS_DIR, { recursive: true });
const args = [
  "plugin",
  "eval",
  PLUGIN_DIR,
  "--trust-plugin",
  "--scaffold",
  "--ablation",
  "none",
  "--allow-real-servers",
  "--allow-tools",
  "Bash",
  "Write",
  "Edit",
  `mcp__plugin_${PLUGIN_NAME}_grid__*`,
  "--threshold",
  "0.8",
  "--no-publish",
  "--output-dir",
  RESULTS_DIR,
  "--json",
  path.join(RESULTS_DIR, "result.json"),
  ...process.argv.slice(2),
];

console.log(`run-evals: ${PLUGIN_DIR} with @grid-is/spreadsheet-engine@${engineSpec}; results in ${path.relative(ROOT, RESULTS_DIR)}`);
const result = spawnSync(process.env.CLAUDE_BIN || "claude", args, { cwd: ROOT, stdio: "inherit" });
if (result.error) {
  console.error(`run-evals: could not start ${process.env.CLAUDE_BIN || "claude"}: ${result.error.message}`);
  process.exit(1);
}
summarise();
process.exit(result.status ?? 1);

function summarise() {
  const file = path.join(RESULTS_DIR, "result.json");
  if (!fs.existsSync(file)) return;
  const doc = JSON.parse(fs.readFileSync(file, "utf8"));
  const a = doc.aggregates ?? {};
  console.log(
    `run-evals: ${a.casesPassed ?? "?"}/${a.casesTotal ?? "?"} cases passed, mean score ${a.overallScore ?? "?"}` +
      `${doc.partial ? ` (partial: ${doc.partialReason})` : ""}, est. cost $${doc.costUsd == null ? "?" : doc.costUsd.toFixed(2)}`,
  );
  for (const c of doc.cases ?? []) {
    const runs = c.arms?.with ?? [];
    const errors = runs.map((r) => r.error).filter(Boolean);
    console.log(`  ${c.name}: ${c.aggregates?.score ?? "?"}${errors.length ? ` (${errors.join("; ")})` : ""}`);
  }
}
