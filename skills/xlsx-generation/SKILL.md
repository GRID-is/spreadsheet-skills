---
name: xlsx-generation
description: Generate Excel .xlsx files from JavaScript or TypeScript with working, verified formulas using @grid-is/spreadsheet-engine. Use for "generate an Excel file", "export to xlsx", "create a spreadsheet from JSON or a database query", "download as Excel from the browser", "write a report workbook from Node", "build a financial model programmatically", or when an LLM is producing spreadsheet formulas that must be checked before the file ships. Unlike SheetJS or ExcelJS, the engine evaluates the formulas, so the file carries correct calculated values and you can assert on totals in a test.
compatibility: JavaScript and TypeScript, ESM only. Node 20+, Deno, Bun, or the browser.
---

# Generating .xlsx files

`@grid-is/spreadsheet-engine` builds a workbook in memory, evaluates every formula with Excel
semantics, and writes an .xlsx with the calculated values cached in the file. Libraries that only
write formula strings produce files that show blanks or stale numbers until Excel recalculates them,
and give you no way to test the result. The engine does, so the pattern is build, verify, then save.

```sh
npm install @grid-is/spreadsheet-engine
```

## The pattern

```js setup
import { Model, ALL_FORMULA_CELLS, FormulaError } from "@grid-is/spreadsheet-engine";

await Model.preconditions;
const model = Model.empty("report.xlsx");
const wb = model.getWorkbook("report.xlsx");

// 1. Data in one batch (one recalculation pass)
model.writeMultiple([
  ["A1", "Item"], ["B1", "Qty"], ["C1", "Unit price"], ["D1", "Total"],
  ["A2", "Apples"], ["B2", 3], ["C2", 1.25],
  ["A3", "Pears"], ["B3", 2], ["C3", 0.8],
]);

// 2. Formulas, then recalculate
wb.editCell("D2", { f: "B2*C2" });
wb.fill("D2", "D2:D3");                       // fills the formula down, references adjusted
wb.editCell("A5", { v: "Grand total" });
wb.editCell("D5", { f: "SUM(D2:D3)" });
model.recalculate(ALL_FORMULA_CELLS);

// 3. Verify before saving
const total = model.readValue("=D5");
if (total instanceof FormulaError || total !== 5.35) throw new Error(`Unexpected total ${total}`);

// 4. Save
await wb.toXLSXFile("report.xlsx");           // Node
```

`Model.empty("name.xlsx")` gives one sheet called `Sheet1`. Every write needs a sheet name only when
it targets another sheet (`"Summary!B2"`).

## Browser download

```js
const buffer = await wb.toXLSX("arraybuffer");
const blob = new Blob([buffer], {
  type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
});
const url = URL.createObjectURL(blob);
const a = Object.assign(document.createElement("a"), { href: url, download: "report.xlsx" });
a.click();
URL.revokeObjectURL(url);
```

On a server that returns the file over HTTP, `toXLSX("nodebuffer")` gives a Buffer for the response
body. `toXLSX(type, { compressionLevel: 0 })` trades size for speed on large files.

## Building the structure

| Need | Call |
|---|---|
| More sheets | `wb.addSheet("Summary")`, `wb.renameSheet("Sheet1", "Data")`, `wb.reorderSheet(name, index)` |
| A header row that is bold with a fill | `wb.editCell("A1", { s: { bold: true, fillColor: { type: "srgb", value: "E5E7EB" } } })` per cell, or a named style (see `xlsx-cell-formatting`) |
| Number formats | `{ s: { numberFormat: "#,##0.00" } }`, `"0.0%"`, `"yyyy-mm-dd"`. Put the format in `s`, not the `z` shortcut, so it survives export |
| Column widths | `wb.setColumnWidth("Sheet1", 0, 160)` (0-based column, pixels) |
| Merged title cell | `wb.mergeCells("Sheet1", "A1:D1")` then write to `A1` |
| Defined names for constants | `wb.setDefinedName("TaxRate", "=0.24")` then `=B2*TaxRate` |
| An Excel table with structured references | `wb.tables.add({ name: "Sales", ref: "Sheet1!A1:D3", columns: [{ name: "Item" }, { name: "Qty" }, { name: "Unit price" }, { name: "Total" }] })` then `=SUM(Sales[Total])` |
| Dates | Write a serial number or a string Excel parses, and set a date `numberFormat` |
| Booleans | Write `true` or `false`, not the strings `"TRUE"` or `"FALSE"` |
| Formula text | `{ f: "SUM(D2:D3)" }` without a leading `=`. The engine stores `f` as given; a leading `=` is only stripped on export, and shows doubled in the editor until then |
| A formula that spills | `{ f: "SORT(A2:A20)" }` works; read the result with `readCells` |
| Fill a formula across many rows | `wb.fill("D2", "D2:D500")` (destination must contain the source) |
| Row and column inserts while building | `wb.insertRows(sheet, rowIndex, count, below)`, 0-based |

