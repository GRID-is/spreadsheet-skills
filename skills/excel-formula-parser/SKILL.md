---
name: excel-formula-parser
description: Parse, validate and introspect Excel and Google Sheets formulas in JavaScript or TypeScript with @grid-is/spreadsheet-engine. List every supported worksheet function per mode, parse a formula into an AST, check a user's or an LLM's formula before saving it, detect volatile functions, evaluate a formula against a workbook without writing it, and rewrite references after cells move. Use for "which Excel functions are supported", "validate this formula", "build a formula bar with autocomplete", "parse an Excel formula to an AST", "is this formula volatile", "Google Sheets formulas in JavaScript", or "check LLM-generated formulas".
compatibility: JavaScript and TypeScript, ESM only. Node 20+, Deno, Bun, or the browser.
---

# Formula parsing and validation

`@grid-is/spreadsheet-engine` exposes the pieces of its formula language separately from workbook
calculation: the function catalogue, the parser, the volatile set, and validation that runs a
formula against a model without writing it. Together they cover formula bars, linting, autocomplete
and checking generated formulas.

```sh
npm install @grid-is/spreadsheet-engine
```

Everything below needs `await Model.preconditions` once; the parser loads asynchronously.

## Which functions are supported

```js setup
import { Model, functionSignatures, MODE_EXCEL, MODE_GOOGLE } from "@grid-is/spreadsheet-engine";

await Model.preconditions;
const excel = functionSignatures(MODE_EXCEL);       // { SUM: [...], XLOOKUP: [...], ... }
const google = functionSignatures(MODE_GOOGLE);
const all = functionSignatures();                   // every function in any mode

Object.keys(excel).length;                          // 467 in v17.1
Object.keys(google).length;                         // 500 in v17.1
"QUERY" in google;                                  // true; Google Sheets only
"XLOOKUP" in excel && "LET" in excel && "LAMBDA" in excel;   // true
```

The result is an object keyed by upper-case function name. Each value is an array of signature
records; in the evaluation build of v17.1 each record carries the `mode` bit the signature applies
to, and no argument metadata. Use the keys for autocomplete and for "is this function supported"
checks. Do not assume argument descriptions are present without checking the installed version.

## Parse a formula to an AST

```js run
import { parseFormula } from "@grid-is/spreadsheet-engine";

parseFormula('=IF(A1>1,SUM(B1:B3),"x")');
// {
//   call: "IF",
//   args: [
//     { binop: ">", args: [{ cell: "A1" }, 1] },
//     { call: "SUM", args: [{ range: [{ cell: "B1" }, { cell: "B3" }] }] },
//     "x",
//   ],
// }
```

`parseFormula` is `null` until `Model.preconditions` resolves. Node shapes seen in v17.1: `call`
with `args`, `binop` with `args`, `cell`, `range` (two cell endpoints), and literals as plain
values. Walk the tree to collect referenced cells, called functions, or to render syntax
highlighting. A syntax error throws.

## Validate before writing

`analyzeAndFixFormula` parses, resolves references against a loaded model, checks every function is
supported, and evaluates. Use it for user input and for LLM-generated formulas.

```js setup
const model = await Model.fromXLSXFile("model.xlsx");

model.analyzeAndFixFormula("=SUM(B2:B4)");
// { status: "ok", formula: "=SUM(B2:B4)", result: 17, references: [...], functions: ["SUM"] }

model.analyzeAndFixFormula("=SUMM(B2:B4)");
// { status: "has_problems", problems: [{ type: "uses_unsupported_functions", unsupportedFunctions: ["SUMM"] }] }

model.analyzeAndFixFormula("=SUM(B2:B4");
// { status: "unparsable_formula" }
```

Pass `{ sheetName }` to resolve unqualified references against a sheet other than the first. The
`formula` field in an `ok` result is the normalised formula to store. `analyzeFormula` is the
deprecated name for the same call.

## Evaluate without writing

```js run
import { FormulaError } from "@grid-is/spreadsheet-engine";

const value = model.runFormula("=XLOOKUP(\"Pears\", A2:A100, D2:D100)");
if (value instanceof FormulaError) {
  String(value);        // "#N/A"
  value.detail;         // often a specific message
}
```

`runFormula` accepts the formula with or without the leading `=`, caches results by formula text,
and returns a value, a `FormulaError`, or a matrix for array results. Cross-sheet and cross-workbook
references work: `=[budget.xlsx]Sheet1!A1`.

## Volatile functions

```js run
import { VOLATILES } from "@grid-is/spreadsheet-engine";
VOLATILES.has("NOW");       // true; NOW, TODAY, RAND, RANDARRAY, RANDBETWEEN and others
```

Volatile functions recalculate on every pass. `model.recalculate(CHANGED_ONLY)` skips them, and
`WriteOptions.skipVolatiles` skips them for one write.

## Rewriting references

```js run
model.rewriteFormulaAfterMove("=SUM(Sheet1!A1:A3)", "Sheet1!A1:A3", "Sheet1!C5:C7");
```

Returns the formula adjusted for a range move. Structural edits on the workbook (`insertRows`,
`deleteColumns`, `moveCells`, `reorderRows`) rewrite the workbook's own formulas automatically and
return a `RewriteFormula` function for formulas in other workbooks of the same model. The lower-level
`getReplaceSheetReferencesFn`, `getReplaceTableReferencesFn` and `getReplaceWorkbookFn` are in the
reference file.

## Excel and Google Sheets modes

The engine implements both function sets and both sets of evaluation rules. A loaded .xlsx picks
the mode of its originating application, usually Excel. Pin a different one with the `mode` option
the loaders and `addWorkbook` take. `Model.empty` takes only a filename, so there is no mode
option to pass there.

```js standalone
import { Model, MODE_EXCEL, MODE_GOOGLE } from "@grid-is/spreadsheet-engine";

await Model.preconditions;

// Excel, from the file's originating application
const fromFile = await Model.fromXLSXFile("model.xlsx");
fromFile.getWorkbook("model.xlsx").mode === MODE_EXCEL;    // true

// Google Sheets, pinned on the loader
const google = await Model.fromXLSXFile("model.xlsx", { mode: MODE_GOOGLE });
google.getWorkbook("model.xlsx").mode === MODE_GOOGLE;     // true
```

`MODE_EXCEL`, `MODE_GOOGLE`, `MODE_GRID_SHEET` and `MODE_ALL` are exported constants. Functions such
as `QUERY` and `ARRAYFORMULA` are in the Google set only. A cell formula evaluates in its own
workbook's mode. `model.runFormula` evaluates at the model level, which is `MODE_GRID_SHEET`.

## Building a formula bar

1. Autocomplete from `Object.keys(functionSignatures(mode))`.
2. On each keystroke, try `parseFormula` inside try/catch for syntax highlighting; on failure keep
   the previous highlight.
3. On commit, run `model.analyzeAndFixFormula` and refuse `unparsable_formula` and `has_problems`
   with a message built from `problems`.
4. Write with `workbook.editCell(ref, { f: result.formula })` and `model.recalculate(ALL_FORMULA_CELLS)`.

The React editor package (`react-spreadsheet-editor` skill) ships a formula bar already; this is for
custom UIs.

## Reference files

- `reference/formulas.md`: generated from the installed engine's type definitions.
  `functionSignatures`, `parseFormula`, `formulaParserReady`, `VOLATILES`, the `MODE_*` and
  `TYPE_*` constants, reference-rewrite helpers, `FormulaSyntaxError`, `EvaluationError`.

For loading workbooks and everything else on `Model`, see the `spreadsheet-engine` skill.

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
