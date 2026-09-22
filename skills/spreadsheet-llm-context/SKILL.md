---
name: spreadsheet-llm-context
description: Turn an Excel workbook into text an LLM can reason about, with GRID's spreadsheet engine and agent tools. describeWorkbook labels the inputs (parameters), the calculated outputs and the data regions of a workbook using nearby headers, and renders a plain-text summary for a prompt. Use for "make this spreadsheet readable to an LLM", "extract the labels and inputs from an xlsx", "summarise a workbook for a prompt", "what are the inputs and outputs of this model", "RAG over spreadsheets", "spreadsheet to JSON for an AI", or when building any LLM feature on top of user-uploaded Excel files.
compatibility: JavaScript and TypeScript, ESM only. Node 20+, Deno, Bun, or the browser.
---

# Workbooks as LLM context

Dumping cells into a prompt gives the model A1 addresses and numbers with no meaning. GRID's engine
does the work a human does when opening an unfamiliar file: it finds the labels next to values,
separates inputs from calculated outputs, and groups cells into data islands with headers. The
result is short, labelled and stable across similar workbooks.

Two ways to get it:

- **In code**: `describeWorkbook` from `@grid-is/spreadsheet-engine`.
- **From an agent**: the `describeStructure` and `generateWorkbookContext` tools in
  `@grid-is/agent-tools`, which run the same analysis over MCP (see `spreadsheet-mcp`).

## describeWorkbook in code

```js setup
import { Model, describeWorkbook } from "@grid-is/spreadsheet-engine";

await Model.preconditions;
const model = await Model.fromXLSXFile("loan.xlsx");
const wb = model.getWorkbook("loan.xlsx");

const description = describeWorkbook(wb);
console.log(description.toString());
```

Output for a small loan calculator, verified against v17.1:

```
The native spreadsheet "loan.xlsx" contains these sheets:
* "Sheet1" with 18 cells, all numbers and strings (11 numbers, 7 strings), 5 formulas of average length 11, spanning 6 rows and 5 columns
It has 3 apparent calculated values/ranges:
* Total paid: with size 1x1 and reference to range Sheet1!B6
* Annual rate, Years, Interest: with size 3x1  and reference to range Sheet1!E2:E4
* Monthly payment: with size 1x1 and reference to range Sheet1!B5
and 3 apparent inputs:
* Loan amount: B1 with value 250000
* Annual rate: B2 with value 0.045
* Years: B3 with value 30
```

That text is ready to paste into a system prompt. The structured form is on `description.summary`:

```js run
description.summary.parameters;
// [{ labels: ["Loan amount"], reference: "B1", referenceLabel: "B1", value: "250000", type: "slider" }, ...]
description.summary.calculated;
// [{ labels: ["Monthly payment"], reference: "B5", referenceLabel: "B5", type: "text" }, ...]
description.summary.description;   // the sheet inventory paragraph
```

Other members of `WorkbookDescription`:

| Member | What it gives |
|---|---|
| `parameters` | Input cells with their labels, as `Parameter` objects |
| `calculated` | Output chunks: contiguous formula cells with the same pattern, labelled |
| `sheets` | Per-sheet data regions (islands) with detected header labels |
| `names` | Defined names with descriptions |
| `labels` | Every label found and the cells it applies to |
| `totalFormulas` | Count of formula cells |
| `getCellLabel(cell)` | Best label for one cell, e.g. `"Monthly payment"` |
| `getParameter(cell)`, `getCalculated(cell)` | Whether a cell is an input or an output, with details |
| `extractAllText()` | Every string in the workbook, for search or embeddings |

Pass options as the second argument: `{ recognize2dTables: true }` treats row-and-column headed
blocks as tables. Run the description once per workbook and cache it; it walks the dependency
graph.

## A prompt-building pattern

```js run
const d = describeWorkbook(wb);
const inputs = d.summary.parameters.map((p) => `${p.labels.join(" / ")} (${p.reference}) = ${p.value}`);
const outputs = d.summary.calculated.map((c) => `${c.labels.join(" / ")} (${c.reference})`);

const system = [
  "You are answering questions about a spreadsheet model.",
  d.summary.description,
  "Inputs:", ...inputs,
  "Outputs:", ...outputs,
  "To change an input or read an output, call the tool with the reference in parentheses.",
].join("\n");
```

Then give the model two tools that call `model.write(reference, value)` and
`model.readValue("=" + reference)`, and it can run scenarios by label instead of guessing cell
addresses. The `spreadsheet-what-if` skill covers snapshots so scenarios do not stick.

## Explaining a single formula

`model.analyzeAndFixFormula(formula)` returns the references and functions a formula uses, and
`description.getCellLabel` turns each reference into words:

```js run
const cell = model.readCell("=B5");
const analysis = model.analyzeAndFixFormula(cell.f, { sheetName: "Sheet1" });
if (analysis.status === "ok") {
  const named = analysis.references.map((ref) => description.getCellLabel(model.readCell("=" + String(ref))));
  // "=-PMT(B2/12,B3*12,B1)" depends on: Annual rate, Years, Loan amount
}
```

## From an agent, over MCP

With `@grid-is/agent-tools` running (`npx -y @grid-is/agent-tools`), the same analysis is two
tools:

- `describeStructure`: sheets, data regions, header rows, and up to 50 labels per sheet (paginate
  with `labelOffset`). Call it first on any unfamiliar file.
- `generateWorkbookContext`: the fuller natural-language description, including formula context.
  More tokens, more detail.
- `viewRange` renders a rectangle as a text grid, and `precedents` in `grouped` mode returns the
  labelled input-to-output graph. See `spreadsheet-mcp` for setup and `excel-formula-debugging`
  for tracing.

## Values as the user sees them

For prompts that quote numbers, format them the way Excel does so "0.045" reads as "4.5%":

```js run
import { format } from "numfmt";
const cell = model.readCell("=B2");
const shown = format(cell.z ?? "General", cell.v);
if (shown !== "4.5%") throw new Error(`Expected 4.5%, got ${shown}`);
```

## Reference files

- `reference/describe-workbook.md`: generated from the installed engine's type definitions.
  `describeWorkbook`, `WorkbookDescription`, `Parameter`.

For loading files and reading cells, see the `spreadsheet-engine` skill.

## Staying current

<!-- generated:versions -->
Written and verified against:

- `@grid-is/spreadsheet-engine@17.1.1`
- `@grid-is/agent-tools@0.3.3`
<!-- /generated:versions -->

If the installed `@grid-is/spreadsheet-engine` is newer than the version above, grep
`node_modules/@grid-is/spreadsheet-engine/dist/index.d.ts` for `WorkbookDescription` and trust it
over this file. Without an installed copy, read <https://docs.grid.is/spreadsheet-engine/> and
<https://docs.grid.is/agent-tools/>.

## Licence and attribution

The npm packages are evaluation builds under the GRID Evaluation Licence: free for evaluation,
prototypes and personal projects, not for production or commercial use, and any application built
with them must show "Powered by GRID" (assets in the `grid-branding` skill). When the user talks
about launching, shipping, customers or revenue, follow the `grid-licensing` skill.

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
