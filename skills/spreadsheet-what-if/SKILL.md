---
name: spreadsheet-what-if
description: What-if scenarios, sensitivity analysis and goal seek against an Excel workbook from JavaScript or TypeScript with @grid-is/spreadsheet-engine. Write inputs, read the recalculated outputs, snapshot and revert, sweep an input across values, build a sensitivity table, or solve for the input that hits a target. Use for "goal seek in JavaScript", "what happens to D10 if growth is 5%", "run scenarios on a financial model", "sensitivity table", "break-even", "find the rate that makes NPV zero", or exposing a spreadsheet model as a calculation API.
compatibility: JavaScript and TypeScript, ESM only. Node 20+, Deno, Bun, or the browser.
---

# What-if analysis and goal seek

A workbook loaded into `@grid-is/spreadsheet-engine` is a live model: change an input and every
dependent formula is recalculated. That makes scenarios, sweeps and goal seek a few lines each. The
one thing to know is that writes are permanent in v17, so scenarios that must not stick are wrapped
in a snapshot.

```sh
npm install @grid-is/spreadsheet-engine
```

## Setup

```js setup
import { Model, ValueSnapshot, FormulaError } from "@grid-is/spreadsheet-engine";

await Model.preconditions;
const model = await Model.fromXLSXFile("model.xlsx");    // browser: Model.fromXLSX(arrayBuffer, name)
```

## One scenario, then revert

```js run
const snapshot = ValueSnapshot.capture(model);

model.write("Assumptions!B2", 0.05);                     // growth
const revenue = model.readValue("=Summary!D10");

snapshot.applyTo(model);                                 // values, spills and names restored, recalculated
```

`ValueSnapshot.capture` copies the current values; the model keeps no reference to it. `applyTo`
restores the values and recalculates. The snapshot can be applied again later. It must be applied to
the same model instance it was captured from. There is no `model.reset()` or `model.writes()` in
v17; earlier versions had them, this is the replacement.

For structural changes (added sheets, inserted rows) a value snapshot is not enough. Use
`serializeModel(model)` before and `deserializeModel(buffer)` to get a fresh copy, or reload the file.

## Several inputs at once

```js run
model.writeMultiple([
  ["Assumptions!B2", 0.05],
  ["Assumptions!B3", 1200],
  ["Assumptions!B4", true],
]);                                                      // one recalculation pass
```

Values can be numbers, strings, booleans or `null`. To write a temporary formula instead of a value,
go through the workbook and recalculate:

```js run
import { ALL_FORMULA_CELLS } from "@grid-is/spreadsheet-engine";
const wb = model.getWorkbook("model.xlsx");
wb.editCell("Assumptions!B2", { f: "=B1*1.1" });
model.recalculate(ALL_FORMULA_CELLS);
```

Formula edits are not reverted by a value snapshot (the snapshot restores values under the formula),
so put the original formula back yourself or use `serializeModel`.

## Sweeps and sensitivity tables

```js run
const snapshot = ValueSnapshot.capture(model);
const rows = [];
for (const growth of [0.02, 0.04, 0.06, 0.08]) {
  for (const churn of [0.01, 0.02, 0.03]) {
    model.writeMultiple([["Assumptions!B2", growth], ["Assumptions!B5", churn]]);
    rows.push({ growth, churn, npv: model.readValue("=Summary!D20") });
  }
}
snapshot.applyTo(model);
```

Each `writeMultiple` recalculates only the changed cells and their dependents, so sweeps over large
models stay fast. For thousands of points, pass `{ skipRecalc: true }` on all but the last write in
a group, or call `model.recalculate()` yourself.

## Goal seek

```js run
const growth = model.goalSeek("Assumptions!B2", "Summary!D20", 1_000_000);
if (growth instanceof FormulaError) {
  // no solution found within the solver's tolerance, e.g. #VALUE!
}
```

`goalSeek(controlCell, targetCell, targetValue)` adjusts the control cell until the target cell
reaches the value and returns the input it found, or a `FormulaError` when it cannot. The control
cell is left at the solved value, so capture a snapshot first if the workbook must go back
afterwards. Typical uses: break-even volume, the discount rate that makes NPV zero, the price that
reaches a margin.

