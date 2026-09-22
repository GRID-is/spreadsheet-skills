<!-- GENERATED FILE. Do not edit by hand. Regenerate with `npm run sync`. -->

# @grid-is/agent-tools: tool catalogue

Generated from `@grid-is/agent-tools@0.3.3` by calling `createGridTools()`. 28 tools. Every tool operates on the active workbook, the one most recently loaded, created or selected. Parameter types are the JSON Schema derived from each tool's zod schema.

## Workbook lifecycle

### loadWorkbook

Load an .xlsx file into memory and make it the active workbook. A session starts with this or createWorkbook. Returns the sheet names.

| Parameter | Type | Required | Description |
|---|---|---|---|
| `path` | `string` | yes | Absolute or relative path to the .xlsx file. |

### createWorkbook

Create a blank single-sheet workbook in memory and make it the active workbook. Nothing is written to disk until saveWorkbook.

| Parameter | Type | Required | Description |
|---|---|---|---|
| `path` | `string` | yes | Path for the new .xlsx file. saveWorkbook writes it here by default. |

### saveWorkbook

Save the active workbook to an .xlsx file. Provide a new path, or set overwrite: true to write over an existing file (including the source).

| Parameter | Type | Required | Description |
|---|---|---|---|
| `path` | `string` | no | Output path. Defaults to the source path. |
| `overwrite` | `boolean` | no | Overwrite an existing file. Default false. |

### listWorkbooks

List all loaded workbooks and their sheet names.

No parameters. Call with an empty object.

### selectWorkbook

Make a previously loaded workbook the active one for all other spreadsheet tools. Switching keeps in-memory state, so unsaved edits survive. Use listWorkbooks to see what is loaded; use loadWorkbook to (re)load from disk.

| Parameter | Type | Required | Description |
|---|---|---|---|
| `path` | `string` | yes | Path of a previously loaded workbook, as shown by listWorkbooks. |

## Understand

### describeStructure

Analyzes the spreadsheet and returns a structured description of all data regions, headers, and labels.
This helps you understand:
- Where data tables are located (islands/regions)
- Which rows are headers vs data
- Column and row labels for each data region
- Sheet names and their contents
- Whether iterative calculation is on (needed for intentional circular references)

Labels are limited to 50 per sheet. Use totalLabels to check if more exist, and labelOffset to paginate.

Use this information to write accurate formulas that reference the correct cells and ranges.

| Parameter | Type | Required | Description |
|---|---|---|---|
| `sheets` | `string[]` | no | Optional: limit analysis to specific sheet names. If omitted, all sheets are analyzed. |
| `labelOffset` | `number` | no | Optional: skip N labels before returning up to 50. Use for pagination when totalLabels > 50. |

### generateWorkbookContext

Generate a comprehensive natural-language description of the active workbook: sheet structures, data regions, labels, and relationships. More detailed than describeStructure.

No parameters. Call with an empty object.

### symbols

Get workbook structural metadata: sheet dimensions, named ranges, tables, and dependency graph stats.
Complements describeStructure (which provides labels and data regions) with structural/entity information.

Use this to understand the workbook's overall shape before inspecting specific cells.

No parameters. Call with an empty object.

### viewRange

Render a worksheet rectangle as a compact text grid — by default the displayed (number-formatted) values, what a human sees in the cells — with column letters and row numbers.
Use this FIRST to scan or orient in an area (a financial statement, a block, a table): one call returns the whole rectangle instead of reading it cell-by-cell.
Pass `show` to audit other layers of the same grid: raw unformatted values, a style property ('-' marks unset cells), or the formula structure — formula cells get a legend key, identical fills share one key, so a miscolored cell, a wrong format, or a hardcoded override stands out against the value grid you just read.
For precedents/dependents or error provenance, use `inspect`.
Returns at most 500 cells; a larger rectangle renders the cells that fit and names the rows or columns that remain — request those in a follow-up call.

Examples:
- Range: { "reference": "B40:N80" }
- Sheet-qualified: { "reference": "'LBO Model'!B40:N80" }
- Single cell: { "reference": "C12" }
- Font colors: { "reference": "B40:N80", "show": "fontColor" }
- Formula structure: { "reference": "B40:N80", "show": "formula" }

