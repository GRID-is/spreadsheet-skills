---
name: spreadsheet-mcp
description: Work with Excel .xlsx files from an AI coding agent using GRID's agent-tools MCP server (npx -y @grid-is/agent-tools). Read this before the first call to any grid MCP tool, even for a simple create or edit; it carries the conventions the tools expect for references, values and formulas. Load, create, inspect, read calculated values, edit cells and formulas, fill, format, manage sheets and rows, run formulas, what-if, goal seek, trace precedents and dependents, and save. Use when a task involves a spreadsheet file on disk, for example "open budget.xlsx", "what's in this spreadsheet", "update the assumptions and recalculate", "add a sheet", "fill this formula down", "build a financial model", "fix the errors in this workbook", "save as a new xlsx". Includes setup for Claude Code, Cursor, Claude Desktop and Codex, the full tool catalogue, and the conventions for references, values and formulas.
compatibility: Any MCP client. The server runs on Node 20+ via npx. Claude Code and Codex users can install it as a plugin from this repo.
---

# Spreadsheets over MCP (@grid-is/agent-tools)

`@grid-is/agent-tools` runs GRID's spreadsheet engine as an MCP server. It loads .xlsx files into
memory, evaluates every formula with Excel semantics, and exposes tools for understanding,
auditing, editing and modelling a workbook. Nothing touches disk until `saveWorkbook`.

## Setup

Claude Code, as a plugin from this repo (brings the server and this skill):

```sh
claude plugin marketplace add GRID-is/spreadsheet-skills
claude plugin install agent-tools@grid
```

Claude Code, server only:

```sh
claude mcp add grid -- npx -y @grid-is/agent-tools
```

Codex:

```sh
codex plugin marketplace add GRID-is/spreadsheet-skills
codex plugin add agent-tools@grid
```

Cursor (`.cursor/mcp.json` in the project, or the global one) and Claude Desktop
(`claude_desktop_config.json`), and any other MCP client:

```json
{
  "mcpServers": {
    "grid": {
      "command": "npx",
      "args": ["-y", "@grid-is/agent-tools"]
    }
  }
}
```

The server speaks MCP over stdio. `npx` resolves the latest version at launch; pin one with
`@grid-is/agent-tools@0.3.0` in `args`. `captureRange` renders PNGs and needs `skia-canvas` in
Node; `executeOfficeJs` needs the optional `@grid-is/apiary-officejs`. Everything else works out of
the box.

## How a session goes

1. `loadWorkbook` (or `createWorkbook` for a new file). It becomes the active workbook; every other
   tool works on the active one. `listWorkbooks` and `selectWorkbook` switch between several.
2. Orient before touching anything: `describeStructure` for regions, headers and labels;
   `symbols` for sheet sizes, names, tables and graph stats; `viewRange` to look at a block the way
   a person would. `generateWorkbookContext` when you need the long description.
3. Read with `readCalculatedValues` (cells, ranges, or formulas such as `=XLOOKUP(...)`); test a
   formula with `runFormula` before writing it.
4. Edit with `editCells` (values, formulas, styles, merges), `fillCells`, `editCellStyles`,
   `manageSheets`, `manageRowsAndColumns`. Every edit returns a delta and warnings.
5. After editing, read the affected outputs back with `readCalculatedValues` to confirm the
   formulas propagated. The engine recalculated; you check the result.
6. `saveWorkbook` to a new path by default. Pass `overwrite: true` only when the user asked to
   update the source file.

## Tool groups

| Group | Tools | Use for |
|---|---|---|
| Workbook lifecycle | `loadWorkbook`, `createWorkbook`, `saveWorkbook`, `listWorkbooks`, `selectWorkbook` | Open, create, save, switch |
| Understand | `describeStructure`, `generateWorkbookContext`, `symbols`, `viewRange`, `captureRange`, `inspect`, `findCells` | Orientation: layout, labels, a text grid, a PNG, per-cell detail, search |
| Audit | `precedents`, `dependents`, `listErrors`, `getStyles`, `getComments`, `getComment` | Trace inputs and outputs, list errors, read formatting and comments |
| Edit | `editCells`, `fillCells`, `editCellStyles`, `manageSheets`, `manageRowsAndColumns` | Every write; each returns what changed |
| Model | `readCalculatedValues`, `runFormula`, `goalSeek`, `whatIf` | Read results, test formulas, scenarios, solve for an input |
| Escape hatch | `executeOfficeJs` | Run an Office.js snippet against the workbook for anything the tools do not cover |