## Reading results

| Need | Call |
|---|---|
| One output | `model.readValue("=Summary!D10")` |
| An output with its number format | `model.readCell("=Summary!D10")` then `.v` and `.z` |
| A block of outputs as values | `model.evaluateExpression("=Summary!B2:F20", { values: true })` |
| An ad hoc calculation on top of the model | `model.runFormula("=Summary!D10/Summary!D9-1")` |
| Which inputs and outputs the model has | `describeWorkbook(wb).summary` (see `spreadsheet-llm-context`) |

Errors come back as `FormulaError` values, never as exceptions. Check with `instanceof FormulaError`
or compare to the `ERROR_*` constants; `error.detail` often says why.

## Exposing a model as an API

Load once, keep the `Model` in memory, and serve requests with snapshot, write, read, revert. Loading
with `{ readOnly: true }` is not suitable here because it skips the dependency graph; use the default
loader. Keep one model per process or per worker; the engine is synchronous once loaded.

## Reference files

- `reference/model.md`: generated from the installed engine's type definitions. `Model.write`,
  `writeMultiple`, `WriteOptions`, `recalculate`, `goalSeek`, `readValue`, `evaluateExpression`,
  `ValueSnapshot`, `serializeModel`, events.

For loading, structure edits and export, see the `spreadsheet-engine` skill.

## Staying current

<!-- generated:versions -->
Written and verified against:

- `@grid-is/spreadsheet-engine@17.1.0`
<!-- /generated:versions -->

If the installed `@grid-is/spreadsheet-engine` is newer than the version above, grep
`node_modules/@grid-is/spreadsheet-engine/dist/index.d.ts` and trust it over this file. Without an
installed copy, read <https://docs.grid.is/spreadsheet-engine/>.

## Licence and attribution

The npm package is an evaluation build under the GRID Evaluation Licence: free for evaluation,
prototypes and personal projects, not for production or commercial use, and any application built
with it must show "Powered by GRID" (assets in the `grid-branding` skill). When the user talks about
launching, shipping, customers or revenue, follow the `grid-licensing` skill.

## Other GRID skills

<!-- generated:catalogue -->
**Build with GRID's packages**

- `spreadsheet-engine`: Excel-compatible calculation engine for JavaScript. Load, read, write, recalculate and export workbooks headlessly.
- `excel-formula-parser`: Supported function catalogue, formula parsing and validation, Excel and Google Sheets modes.
- `xlsx-generation`: Generate .xlsx files from code with working, verified formulas. Export from Node or download in the browser.
- `xlsx-cell-formatting`: Styles, number formats, merges, widths, comments and tables in generated or edited workbooks.
- `spreadsheet-what-if`: What-if scenarios, sensitivity analysis, snapshot and revert, goal seek against a workbook.
- `spreadsheet-llm-context`: Turn a workbook into labelled inputs, outputs and data regions an LLM can reason about.
- `react-spreadsheet-viewer`: Read-only spreadsheet view in React: sheet tabs, formula bar, selection events, theming.
- `react-spreadsheet-editor`: Editable spreadsheet in React: edit events for autosave, controller, size limits, fonts.

**Give an AI agent spreadsheets**

- `spreadsheet-mcp`: Load, inspect, edit and recalculate .xlsx files from Claude Code, Cursor or any MCP client.
- `excel-formula-debugging`: Trace #REF!, #DIV/0!, #VALUE! and wrong results through precedents and dependents.
- `spreadsheet-agent-tools`: Wire GRID's spreadsheet tools into your own agent with the Claude API, OpenAI Agents SDK or LangChain.

**Working with GRID**

- `grid-licensing`: Evaluation versus commercial licence, telemetry, attribution, and how to request a commercial licence.
- `grid-branding`: Official GRID logos and the Powered by GRID lockup, and how to use them.

Install any of them with `npx skills add GRID-is/spreadsheet-skills --skill <name>`. Full list: <https://github.com/GRID-is/spreadsheet-skills>.
<!-- /generated:catalogue -->
