---
name: react-spreadsheet-viewer
description: Embed a read-only Excel spreadsheet viewer in a React app with @grid-is/spreadsheet-viewer and @grid-is/spreadsheet-engine. Renders .xlsx workbooks in a canvas grid with sheet tabs, a formula bar, keyboard navigation, selection events, error tooltips, formula reference highlighting and CSS-variable theming. Use for "display a spreadsheet in the browser", "show an Excel file in React", "embed a workbook viewer", "spreadsheet preview component", "react excel viewer", reacting to cell selection, or driving the sheet from app state. Not for end-user editing; see react-spreadsheet-editor for that.
compatibility: React 18 or later, ESM only. Browser rendering; the model can be loaded on the client or serialised from a server.
---

# React spreadsheet viewer (@grid-is/spreadsheet-viewer)

`SpreadsheetViewer` renders a `Model` from `@grid-is/spreadsheet-engine` as a read-only spreadsheet:
grid, sheet tabs, formula bar, keyboard navigation and selection. Users browse and select; data
changes go through the engine and the viewer reflects them. The engine is a separate package and
does the loading.

```sh
npm install @grid-is/spreadsheet-viewer @grid-is/spreadsheet-engine
```

Peer dependencies: `react` and `react-dom` 18 or later. The engine is not a peer of the viewer, but
you need it to create the model.

## Golden rules

1. **Import the stylesheet once** at your entry point:
   `import "@grid-is/spreadsheet-viewer/style.css";`. Use that exports path, not
   `dist/index.css`, which bundlers such as Vite reject. Without it the formula bar is unstyled.
2. **The container needs an explicit height.** The viewer fills its parent; a parent with no height
   renders nothing.
3. **Load the model asynchronously, then render.** `await Model.preconditions`, load, keep the model
   in state, render the viewer only when it exists.
4. **It is read-only.** Change data with `model.write(...)`; the viewer updates. There is no refresh
   call. If a programmatic formula edit does not show, the missing step is
   `model.recalculate(ALL_FORMULA_CELLS)`.
5. **References are A1 strings.** `initialSelection` and the selection in events look like `"B2"`,
   `"Sheet2!B2:E5"` or `"'My Sheet'!A1"`.

## Minimal app

```tsx
import { useEffect, useState } from "react";
import { Model } from "@grid-is/spreadsheet-engine";
import { SpreadsheetViewer } from "@grid-is/spreadsheet-viewer";
import "@grid-is/spreadsheet-viewer/style.css";

export default function App() {
  const [model, setModel] = useState<Model | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      await Model.preconditions;
      const res = await fetch("/budget.xlsx");
      const m = await Model.fromXLSX(await res.arrayBuffer(), "budget.xlsx");
      if (!cancelled) setModel(m);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (!model) return <p>Loading...</p>;
  return (
    <div style={{ height: "600px" }}>
      <SpreadsheetViewer model={model} />
    </div>
  );
}
```

For a file the user picks, read it with `file.arrayBuffer()` and pass it to `Model.fromXLSX` with
the file name. For a large workbook that will only be displayed, load with `{ readOnly: true }` to
skip building the dependency graph.

## Props

| Prop | Type | Purpose |
|---|---|---|
| `model` | `Model` | The engine model to render. Required. |
| `initialSelection` | `string` | A1 reference selected on mount, e.g. `"A1"` or `"'Other Sheet'!B2:E5"` |
| `onChange` | `(event: ViewerEvent) => void` | Selection and sheet-change notifications |
| `theme` | `Record<string, string>` | CSS custom properties, see Theming |
| `showErrorTooltips` | `boolean` | Tooltip on cells holding `#DIV/0!`, `#REF!` and other errors. Default `false` |
| `showFormulaReferencesOnCellSelection` | `boolean` | Highlight the ranges a selected formula reads. Default `false` |
| `fontConfig` | object | Where spreadsheet fonts are loaded from; same shape as the editor's `FontConfig` |

Exact types are in `reference/api.md`, generated from the installed package.

## Events

