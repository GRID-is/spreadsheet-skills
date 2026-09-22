---
name: xlsx-cell-formatting
description: Format and style cells in Excel .xlsx workbooks from JavaScript or TypeScript with @grid-is/spreadsheet-engine. Bold headers, fonts, colours, fills, borders, alignment, number formats (currency, percent, dates), merged cells, column widths and row heights, named styles, threaded comments, notes, and Excel tables. Load this for any formatting change to a workbook the engine creates or edits, however small, because the engine's style object differs from ExcelJS and SheetJS. Use for "make the header row bold", "format a column as currency", "number format", "set column widths", "merge the title cells", "add a comment to a cell", "style the generated xlsx", "read a cell's style", or "why does my colour come out black". Also covers displaying values as Excel formats them outside the grid with numfmt.
compatibility: JavaScript and TypeScript, ESM only. Node 20+, Deno, Bun, or the browser.
---

# Cell formatting with the spreadsheet engine

Formatting in `@grid-is/spreadsheet-engine` is a JSF `Style` object on each cell. You write it with
`workbook.editCell(ref, { s: style })`, read it back from `cell.style`, and it round-trips through
`.xlsx` export and import. Colours, fonts, fills, borders, alignment and number formats all live in
the same object.

## Writing a style

```js setup
import { Model } from "@grid-is/spreadsheet-engine";

await Model.preconditions;
const model = Model.empty("report.xlsx");
const wb = model.getWorkbook("report.xlsx");

wb.editCell("A1", {
  v: "Revenue",
  s: {
    bold: true,
    fontSize: 12,
    fontFamily: "Arial",
    color: { type: "srgb", value: "FFFFFF" },
    fillColor: { type: "srgb", value: "1F4E79" },
    horizontalAlignment: "center",
    borderBottomStyle: "thin",
    borderBottomColor: { type: "srgb", value: "000000" },
  },
});
wb.editCell("B2", { v: 1234.5, s: { numberFormat: "#,##0.00" } });
wb.editCell("C2", { v: 0.185, s: { numberFormat: "0.0%" } });
```

Two rules that catch people out, both verified against v17.1:

- **Colours are objects**, `{ type: "srgb", value: "RRGGBB" }` without a `#`. A string such as
  `"#FF0000"` is accepted silently and stored as black.
- **Number formats go in `s.numberFormat`.** The `z` shortcut on `editCell` sets a display format in
  memory but is not written to the exported file. Use the style.

`editCell` with only `s` keeps the cell's value and formula. Pass `v` or `f` in the same call to set
them together.

## Style properties

From the JSF `Style` type (`@jsfkit/types`), which is what `s` accepts:

| Group | Properties |
|---|---|
| Font | `fontFamily`, `fontSize` (pixels), `bold`, `italic`, `underline`, `color`, `fontScheme` |
| Fill | `fillColor`, `patternColor`, `patternStyle` |
| Borders | `borderTopStyle`, `borderTopColor`, and the same for `Right`, `Bottom`, `Left`. Styles: `thin`, `medium`, `thick`, `dashed`, `dotted`, `double`, `hair`, `none`, and the dash-dot variants |
| Alignment | `horizontalAlignment`, `verticalAlignment`, `wrapText`, `shrinkToFit` |
| Numbers | `numberFormat` (an Excel format string) |
| Inheritance | `extendsStyle` (name of a named style) |

The generated `reference/styles-and-metadata.md` lists the engine's `CellStyle` view of the same
properties, using the CSF spelling with hyphens (`"font-name"`, `"fill-color"`). Use the camelCase
JSF spelling above when writing through `editCell`.

## Reading a style

```js run
const cell = model.readCell("=B2");
cell.style;        // { numberFormat: "#,##0.00", fontScheme: "minor", fontSize: 12, ... } or null
cell.z;            // the effective number format string, or null
```

To show a value the way Excel would render it outside the viewer, use the `numfmt` package:

```js run
import { format } from "numfmt";
const cell = model.readCell("=B2");
format(cell.z ?? "General", cell.v);     // "1,234.50"
```

## Named styles

Define a style once and reference it from many cells. Named styles are managed through
`wb.styles.named`:

```js run
wb.styles.named.add({ name: "Heading", bold: true, fontSize: 14 });
wb.editCell("A1", { s: { extendsStyle: "Heading" } });
wb.styles.named.update("Heading", { color: { type: "srgb", value: "4472C4" } });
wb.styles.named.rename("Heading", "Title");
wb.styles.named.delete("Title");
```

`wb.styles.defaultStyle` and `wb.styles.setDefaultStyle(style)` change what every unstyled cell
looks like, including the workbook default font.

## Layout

```js run
wb.mergeCells("Sheet1", "A1:D1");            // merged title; write to the top-left cell
wb.unmergeCells("Sheet1", "A1:D1");
wb.setColumnWidth("Sheet1", 0, 160);         // 0-based column, pixels
wb.setRowHeight("Sheet1", 0, 28);            // 0-based row, pixels
wb.columnWidth(1, "Sheet1");                 // read back, 1-based, pixels (Excel default 65)
wb.rowHeight(1, "Sheet1");                   // read back, 1-based, pixels (Excel default 16)
```

Frozen panes and the active sheet are on `wb.views` (see `WorkbookView` in the reference).

## Comments and notes

Threaded comments are the modern Excel comments; notes are the older cell-anchored kind.

```js run
const comment = wb.comments.add("Sheet1", { ref: "B2", text: "Check this figure", person: { name: "Reviewer" } });
wb.comments.getByCell("Sheet1", "B2");
wb.comments.update("Sheet1", comment.id, { resolved: true });
wb.comments.delete("Sheet1", comment.id);

wb.notes.add("Sheet1", { ref: "C2", text: "Unit price in EUR", author: "Reviewer" });
wb.notes.getByCell("Sheet1", "C2");
```

Both managers return copies; change state through `update` and `delete`, not by mutating results.

## Excel tables

A table gives the range a name, header semantics and structured references in formulas.

```js run
wb.tables.add({
  name: "Sales",
  ref: "Sheet1!A1:D20",                      // sheet-qualified, header row included
  columns: [{ name: "Item" }, { name: "Qty" }, { name: "Unit price" }, { name: "Total" }],
});
model.runFormula("=SUM(Sales[Total])");
wb.tables.getAll();
wb.tables.delete("Sales", { clearData: false });
```

Rows inserted or deleted inside the table adjust it automatically; edits that would break a table
throw `TableEditBlockedError`.

## Theme

`wb.theme` exposes the workbook theme: `getColorScheme`, `setColorScheme`, `getMajorFont`,
`setMajorFont`, `getMinorFont`, `setMinorFont`, and custom colours. Cells that reference theme
colours (`{ type: "scheme", ... }`) follow it.

## Reference files

- `reference/styles-and-metadata.md`: generated from the installed engine's type definitions.
  `CellStyle`, `StyleManager`, `NamedStyles`, `ThemeManager`, `CommentsManager`, `NotesManager`,
  `TableManager`, `Table`.

For writing values and formulas, export and everything else on `Model` and `Workbook`, see the
`spreadsheet-engine` skill. For building whole files, see `xlsx-generation`.

## Staying current

<!-- generated:versions -->
Written and verified against:

- `@grid-is/spreadsheet-engine@17.1.1`
<!-- /generated:versions -->

If the installed `@grid-is/spreadsheet-engine` is newer than the version above, grep
`node_modules/@grid-is/spreadsheet-engine/dist/index.d.ts` and the `Style` type in
`node_modules/@jsfkit/types/dist/index.d.ts`, and trust them over this file. Without an installed
copy, read <https://docs.grid.is/spreadsheet-engine/>.

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
- `spreadsheet-ai-assistant`: Chat panel next to an editable spreadsheet in React, both on one model: the agent edits what the user sees.

**Working with GRID**

- `grid-licensing`: Evaluation versus commercial licence, telemetry, attribution, and how to request a commercial licence.
- `grid-branding`: Official GRID logos and the Powered by GRID lockup, and how to use them.

Install any of them with `npx skills add GRID-is/spreadsheet-skills --skill <name>`. Full list: <https://github.com/GRID-is/spreadsheet-skills>.
<!-- /generated:catalogue -->