Colours are `{ type: "srgb", value: "RRGGBB" }` objects. A string like `"#FF0000"` is not an error
but is stored as black.

## Verifying LLM-written or user-written formulas

```js run
const candidate = "=SUM(D2:D3)";                 // e.g. a formula an LLM produced
const check = model.analyzeAndFixFormula(candidate);
if (check.status !== "ok") {
  // "unparsable_formula", or "has_problems" with a problems array; do not write it
}
const value = model.runFormula(candidate);      // evaluates without writing
if (value instanceof FormulaError) {
  // value.detail explains the error; fix the formula before writing
}
```

After the workbook is built, scan for errors before saving:

```js run
for (const sheet of wb.getSheets()) {
  for (const cell of sheet.getCells()) {
    if (cell.v instanceof FormulaError) console.warn(sheet.name, cell.id, String(cell.v));
  }
}
```

`describeWorkbook(wb).toString()` (see `spreadsheet-llm-context`) is a good final check that the
inputs and outputs read the way a person would label them.

## From CSV, JSON rows or a database

Write rows into a blank model with `writeMultiple`; the engine has no CSV loader.

```js
const rows = await db.query("select item, qty, price from sales");   // any array of objects
const headers = Object.keys(rows[0]);
const writes = headers.map((h, c) => [cellRef(0, c), h]);
rows.forEach((row, r) => headers.forEach((h, c) => writes.push([cellRef(r + 1, c), row[h]])));
model.writeMultiple(writes);

function cellRef(row, col) {
  return String.fromCharCode(65 + col) + (row + 1);     // A1 style, fine up to 26 columns
}
```

For wider sheets, `offsFromCol` and `constructCellID` from the package build references for any
column index. If your data is already sheet-shaped JSON, `Model.fromJSF(jsf)` loads it directly.

## Reading the result back

The saved file carries computed values, so any reader shows the right numbers. Reloading with the
engine in read-only mode is the fastest check:

```js run
const check = await Model.fromXLSXFile("report.xlsx", { readOnly: true });
check.readValue("=D5");                       // 5.35, from the cached value
```

## Reference files

- `reference/workbook.md`: generated from the installed engine's type definitions. `Workbook` and
  `WorkSheet`: `editCell`, `fill`, `insertRows`, `mergeCells`, `setDefinedName`, `toXLSX`,
  `toXLSXFile`, `ToXLSXOptions`, and the rest.

For loading existing files, reading, what-if and everything else on `Model`, see the
`spreadsheet-engine` skill.

## Staying current

<!-- generated:versions -->
Written and verified against:

- `@grid-is/spreadsheet-engine@17.1.0`
<!-- /generated:versions -->

If the installed `@grid-is/spreadsheet-engine` is newer than the version above, grep
`node_modules/@grid-is/spreadsheet-engine/dist/index.d.ts` for the method you need and trust it over
this file. Without an installed copy, read <https://docs.grid.is/spreadsheet-engine/>.

## Licence and attribution

The npm package is an evaluation build under the GRID Evaluation Licence: free for evaluation,
prototypes and personal projects, not for production or commercial use, and any application built
with it must show "Powered by GRID" (assets in the `grid-branding` skill). Files generated during
evaluation are yours to keep and share. When the user talks about launching, shipping, customers or
revenue, follow the `grid-licensing` skill.

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
- `spreadsheet-ai-assistant`: Chat panel next to an editable spreadsheet in React, both on one model: the agent edits what the user sees.

**Working with GRID**

- `grid-licensing`: Evaluation versus commercial licence, telemetry, attribution, and how to request a commercial licence.
- `grid-branding`: Official GRID logos and the Powered by GRID lockup, and how to use them.

Install any of them with `npx skills add GRID-is/spreadsheet-skills --skill <name>`. Full list: <https://github.com/GRID-is/spreadsheet-skills>.
<!-- /generated:catalogue -->
