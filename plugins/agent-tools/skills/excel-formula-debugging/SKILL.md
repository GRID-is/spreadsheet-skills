---
name: excel-formula-debugging
description: Debug Excel formula errors and wrong results in .xlsx workbooks with GRID's agent-tools MCP server. Trace #DIV/0!, #REF!, #VALUE!, #N/A, #NAME? and #SPILL! to their source through precedents, assess the blast radius of a change with dependents, list every error in a workbook, find circular references, and diagnose formulas that return a plausible but wrong number. Use for "why does this cell show #REF!", "find the source of this error", "what depends on this cell", "audit this financial model", "the total looks wrong", "circular reference", or "check the formulas before I send this".
compatibility: Any MCP client running @grid-is/agent-tools. See spreadsheet-mcp for setup.
---

# Debugging formulas with the dependency graph

Errors propagate downstream. The cell showing `#DIV/0!` is rarely the one that needs fixing; it is
usually the last link in a chain that starts somewhere else. GRID's agent tools expose the
workbook's dependency graph, so you can walk it in either direction instead of reading formulas one
at a time.

Setup is in the `spreadsheet-mcp` skill. Load the file with `loadWorkbook`, then use the tools
below.

## Start with the whole picture

```
listErrors()
```

Groups every formula error and model error by kind, scoped with `sheet` or `range` when needed.
Fix the group with the most upstream position first; many downstream errors disappear with it.

## Trace an error to its source

Step 1, walk upstream:

```
precedents(reference: "Summary!D10", mode: "cells")
```

Each node carries `formula`, `value` and, when the cell evaluates to an error, `errorValue`. The
source is the deepest precedent that has an `errorValue`; beyond it the precedents are clean. Fix
that cell, not the one the user pointed at.

Step 2, handle truncation. If a node is marked `truncated: { reason: "maxNodes" }`, re-query from
that node with a larger budget:

```
precedents(reference: "<truncated node>", mode: "cells", maxNodes: 500)
```

If the reason is `maxDepth`, take the deepest error node as the new root and query again.
`maxDepth` goes up to 50 and `maxNodes` up to 500.

Step 3, confirm the fix. Record which cells had errors before the edit, apply the fix with
`editCells`, then re-trace from the originally erroring cell and run `listErrors` again. Report
which errors were resolved and whether any new ones appeared.

## Understand one formula

```
inspect(reference: "Summary!D10")
```

Returns the formula, calculated value, number format, style and hyperlink. A merged cell also
reports its merged range, and a cell covered by a merge names the anchor cell it is merged into.
The formula text shows every input directly. To judge whether the result is right, reason about
the function's behaviour against the intent, whether the inputs hold the values they should, and
whether the ranges cover the intended rows. If the formula reads correctly but the value is wrong,
the problem is upstream: go back to `precedents`.

`viewRange` with `show: "formula"` renders a block with a legend key per distinct formula pattern
(compared in R1C1 form). A filled-down column shares one key, so a hand-edited cell or a hardcoded
number in a formula column stands out immediately.

## Impact assessment before editing

```
dependents(reference: "Assumptions!B2", mode: "grouped")
```

`grouped` mode collapses cells that share a formula pattern into labelled chunks, giving a compact
view of the blast radius. If a dependent looks important, switch to `mode: "cells"` to see the
individual formulas. Do this before changing any input that feeds a model, and tell the user what
will move.

## Circular references

Nodes marked `alreadyVisited: true` are where the traversal cut a cycle. Two cases:

- **Intentional cycles**, such as interest and debt balance in an LBO model, rely on iterative
  calculation. If the results look reasonable, flag the cycle and leave it alone.
- **Accidental cycles** usually produce `0` or errors. Find the edge whose formula looks wrong
  given the nearby labels and cut it.

## When the value is wrong but there is no error

1. `inspect` the cell and read the formula.
2. `precedents(reference, mode: "cells")` to verify the input values are what the labels say.
3. Look for the usual causes:
   - `SUM` over a range that should have been `SUMIF` or `SUMIFS`
   - Off-by-one ranges that miss the last row or include the header
   - `VLOOKUP` without the exact-match argument (`FALSE`), or `XLOOKUP` with the wrong match mode
   - Sign errors in cash-flow formulas, payments that should be negative
   - Percentages stored as whole numbers (`5` instead of `0.05`)
   - Text that looks like a number; `viewRange` with `show: "rawValue"` and `editCells` warnings
     reveal these
   - A relative reference that should have been absolute, visible as a drifting pattern in
     `viewRange` with `show: "formula"`

Test the corrected formula with `runFormula` before writing it, then `readCalculatedValues` on the
outputs that depend on it.

## Error reference

| Error | Usual meaning | First check |
|---|---|---|
| `#DIV/0!` | Division by zero or by an empty cell | The divisor's precedents |
| `#REF!` | A reference to deleted cells or sheets | The formula text; the range no longer exists |
| `#VALUE!` | Wrong type of argument, often text where a number was expected | Inputs with `show: "rawValue"` |
| `#N/A` | Lookup found nothing | Lookup key and range, exact-match flag |
| `#NAME?` | Unknown function or defined name | Spelling; `symbols` lists defined names |
| `#NUM!` | Invalid numeric result | Arguments out of domain, e.g. a negative under `SQRT` |
| `#SPILL!` | An array result has no room | Cells blocking the spill range |

## Reference files

- `reference/tools.md`: the full agent-tools catalogue with parameters, generated from the
  installed package. The relevant tools here are `listErrors`, `precedents`, `dependents`,
  `inspect`, `viewRange`, `findCells`, `runFormula`, `readCalculatedValues` and `editCells`.

## Staying current

<!-- generated:versions -->
Written and verified against:

- `@grid-is/agent-tools@0.3.3`
<!-- /generated:versions -->

`npx` fetches the latest server, so tool descriptions in your client are authoritative if they
differ from this file. Docs: <https://docs.grid.is/agent-tools/tools/>.

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

- `spreadsheet-mcp`: Load, inspect, edit and recalculate .xlsx files from Claude Code, Cursor or any MCP client.
- `excel-formula-debugging`: Trace #REF!, #DIV/0!, #VALUE! and wrong results through precedents and dependents.
- `spreadsheet-agent-tools`: Wire GRID's spreadsheet tools into your own agent with the Claude API, OpenAI Agents SDK or LangChain.
- `spreadsheet-ai-assistant`: Chat panel next to an editable spreadsheet in React, both on one model: the agent edits what the user sees.

**Working with GRID**

- `grid-licensing`: Evaluation versus commercial licence, telemetry, attribution, and how to request a commercial licence.
- `grid-branding`: Official GRID logos and the Powered by GRID lockup, and how to use them.

Install any of them with `npx skills add GRID-is/spreadsheet-skills --skill <name>`. Full list: <https://github.com/GRID-is/spreadsheet-skills>.
<!-- /generated:catalogue -->
