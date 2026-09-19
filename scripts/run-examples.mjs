#!/usr/bin/env node
// Runs the code examples in the skills against the installed packages, so an
// example that no longer works fails CI instead of misleading an agent.
//
//   npm run test:examples
//   npm run test:examples -- spreadsheet-what-if     # one skill
//
// Which fences run is decided by a word after the language in the fence's
// opening line:
//
//   ```js setup        A complete program. Runs on its own, and is prepended to
//                      every `run` fence below it in the same SKILL.md. Several
//                      setup fences concatenate in order.
//   ```js run          A fragment that continues the setup: it may use anything
//                      the setup fences declared. Runs as its own process, so two
//                      `run` fences may declare the same names.
//   ```js standalone   A complete program that runs without the setup.
//
// Fences without a marker are not run. That is the right choice for browser
// code, network calls, pseudo-code and anything that needs a service.
//
// Every process runs in .examples-run/<skill>/ (gitignored), seeded with the
// workbooks from tests/fixtures/build-fixtures.mjs, so examples can load
// budget.xlsx, model.xlsx, loan.xlsx and sales.csv and write files freely.

import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SKILLS_DIR = path.join(ROOT, "skills");
const RUN_DIR = path.join(ROOT, ".examples-run");
const FIXTURES_DIR = path.join(RUN_DIR, "fixtures");
const TIMEOUT_MS = 60_000;

const only = process.argv.slice(2);
const FENCE = /^```(?:js|mjs) (setup|run|standalone)\b[^\n]*\n([\s\S]*?)^```/gm;

// The engine prints its evaluation-licence banner on import. Hide it from
// failure output, and keep minified stack lines readable.
const clean = (text) =>
  text
    .split("\n")
    .filter((line) => !/GRID Spreadsheet Engine|Evaluation Licence|non-production use|grid\.is\/license/.test(line))
    .map((line) => (line.length > 200 ? line.slice(0, 200) + " …" : line))
    .join("\n")
    .trim();

function lineOf(text, index) {
  return text.slice(0, index).split("\n").length;
}

function collect(skill) {
  const file = path.join(SKILLS_DIR, skill, "SKILL.md");
  const text = fs.readFileSync(file, "utf8");
  const setup = [];
  const cases = [];
  let m;
  while ((m = FENCE.exec(text))) {
    const [, kind, code] = m;
    const line = lineOf(text, m.index) + 1;
    if (kind === "setup") setup.push({ line, code });
    else cases.push({ kind, line, code });
  }
  return { setup, cases };
}

function prelude(setup) {
  return setup.map((s) => `// SKILL.md line ${s.line}\n${s.code}`).join("\n");
}

fs.rmSync(RUN_DIR, { recursive: true, force: true });
fs.mkdirSync(FIXTURES_DIR, { recursive: true });
const built = spawnSync(process.execPath, [path.join(ROOT, "tests/fixtures/build-fixtures.mjs"), FIXTURES_DIR], {
  cwd: ROOT,
  encoding: "utf8",
});
if (built.status !== 0) {
  console.error("run-examples: could not build fixtures\n" + clean(built.stderr));
  process.exit(1);
}

const skills = fs
  .readdirSync(SKILLS_DIR)
  .filter((name) => fs.existsSync(path.join(SKILLS_DIR, name, "SKILL.md")))
  .filter((name) => only.length === 0 || only.includes(name));

let passed = 0;
const failures = [];

for (const skill of skills) {
  const { setup, cases } = collect(skill);
  // A setup with no run fences still has to work on its own.
  const programs = cases.map((c) => ({
    line: c.line,
    code: c.kind === "run" ? `${prelude(setup)}\n// SKILL.md line ${c.line}\n${c.code}` : c.code,
  }));
  if (programs.length === 0 && setup.length > 0) programs.push({ line: setup[0].line, code: prelude(setup) });
  if (programs.length === 0) continue;

  const dir = path.join(RUN_DIR, skill);
  fs.mkdirSync(dir, { recursive: true });
  fs.cpSync(FIXTURES_DIR, dir, { recursive: true });

  for (const program of programs) {
    const file = path.join(dir, `line-${program.line}.mjs`);
    fs.writeFileSync(file, program.code);
    const result = spawnSync(process.execPath, ["--stack-trace-limit=6", file], {
      cwd: dir,
      encoding: "utf8",
      timeout: TIMEOUT_MS,
    });
    const label = `${skill}/SKILL.md:${program.line}`;
    if (result.status === 0) {
      passed += 1;
      console.log(`ok    ${label}`);
    } else {
      const why = result.error?.code === "ETIMEDOUT" ? `timed out after ${TIMEOUT_MS / 1000}s` : clean(result.stderr);
      failures.push({ label, why, file });
      console.log(`FAIL  ${label}`);
    }
  }
}

console.log("");
for (const { label, why, file } of failures) {
  console.log(`--- ${label} (${path.relative(ROOT, file)})\n${why}\n`);
}
console.log(`run-examples: ${passed} passed, ${failures.length} failed`);
process.exit(failures.length ? 1 : 0);
