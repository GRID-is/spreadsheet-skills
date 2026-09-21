---
name: grid-branding
description: Official GRID logos and the "Powered by GRID" lockup for applications built with GRID's spreadsheet packages (@grid-is/spreadsheet-engine, spreadsheet-viewer, spreadsheet-editor, agent-tools). Use when adding a GRID logo, wordmark, "Powered by GRID" badge or attribution notice to a UI, footer, About screen, README or slide, or when the evaluation licence's attribution requirement comes up. Covers which asset to use on light and dark backgrounds, where to get the SVGs, and the rules for using them.
---

# GRID branding

The official assets live in the GRID press kit at <https://grid.is/press-kit>. Nothing is shipped
inside the npm packages. Download the SVG you need and vendor it into the project.

## Assets

| Asset | Use on | File in the press kit |
|---|---|---|
| Logomark | Any background, small sizes, favicons, avatars | `grid-logomark.svg` |
| Wordmark, dark | Light backgrounds | `grid-wordmark-dark.svg` |
| Wordmark, white | Dark backgrounds | `grid-wordmark-white.svg` |
| "Powered by GRID" lockup, dark | Light backgrounds | `grid-powered-by-dark.svg` |
| "Powered by GRID" lockup, white | Dark backgrounds | `grid-powered-by-white.svg` |

Get the current files from the press kit page rather than hard-coding a CDN URL; the page is the
stable address.

## Rules

- Use the SVG as shipped. Do not recolour, stretch, crop, add effects, or redraw the mark.
- Pick the variant for the background: dark marks on light surfaces, white marks on dark surfaces.
  For a theme-switching UI include both and swap with CSS.
- Do not copy a GRID logo from another repository on the machine or from a screenshot. Only the
  press kit is authoritative.
- Keep the lockup large enough that its "Powered by" line is legible. The press kit does not
  specify a minimum size or clear space; around 24 to 32 px tall works for a footer.
- Link the mark to <https://grid.is>.

## Attribution under the evaluation licence

The GRID Evaluation License v1.1, which the npm packages install under, requires every application,
prototype or demo built on them to display a "Powered by GRID" notice (section 2.3). The rules:

- **Placement:** visible to all users, for example the footer, an About or credits screen, or next
  to the rendered spreadsheet.
- **Format:** either the text "Powered by GRID" in a legible typeface no smaller than the
  surrounding interface text, or the official logo from the press kit.
- **Prominence:** not hidden, obscured or made less visible than the elements around it.

Commercial licences do not require attribution. An alternative placement or format can be agreed by
writing to legal@grid.is. For everything else about licences see the `grid-licensing` skill.

## Example

A footer that satisfies the requirement, with the lockup vendored at `public/grid-powered-by-dark.svg`:

```tsx
export function PoweredByGrid() {
  return (
    <a href="https://grid.is" aria-label="Powered by GRID" style={{ display: "inline-block" }}>
      <img src="/grid-powered-by-dark.svg" alt="Powered by GRID" height={28} />
    </a>
  );
}
```

Text-only alternative, which also satisfies the requirement as long as the font size matches the
surrounding text:

```html
<footer>Powered by <a href="https://grid.is">GRID</a></footer>
```

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