| Parameter | Type | Required | Description |
|---|---|---|---|
| `reference` | `string` | yes | A1 range to view, sheet-qualified where needed (e.g. "'LBO Model'!B40:N80"). A single cell is allowed. |
| `show` | `"value" \| "rawValue" \| "fontColor" \| "fill" \| "numberFormat" \| "formula"` | no | What each cell renders. 'value' (default): formatted display values; a † marks a number whose format hides that it is numeric (a date, an accounting dash) — a legend below the grid explains it. 'rawValue': underlying unformatted values. 'fontColor'/'fill'/'numberFormat': that style property ('-' when unset; colors as lowercase hex for RGB, raw token for theme/preset/indexed colors). 'formula': formula cells render a short key like [1] with a legend below the grid — formulas are compared in R1C1 form, so a formula filled across a range shares one key and anomalies stand out; non-formula cells show their raw value, so hardcoded overrides stand out too. |

### captureRange

Render a range as a PNG image and return its raw bytes (Uint8Array).

Use this when the formatting itself is the information — fills, font colors, borders,
merged cells, number formats — that the text-grid tools (viewRange) can't convey, or when
the user asks to *see* part of the workbook. The bytes are ready to attach to a multimodal
message or write to a file; this tool does no LLM wiring itself.

Gridlines and row/column headers render as Excel shows them. Renders against the browser's
native canvas when available, and skia-canvas in Node.

| Parameter | Type | Required | Description |
|---|---|---|---|
| `reference` | `string` | yes | A1 range to capture, sheet-qualified where needed (e.g. "'LBO Model'!B40:N80"). A single cell is allowed. |
| `headers` | `boolean` | yes | Draw row/column headers (A, B, C … / 1, 2, 3 …). |
| `scale` | `number` | yes | Output pixel density for headless (Node/Worker) rendering — 2 = crisp/retina. Ignored on a browser main thread, where the display's devicePixelRatio governs. |

### inspect

Inspect detailed per-cell information including value, formula, number format, style, and hyperlink.
Returns up to 20 cells per call. When the range is larger, the response is truncated and includes `nextOffset` — call again with the same `reference` and `offset: <nextOffset>` to continue.

Examples:
- Single cell: { "reference": "A1" }
- Range: { "reference": "B2:C5" }
- Cross-sheet: { "reference": "Sheet2!A1" }
- Next page: { "reference": "A1:K10", "offset": 20 }

| Parameter | Type | Required | Description |
|---|---|---|---|
| `reference` | `string` | yes | Cell reference or range to inspect (e.g. 'A1', 'B2:C5', 'Sheet2!A1') |
| `offset` | `integer` | no | Pagination offset into the range (0-based, row-major). When the previous response had `nextOffset`, pass that value here to read the next page. |

### findCells

Search for cells matching specified criteria within a sheet or range. Returns up to 200 matches. Use matchMode to control whether all criteria must match (AND, default) or any (OR). Range iteration is limited to 10,000 cells — use sheet scope for larger searches.

| Parameter | Type | Required | Description |
|---|---|---|---|
| `sheet` | `string` | no | Restrict search to a single sheet by name. |
| `range` | `string` | no | Restrict search to an A1-style range, e.g. 'Sheet1!B2:D10' or 'B2:D10'. An unqualified range resolves against 'sheet' if given, otherwise the first sheet. Defined names are not accepted. Ranges larger than 10,000 cells are rejected. |
| `matchMode` | `"AND" \| "OR"` | no | "AND" = all criteria must match (narrows results). "OR" = any criterion matches (broader sweep). Defaults to "AND". |
| `hasFormula` | `boolean` | no | Match cells that have (true) or don't have (false) a formula. |
| `fillColor` | `string` | no | Match cells whose fill color matches this search term. Accepts hex values ("FFFF00", "#FF0000"), partial hex ("FF"), color family words ("yellow", "blue", "gray") which match by hue, specific color names ("light blue", "dark green") which match the nearest named color, and theme scheme names ("accent1"). Theme, indexed, and auto colors are resolved through the workbook theme. Case-insensitive. |
| `fontColor` | `string` | no | Match cells whose font color matches this search term. Accepts hex values ("0000FF", "#FF0000"), partial hex, color family words ("blue", "red", "gray") which match by hue, specific color names ("steel blue") which match the nearest named color, and theme scheme names ("accent1"). Theme, indexed, and auto colors are resolved through the workbook theme. Case-insensitive. Useful for auditing color-coding conventions (e.g. blue font = hardcoded input). |
| `formulaContains` | `string` | no | Match cells whose formula text contains this substring (case-insensitive). |
| `valueContains` | `string` | no | Match cells whose value (converted to text) contains this substring (case-insensitive). |
| `valueWithin` | `number[]` | no | Match cells whose numeric value falls within this inclusive range [min, max]. |