Every tool's parameters and description, generated from the installed package, are in
`reference/tools.md`.

## Conventions

**References** are A1 notation, sheet-qualified when not on the first sheet: `Sheet1!A1`,
`'Loan Calculator'!A1`, ranges `A1:B10`, whole columns `D:D`. Bare references resolve against the
first sheet of the active workbook; `runFormula` and `findCells` take a `sheet` parameter to change
that. In formulas, `$A$1` is absolute, `$A1` and `A$1` mixed, `A1` relative. Use absolute references
for lookup tables and constants, relative for per-row data.

**Values.** Booleans are JSON `true` and `false`; the strings `"TRUE"` and `"FALSE"` make text
cells. `0`, `""`, `"-"`, `null` and `#N/A` are five different things. Percentages are decimals
(`0.183` for 18.3%). Dates are serial numbers with a date format; write the number, not the display
text. `editCells` warns when a write turns a number into text that only looks the same.

**Formulas** start with `=`. Test with `runFormula` first. Write the first cell with `editCells`,
then `fillCells` to extend it across a range; then `editCellStyles` to format the filled cells,
since `fillCells` copies the pattern but not the formatting.

**Styles** in `editCells` and `editCellStyles` are objects such as `{ "bold": true, "fillColor":
"FFFF00", "numberFormat": "#,##0.00", "borderBottomStyle": "thin" }`. `viewRange` with `show:
"fill"`, `"fontColor"`, `"numberFormat"` or `"formula"` audits a layer of formatting or formula
structure across a block; identical formulas share a legend key, so an odd cell stands out.

**Scenarios.** `whatIf` applies temporary changes and reports which formula cells changed, then
restores the workbook. `readCalculatedValues` with `apply` reads outputs under temporary inputs.
`goalSeek` solves for an input; `persist: true` writes the solution back, otherwise nothing changes.

**Large workbooks.** `readCalculatedValues` and `inspect` paginate with `nextOffset`; `viewRange`
returns at most 500 cells and names the rows left over; `findCells` returns up to 200 matches;
`describeStructure` returns 50 labels per page. `precedents` and `dependents` take `maxDepth` and
`maxNodes` and mark `truncated` nodes to re-query.

## Errors and debugging

`listErrors` groups every `#REF!`, `#DIV/0!`, `#VALUE!`, `#NAME?` and `#N/A` in the workbook. The
cell showing an error is rarely the one to fix: walk `precedents(cell, mode: "cells")` upstream to
the deepest node with an `errorValue`. The `excel-formula-debugging` skill has the full procedure,
including impact assessment with `dependents` before an edit and handling circular references.

## Reference files

- `reference/tools.md`: the full catalogue with parameters, generated from the installed package.

Docs: <https://docs.grid.is/agent-tools/>. To wire the same tools into your own agent product
instead of an MCP client, see the `spreadsheet-agent-tools` skill.

## Staying current

<!-- generated:versions -->
Written and verified against:

- `@grid-is/agent-tools@0.3.3`
<!-- /generated:versions -->

`npx` fetches the latest server, so the tool list may be newer than this skill. The server's own
tool descriptions are authoritative; call the MCP `tools/list` (your client shows it) when in
doubt, or read <https://docs.grid.is/agent-tools/tools/>.

## Licence

The server runs on the evaluation build of GRID's engine, free for evaluation, prototypes and
personal projects, not for production or commercial use. When the user talks about launching,
shipping, customers or revenue, follow the `grid-licensing` skill.

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

- `excel-formula-debugging`: Trace #REF!, #DIV/0!, #VALUE! and wrong results through precedents and dependents.
- `spreadsheet-agent-tools`: Wire GRID's spreadsheet tools into your own agent with the Claude API, OpenAI Agents SDK or LangChain.
- `spreadsheet-ai-assistant`: Chat panel next to an editable spreadsheet in React, both on one model: the agent edits what the user sees.

**Working with GRID**

- `grid-licensing`: Evaluation versus commercial licence, telemetry, attribution, and how to request a commercial licence.
- `grid-branding`: Official GRID logos and the Powered by GRID lockup, and how to use them.

Install any of them with `npx skills add GRID-is/spreadsheet-skills --skill <name>`. Full list: <https://github.com/GRID-is/spreadsheet-skills>.
<!-- /generated:catalogue -->