```tsx
import type { ViewerEvent } from "@grid-is/spreadsheet-viewer";

function handleChange(event: ViewerEvent) {
  if (event.type === "selection-change") {
    event.selection;            // "Sheet1!B2:D4"
    event.timestamp;            // ms since epoch
  }
  if (event.type === "sheet-change") {
    event.sheetName;
    event.previousSheetName;
  }
}

<SpreadsheetViewer model={model} onChange={handleChange} />;
```

A common pattern is an inspector panel driven by the selection:

```tsx
if (event.type === "selection-change") {
  const first = event.selection.split(":")[0];
  const cell = model.readCell("=" + first);
  setInspector({ value: cell.v, formula: cell.f, format: cell.z });
}
```

The package also exports `A1Ref` for parsing a selection string into `sheetName`, `top`, `left`,
`bottom`, `right`, `width` and `height`.

## Driving the viewer from the app

The viewer renders the live model. Writing through the engine updates the grid:

```tsx
model.write("Assumptions!B2", 0.05);                 // recalculates dependents, viewer repaints
```

To jump the selection after mount, remount with a new `initialSelection` or keep the selection in
your own state and render a keyed viewer. The editor package has an imperative controller for this;
the viewer does not.

## Theming

The `theme` prop takes `--mondrian-*` CSS custom properties. The full list with defaults is at
<https://docs.grid.is/spreadsheet-viewer/reference/theme-properties/>. The ones people change:

| Property | Default | Purpose |
|---|---|---|
| `--mondrian-highlight-stroke` | `#217346` | Selected cell border |
| `--mondrian-highlight-fill` | `#c6efce` | Selected cell background |
| `--mondrian-border-primary` | `#d1d5db` | Main border colour |
| `--mondrian-bg-white`, `--mondrian-bg-gray-100`, `--mondrian-bg-gray-200` | | Backgrounds |
| `--mondrian-text-black`, `--mondrian-text-gray-400/500/700` | | Text colours |
| `--mondrian-syntax-range`, `-number`, `-string`, `-prefix` | | Formula bar highlighting |
| `--mondrian-error-red` | `#dc2626` | Error text |
| `--mondrian-border-radius`, `--mondrian-border-radius-sm` | `8px`, `4px` | Corners |

```tsx
<SpreadsheetViewer
  model={model}
  theme={{
    "--mondrian-highlight-stroke": "#3b82f6",
    "--mondrian-highlight-fill": "#dbeafe",
    "--mondrian-border-radius": "4px",
  }}
/>
```

For dark mode, swap the theme object when your app's theme changes.

## Server-rendered apps

The viewer draws on a canvas, so render it client-side only (`"use client"` in Next.js, or a
dynamic import with `ssr: false`). The model can be loaded on the server and shipped with
`serializeModel(model)` from the engine, then `deserializeModel(buffer)` in the browser, which is
faster than re-parsing the .xlsx.

## Attribution

Apps built on the evaluation packages must show "Powered by GRID" (text or the official lockup) where
users can see it, for example under the viewer or in the footer. Assets and the exact rules are in
the `grid-branding` skill.

## Reference files

- `reference/api.md`: generated from the installed viewer's type definitions. `SpreadsheetViewer`,
  `ViewerEvent`, `A1Ref` and the event types.

Loading, reading and writing the model is the engine's job; see the `spreadsheet-engine` skill.
Docs: <https://docs.grid.is/spreadsheet-viewer/>.

## Staying current

<!-- generated:versions -->
Written and verified against:

- `@grid-is/spreadsheet-viewer@3.0.5`
- `@grid-is/spreadsheet-engine@17.1.0`
<!-- /generated:versions -->

If the installed `@grid-is/spreadsheet-viewer` is newer than the version above, read
`node_modules/@grid-is/spreadsheet-viewer/dist/index.d.ts` and trust it over this file.

## Licence

The npm packages are evaluation builds under the GRID Evaluation Licence: free for evaluation,
prototypes and personal projects, not for production or commercial use. When the user talks about
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