## Audit

### precedents

Trace upstream dependencies — the cells a formula reads from, transitively.
Default mode 'grouped': cells sharing a formula pattern are collapsed into labeled chunks,
labeled from nearby headers. This provides a token-efficient structural view that surfaces
which parameters feed into which outputs.

Switch to mode: "cells" to drill into individual cells: each node carries the formula,
calculated value, and error (e.g. #DIV/0!) so you can follow error propagation to its source.
Ranges referenced by formulas appear as 'range' nodes. If every range member is a leaf value
cell, the range is collapsed into a single node with no further children.

"grouped" response shape — each node carries:
- type: "output" (computed, no dependents), "inter" (computed, has dependents), "data" (value range), "param" (single value cell)
- labels: human-readable names derived from nearby headers
- formula: the formula pattern for this chunk (with relative references)
- rootHeight: dependency distance from graph roots (parameters/data)
- leafDepth: dependency distance from graph leaves (outputs)
- precedents: dict of upstream chunk nodes keyed by their ref (omitted for leaves)
- alreadyVisited: true when this chunk was expanded elsewhere in the tree (diamond/cycle cut)
- truncated: present when traversal stopped early; reason is "maxDepth" or "maxNodes"; totalChildren reports the real count when children were cut short

"cells" response shape — each node carries:
- kind: "cell", "range", or "name"
- formula: the formula string, or null for value cells and range vertices
- value: the calculated value (cell and name nodes)
- errorValue: present only when the cell evaluates to a formula error
- precedents: a dict of child nodes keyed by their own ref (omitted for leaves)
- alreadyVisited: true when this node has been fully expanded elsewhere in the tree (diamond/cycle cut)
- truncated: present when traversal stopped early; reason is "maxDepth" or "maxNodes"; totalChildren reports the real count when children were cut short

Both modes use maxDepth (default 10, max 50) to bound recursion and maxNodes (default 100, max 500) as a global budget on the returned tree.

| Parameter | Type | Required | Description |
|---|---|---|---|
| `reference` | `string` | yes | Cell reference to trace (e.g. 'C1', 'Sheet2!A1') |
| `mode` | `"cells" \| "grouped"` | yes | Output mode: 'grouped' (default) shows chunks of cells sharing a formula pattern, labeled from nearby headers — token-efficient for structure. 'cells' drills into individual cells. |
| `maxDepth` | `integer` | no | Maximum recursion depth through formula cells (default 10). Range expansion does not consume depth. |
| `maxNodes` | `integer` | no | Total node budget for the returned tree (default 100). When the budget is exhausted, the node whose children were cut is marked truncated with totalChildren; re-query a specific cell to drill deeper. |

### dependents

Trace downstream dependents — the cells that read from a given cell, transitively.
Default mode 'grouped': cells sharing a formula pattern are collapsed into labeled chunks,
labeled from nearby headers. This provides a token-efficient structural view that shows how
values flow from parameters through intermediate calculations to outputs.

Switch to mode: "cells" to drill into individual cells: each node carries the formula, value,
and error of the dependent cell so you can see exactly how a value propagates through the sheet.
When a formula uses a range, Apiary resolves range containment internally; the dependent formula
appears as a direct child of the queried cell rather than via an intermediate range node.

"grouped" response shape — each node carries:
- type: "output" (computed, no dependents), "inter" (computed, has dependents), "data" (value range), "param" (single value cell)
- labels: human-readable names derived from nearby headers
- formula: the formula pattern for this chunk (with relative references)
- rootHeight: dependency distance from graph roots (parameters/data)
- leafDepth: dependency distance from graph leaves (outputs)
- dependents: dict of downstream chunk nodes keyed by their ref (omitted for terminal outputs)
- alreadyVisited: true when this chunk was expanded elsewhere in the tree (diamond/cycle cut)
- truncated: present when traversal stopped early; reason is "maxDepth" or "maxNodes"; totalChildren reports the real count when children were cut short

"cells" response shape — each node carries:
- kind: "cell" or "name"
- formula: the formula string, or null for value cells
- value: the calculated value
- errorValue: present only when the cell evaluates to a formula error
- dependents: a dict of child nodes keyed by their own ref (omitted for leaves with no downstream consumers)
- alreadyVisited: true when this node has been fully expanded elsewhere in the tree (diamond/cycle cut)
- truncated: present when traversal stopped early; reason is "maxDepth" or "maxNodes"; totalChildren reports the real count when children were cut short

Both modes use maxDepth (default 10, max 50) to bound recursion and maxNodes (default 100, max 500) as a global budget on the returned tree.

| Parameter | Type | Required | Description |
|---|---|---|---|
| `reference` | `string` | yes | Cell reference to trace (e.g. 'C1', 'Sheet2!A1') |
| `mode` | `"cells" \| "grouped"` | yes | Output mode: 'grouped' (default) shows chunks of cells sharing a formula pattern, labeled from nearby headers — token-efficient for structure. 'cells' drills into individual cells. |
| `maxDepth` | `integer` | no | Maximum recursion depth through formula cells (default 10). Range expansion does not consume depth. |
| `maxNodes` | `integer` | no | Total node budget for the returned tree (default 100). When the budget is exhausted, the node whose children were cut is marked truncated with totalChildren; re-query a specific cell to drill deeper. |

### listErrors

List all formula errors and model errors in a workbook, grouped by error kind. Results are scoped to a sheet or range when provided, and truncated per group when the default cell limit is exceeded.

| Parameter | Type | Required | Description |
|---|---|---|---|
| `sheet` | `string` | no | Restrict to a single sheet by name. |
| `range` | `string` | no | Restrict to a range, e.g. 'Sheet1!B2:D10' or 'B2:D10' (resolved against the default/first sheet). Takes precedence over 'sheet' if both are given. |
| `max` | `integer` | no | Max cells listed per formula-error group (default 50). |

### getStyles

Get the workbook's style definitions. Returns styles where each index corresponds to a style_index in cell data. Use this to understand what formatting (colors, fonts, borders, etc.) is applied to cells.

If no indices are provided, returns all styles as an array.
If indices are provided, returns only those styles as an object keyed by index.

| Parameter | Type | Required | Description |
|---|---|---|---|
| `indices` | `number[]` | no | Optional array of style indices to fetch. If omitted, returns all styles. |

### getComments

List the cells in the workbook that have a comment or note attached, with author, kind (threaded comment vs. legacy note), reply count, and a short text preview. Comments are how a reviewer flags TODOs, justifies a number, or asks a question on a specific cell — read them when auditing, debugging, or completing a partly-built workbook. Returns up to 25 entries; pass `offset` to page. Use `getComment` to read the full text or thread for a specific cell.

| Parameter | Type | Required | Description |
|---|---|---|---|
| `sheet` | `string` | no | Restrict to a single sheet by name. Omit to list across the whole workbook. |
| `offset` | `integer` | no | Pagination offset; results are returned in pages of 25. |

### getComment

Read the full text of the comment or note on a specific cell, including all replies for threaded comments. Returns kind="none" if the cell has neither. Use after `getComments` to see the body of an entry whose preview was truncated, or when an agent message refers to a specific cell with a TODO/question on it.

| Parameter | Type | Required | Description |
|---|---|---|---|
| `address` | `string` | yes | Sheet-qualified cell reference, e.g. "'LBO Model'!E46" or "Sheet1!B2". For non-default sheets you must include the sheet name; otherwise the first sheet is assumed. |

## Edit

### editCells

Permanently write values or formulas to cells. Merge or unmerge cells.

IMPORTANT: After editing, you MUST call readCalculatedValues to see the resulting changes.
The tool returns a delta showing changes, but you should verify formulas propagated correctly.

Writing text over a cell that held a number or date is reported in `warnings` (level "high" or "low"). A "high" warning usually means a real value was turned into a text string that only looks the same — write the value itself, not its displayed text.

Examples:
- Set value: { "apply": [{ "target": "A1", "value": 100 }], "note": "Set initial value" }
- Set formula: { "apply": [{ "target": "B1", "value": "=A1*2" }], "note": "Add formula" }
- With style: { "apply": [{ "target": "A1", "value": 100, "styleIndex": 0 }], "styles": [{ "bold": true }], "note": "Bold value" }
- Merge cells: { "apply": [], "merge": ["A1:B2"], "note": "Merge header" }
- Unmerge: { "apply": [], "unmerge": ["A1:B2"], "note": "Unmerge cells" }

Formulas must start with "=". Values are auto-detected as number, boolean, or string.

| Parameter | Type | Required | Description |
|---|---|---|---|
| `apply` | `{ target: string, value?: string \| number \| boolean \| null, styleIndex?: number }[]` | yes | Array of cell edits to apply |
| `styles` | `{ bold?: boolean, borderBottomColor?: string, borderBottomStyle?: "none" \| "dashDot" \| "dashDotDot" \| "dashed" \| "dotted" \| "double" \| "hair" \| "medium" \| "mediumDashDot" \| "mediumDashDotDot" \| "mediumDashed" \| "slantDashDot" \| "thick" \| "thin", borderLeftColor?: string, borderLeftStyle?: "none" \| "dashDot" \| "dashDotDot" \| "dashed" \| "dotted" \| "double" \| "hair" \| "medium" \| "mediumDashDot" \| "mediumDashDotDot" \| "mediumDashed" \| "slantDashDot" \| "thick" \| "thin", borderRightColor?: string, borderRightStyle?: "none" \| "dashDot" \| "dashDotDot" \| "dashed" \| "dotted" \| "double" \| "hair" \| "medium" \| "mediumDashDot" \| "mediumDashDotDot" \| "mediumDashed" \| "slantDashDot" \| "thick" \| "thin", borderTopColor?: string, borderTopStyle?: "none" \| "dashDot" \| "dashDotDot" \| "dashed" \| "dotted" \| "double" \| "hair" \| "medium" \| "mediumDashDot" \| "mediumDashDotDot" \| "mediumDashed" \| "slantDashDot" \| "thick" \| "thin", fillColor?: string, fontColor?: string, fontName?: string, fontSize?: number, horizontalAlignment?: "general" \| "left" \| "center" \| "right" \| "fill" \| "justify" \| "centerContinuous" \| "distributed", italic?: boolean, numberFormat?: string, numberFormatFromFormula?: string, shrinkToFit?: boolean, underline?: "none" \| "single" \| "singleAccounting" \| "double" \| "doubleAccounting", verticalAlignment?: "bottom" \| "top" \| "center" \| "justify" \| "distributed", wrapText?: boolean }[]` | no | Array of style objects referenced by styleIndex in apply items |
| `note` | `string` | no | Description of this edit for version history |
| `merge` | `string[]` | no | Array of ranges to merge (e.g., ["A1:B2", "D4:E6"]). Each range must span at least 2 cells. |
| `unmerge` | `string[]` | no | Array of ranges to unmerge. Can specify exact merged range or any cell within a merge. |

### fillCells

Extend a selection by filling cells with auto-detected patterns (numbers, dates, formulas).
Similar to Excel's fill handle - detects sequences and continues them.
Fill direction is inferred from selection and extend_to: the dimension that changes determines the fill axis.

IMPORTANT: After filling, you MUST call editCellStyles to apply formatting to the filled cells.

Examples:
- Fill down: { "sheet": "Sheet1", "selection": "A1:A3", "extend_to": "A1:A10", "note": "Extend series" }
- Fill right: { "sheet": "Sheet1", "selection": "A1:C1", "extend_to": "A1:F1", "note": "Extend headers" }
- Fill up: { "sheet": "Sheet1", "selection": "A8:B10", "extend_to": "A1:B10", "note": "Extend upward" }

| Parameter | Type | Required | Description |
|---|---|---|---|
| `sheet` | `string` | yes | Sheet name to operate on |
| `selection` | `string` | yes | Source range containing the pattern (e.g., "A1:A3") |
| `extend_to` | `string` | yes | Target range to fill to (e.g., "A1:A10") |
| `note` | `string` | no | Description of this operation for version history |

### editCellStyles

Apply formatting styles to cells without changing values.

IMPORTANT: After using fillCells, you MUST call this to apply formatting to the filled range.

| Parameter | Type | Required | Description |
|---|---|---|---|
| `sheet` | `string` | yes | Sheet name to operate on |
| `apply` | `{ target: string, styles: { bold?: boolean, borderBottomColor?: string, borderBottomStyle?: "none" \| "dashDot" \| "dashDotDot" \| "dashed" \| "dotted" \| "double" \| "hair" \| "medium" \| "mediumDashDot" \| "mediumDashDotDot" \| "mediumDashed" \| "slantDashDot" \| "thick" \| "thin", borderLeftColor?: string, borderLeftStyle?: "none" \| "dashDot" \| "dashDotDot" \| "dashed" \| "dotted" \| "double" \| "hair" \| "medium" \| "mediumDashDot" \| "mediumDashDotDot" \| "mediumDashed" \| "slantDashDot" \| "thick" \| "thin", borderRightColor?: string, borderRightStyle?: "none" \| "dashDot" \| "dashDotDot" \| "dashed" \| "dotted" \| "double" \| "hair" \| "medium" \| "mediumDashDot" \| "mediumDashDotDot" \| "mediumDashed" \| "slantDashDot" \| "thick" \| "thin", borderTopColor?: string, borderTopStyle?: "none" \| "dashDot" \| "dashDotDot" \| "dashed" \| "dotted" \| "double" \| "hair" \| "medium" \| "mediumDashDot" \| "mediumDashDotDot" \| "mediumDashed" \| "slantDashDot" \| "thick" \| "thin", fillColor?: string, fontColor?: string, fontName?: string, fontSize?: number, horizontalAlignment?: "general" \| "left" \| "center" \| "right" \| "fill" \| "justify" \| "centerContinuous" \| "distributed", italic?: boolean, numberFormat?: string, numberFormatFromFormula?: string, shrinkToFit?: boolean, underline?: "none" \| "single" \| "singleAccounting" \| "double" \| "doubleAccounting", verticalAlignment?: "bottom" \| "top" \| "center" \| "justify" \| "distributed", wrapText?: boolean } }[]` | yes | Array of style applications |
| `note` | `string` | no | Description of this operation for version history |

### manageSheets

Add, remove, rename, or change visibility of sheets.
Operations are executed in order: add → rename → setVisibility → remove.

| Parameter | Type | Required | Description |
|---|---|---|---|
| `add` | `{ name: string }` | no | Add a new sheet |
| `remove` | `{ sheet: string }` | no | Remove a sheet |
| `rename` | `{ sheet: string, name: string }` | no | Rename a sheet |
| `setVisibility` | `{ sheet: string, hidden: "visible" \| "hidden" \| "veryHidden" }` | no | Set sheet visibility |
| `note` | `string` | no | Description of this operation for version history |

### manageRowsAndColumns

Insert, delete, or auto-size rows and columns.
Operations are executed in order: column insert → column delete → row insert → row delete → column autosize → row autosize.

| Parameter | Type | Required | Description |
|---|---|---|---|
| `columns` | `{ insert?: { column: string, count: number }, delete?: { column: string, count: number }, autoSize?: string[] }` | no | Column operations |
| `rows` | `{ insert?: { row: number, count: number }, delete?: { row: number, count: number }, autoSize?: number[] }` | no | Row operations |
| `sheet` | `string` | yes | Sheet name to operate on |
| `note` | `string` | no | Description of this operation for version history |

## Model

### readCalculatedValues

Read cell values, formula results, and lookups from spreadsheets, and optionally apply temporary values for what-if calculations.
The 'read' array accepts cell references, ranges, and formulas. Use formulas like XLOOKUP, QUERY, AVERAGE, etc. directly in 'read' to find and compute values in a single call.

Examples:
- Read cells: { "read": ["A1", "B1:B10", "Sheet2!C5"] }
- Lookup: { "read": ["=XLOOKUP(\"Revenue\", A1:A10, B1:B10)"] }
- Filtered average: { "read": ["=QUERY(Sheet1!A1:D100, \"SELECT AVG(D) WHERE A = 'Category1'\")"] }
- What-if: { "read": ["C8"], "apply": [{ "cell": "B1", "value": 100 }] }

Large ranges are automatically truncated. When a range entry is truncated the response includes `nextOffset` — call again with `cursors: { "<same expression>": <nextOffset> }` to read the next page.

| Parameter | Type | Required | Description |
|---|---|---|---|
| `read` | `string[]` | yes | Cell references, ranges, or formulas to read. Examples: "A1", "B1:B10", "Sheet1!C5", "=XLOOKUP(\"Revenue\", A1:A10, B1:B10)", "=AVERAGE(C1:C10)" |
| `apply` | `{ cell: string, value: string \| number \| boolean \| null }[]` | no | Temporary values to apply before reading (not persisted) |
| `cursors` | `object` | no | Optional pagination cursors keyed by entries in `read`. Pass `nextOffset` from a previous truncated response to continue paging through that range. Formula entries (those starting with `=`) ignore cursors. |

### runFormula

Run one or more formulas without writing to any cell. Returns the calculated results.
Useful for testing formulas or computing values without modifying the workbook.

Examples:
- Single: { "formula": "=SUM(A1:A10)" }
- Batch: { "formulas": ["=SUM(A1:A10)", "=AVERAGE(B1:B10)", "=COUNT(C1:C10)"] }
- With temp values: { "formula": "=A1*B1", "apply": [{ "cell": "A1", "value": 5 }] }
- Against a specific sheet: { "formula": "=SUM(A:A)", "sheet": "Sheet2" }

Use "formulas" array to test multiple formulas in one call (more efficient than multiple calls).

Bare cell references (e.g. A1, SUM(A:A)) resolve against the primary workbook's first sheet
by default. Use the "sheet" parameter when you need them to resolve against a different sheet.
The response includes a "_note" field identifying the sheet bare references resolved
against, so you can verify they resolved where you intended.

Sheets in external (linked) workbooks can be read with workbook-qualified references inside
the formula itself, e.g. ='[external.xlsx]Sheet1'!A1. If an external sheet shares its name
with a sheet in the primary workbook, the primary workbook's sheet always wins for plain
references — only the workbook-qualified form reaches the external one.

| Parameter | Type | Required | Description |
|---|---|---|---|
| `apply` | `{ cell: string, value: string \| number \| boolean \| null }[]` | no | Optional temporary values to apply before running formula(s) |
| `formula` | `string` | no | Single formula to evaluate (must start with "=") |
| `formulas` | `string[]` | no | Array of formulas to evaluate (more efficient for multiple formulas) |
| `sheet` | `string` | no | Sheet name against which bare cell references (e.g. A1, SUM(A:A)) resolve. Defaults to the primary workbook's first sheet. Use this when you need formulas to evaluate in the context of a different sheet. Sheet names are matched across all workbooks in the model; on a name collision the primary workbook's sheet wins, so external sheets with colliding names are only reachable via workbook-qualified references in the formula itself. |

### goalSeek

Find the input value needed to achieve a target result (like Excel's Goal Seek).
Iteratively adjusts the control cell until the target cell reaches the desired value.

| Parameter | Type | Required | Description |
|---|---|---|---|
| `write` | `{ cell: string, value: string \| number \| boolean \| null }[]` | yes | Values to write before goal seeking |
| `goalSeek` | `{ targetCell: string, targetValue: number, controlCell: string }` | yes | Goal seek parameters |
| `persist` | `boolean` | no | Whether to persist the solved control cell (and any pre-seek writes) to the workbook. Defaults to false: a pure calculation that reports the solution without changing the model. |

### whatIf

Test hypothetical value changes and see which formula cells are affected.
Applies temporary changes, recalculates, shows before/after diff of affected formula cells,
then restores the original state. A string value starting with "=" is applied as a temporary
formula. Max 20 changes, max 100 affected cells reported.

Example: { "changes": { "A1": 50, "B1": "=A1*2" } }

| Parameter | Type | Required | Description |
|---|---|---|---|
| `changes` | `object` | yes | Map of cell references to hypothetical values (e.g. { 'A1': 50, 'B1': 100 }) |

## Escape hatch

### executeOfficeJs

Execute an Office.js code snippet directly against the active workbook. Returns any error plus the list of Office.js APIs the code used that are not yet implemented. Edits synced before a script error remain applied.

| Parameter | Type | Required | Description |
|---|---|---|---|
| `code` | `string` | yes | Office.js JavaScript to run against the active workbook. `context` (RequestContext) and `Excel` are in scope; call `await context.sync()` to flush writes. |
