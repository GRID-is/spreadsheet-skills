---
name: react-spreadsheet-editor
description: Add an editable Excel-like spreadsheet to a React app with @grid-is/spreadsheet-editor and @grid-is/spreadsheet-engine. Users type values and formulas, format cells, fill, paste, insert, delete and move rows and columns, and manage sheets, with an edit event stream for autosave and an imperative controller for selection and focus. Use for "editable spreadsheet component", "Excel-like grid in React", "let users edit a workbook in the browser", "react spreadsheet editor", autosave from edit events, capping grid size, loading spreadsheet fonts, or drag-and-drop an xlsx to edit and download. For read-only display use react-spreadsheet-viewer.
compatibility: React 18 or later, ESM only, browser rendering. Peer dependency on @grid-is/spreadsheet-engine 17.
---

# React spreadsheet editor (@grid-is/spreadsheet-editor)

`SpreadsheetEditor` renders a `Model` from `@grid-is/spreadsheet-engine` as a fully editable
spreadsheet: grid, sheet tabs, formula bar, keyboard navigation and direct cell editing. Every edit
is applied to the live model and reported through `onChange`, so the engine is always the source of
truth for saving.

```sh
npm install @grid-is/spreadsheet-editor @grid-is/spreadsheet-engine
```

Three peer dependencies: `react` and `react-dom` 18 or later, and `@grid-is/spreadsheet-engine`
(v17). Unlike the engine and the viewer, the editor's bundle is not self-contained.

## Golden rules

1. **Import the stylesheet once**: `import "@grid-is/spreadsheet-editor/style.css";`. Use the
   exports path, not `dist/index.css`.
2. **The container needs an explicit height.** The editor fills its parent.
3. **Load the model first, then render.** `await Model.preconditions`, load, keep the model in
   state, render when it exists.
4. **`onChange` events are after the fact.** The editor has already applied the change to the model
   when the event fires. Do not re-apply it. Use events for autosave, dirty state and audit logs.
5. **User-typed formulas recalculate on their own.** A programmatic formula edit through
   `workbook.editCell` still needs `model.recalculate(ALL_FORMULA_CELLS)`.
6. **There is no `theme` prop.** The viewer has one; the editor does not in v0.6.
7. **References are A1 strings**, single-quoted when the sheet name has spaces.

## Minimal app

```tsx
import { useEffect, useState } from "react";
import { Model } from "@grid-is/spreadsheet-engine";
import { SpreadsheetEditor } from "@grid-is/spreadsheet-editor";
import "@grid-is/spreadsheet-editor/style.css";

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
    <div style={{ height: "100vh" }}>
      <SpreadsheetEditor model={model} />
    </div>
  );
}
```

Start from nothing with `Model.empty("untitled.xlsx")`. Open a dropped file with
`Model.fromXLSX(await file.arrayBuffer(), file.name)`.

## Props

| Prop | Type | Purpose |
|---|---|---|
| `model` | `Model` | The engine model to render and edit. Required. |
| `onChange` | `(event: EditorEvent) => void` | Every edit, selection and sheet change |
| `initialSelection` | `string` | A1 reference selected on mount |
| `size` | `{ maxRows?, maxCols? }` | Caps navigation; 0-based index of the last row and column, so `{ maxRows: 99, maxCols: 25 }` is 100 rows and 26 columns |
| `controllerRef` | `Ref<SpreadsheetEditorController>` | Imperative handle, see Controller |
| `autoFocus` | `boolean` | Focus the sheet on mount so the user can type immediately |
| `fontConfig` | `FontConfig` | Which spreadsheet fonts to load and from where |
| `showErrorTooltips` | `boolean` | Tooltips on error cells |
| `showFormulaReferencesOnCellSelection` | `boolean` | Highlight the ranges a selected formula reads |

## Events

`onChange` receives a discriminated union. Every event has `type` and `timestamp` (ms since epoch).
The two navigation events, `selection-change` (`selection`) and `sheet-change` (`sheetName`,
`previousSheetName`), are the same as the viewer's. The edit events in v0.6:

| `type` | Extra fields |
|---|---|
| `write-cell` | `sheetName`, `cellId`, `value` |
| `paste` | `sheetName`, `range` |
| `clear-cells` | `sheetName`, `range` |
| `format-cells` | `sheetName`, `range`, `format` (a JSF `Style`) |
| `fill` | `sheetName`, `sourceRange`, `targetRange` |
| `insert-row` | `sheetName`, `row`, `direction` (`"top"` or `"bottom"`) |
| `insert-column` | `sheetName`, `column`, `direction` (`"left"` or `"right"`) |
| `delete-rows` | `sheetName`, `startRow`, `count` |
| `delete-columns` | `sheetName`, `startColumn`, `count` |
| `insert-cells` | `sheetName`, `range`, `shift` |
| `delete-cells` | `sheetName`, `range`, `shift` |
| `move-rows`, `move-columns`, `move-cells` | `sheetName`, `fromRange`, `toRange` |
| `resize-row` | `sheetName`, `row`, `height` |
| `resize-column` | `sheetName`, `column`, `width` |
| `add-sheet` | `sheetName` |
| `delete-sheet` | `sheetName` |
| `rename-sheet` | `oldName`, `newName` |

Exact field types are in `reference/api.md`. Autosave pattern:

```tsx
import type { EditorEvent } from "@grid-is/spreadsheet-editor";

function handleChange(event: EditorEvent) {
  if (event.type === "selection-change" || event.type === "sheet-change") return;   // navigation only
  scheduleAutosave();   // debounce, then persist
}

async function save() {
  const wb = model.getWorkbook("budget.xlsx");
  const bytes = await wb.toXLSX("arraybuffer");                 // upload this
}
```

For a smaller payload persist `serializeModel(model)` from the engine and restore with
`deserializeModel`. Both are documented in the `spreadsheet-engine` skill.

## Controller

`controllerRef` gives imperative access. The interface is marked experimental and may change.

```tsx
import { useRef } from "react";
import { SpreadsheetEditor, type SpreadsheetEditorController } from "@grid-is/spreadsheet-editor";

const controller = useRef<SpreadsheetEditorController>(null);

<SpreadsheetEditor model={model} controllerRef={controller} />;

controller.current?.selectSheet("Forecast");
controller.current?.selectCells("Sheet2!B2:D5");          // switches sheet if needed, scrolls into view
controller.current?.highlightRefs(["A1:A10", "C3"], 2000); // flash ranges for 2 s
controller.current?.focus("Sheet1!A4");                    // move keyboard focus, optionally select first
```

## Programmatic changes while the user edits

Writes through the engine appear in the editor immediately, and user edits are readable through the
engine immediately:

```tsx
model.write("Assumptions!B2", 0.05);
model.readValue("=Summary!D10");
```

Engine writes repaint the grid but do not fire `onChange`; the edit events come from the editor's
own operations. So `onChange` is a clean "the user did this" signal, which is what makes it usable
for telling an agent what changed (see the `spreadsheet-ai-assistant` skill). Note that
`model.write` with a string that starts with `=` stores text, not a formula; formulas go through
`workbook.editCell(ref, { f })` without the `=`, followed by `model.recalculate(ALL_FORMULA_CELLS)`.

## Fonts

The editor draws cells on a canvas, so the workbook's fonts have to be available as web fonts. The
package ships definitions for around 20 spreadsheet fonts, each tagged `"open"` or `"restricted"`
by licence, but no font files. By default it requests them as woff2 from the app's own origin under
`/fonts/open/` and `/fonts/restricted/`. A missing file is not an error. The editor falls back to a
system font and reports nothing, so a fresh project renders with fallback fonts until the files are
in place.

The loader expects four files per font, named after the font id:

```
public/fonts/open/carlito/carlito-regular.woff2
public/fonts/open/carlito/carlito-bold.woff2
public/fonts/open/carlito/carlito-italic.woff2
public/fonts/open/carlito/carlito-bolditalic.woff2
```

The open set is five OFL-licensed fonts, ids `caladea`, `carlito`, `lora`, `merriweather` and
`poppins`. Carlito and Caladea are metric-compatible with Calibri and Cambria, Excel's defaults, so
a workbook saved from Excel keeps its layout with the open set alone. All five are on Google Fonts
and as Fontsource packages on npm, which is the quickest way to get the files:

```sh
npm install @fontsource/caladea @fontsource/carlito @fontsource/lora @fontsource/merriweather @fontsource/poppins
```

Each package has `files/<id>-latin-400-normal.woff2`, `-latin-700-normal`, `-latin-400-italic` and
`-latin-700-italic`. Copy them into the layout above as `-regular`, `-bold`, `-italic` and
`-bolditalic`, then restrict loading to that set:

```tsx
<SpreadsheetEditor model={model} fontConfig={{ fontFilter: "open" }} />
```

`fontFilter` takes `"open"`, `"restricted"` or an array of font ids. `baseUrl` points somewhere
other than the app's origin, as one URL or as `{ open, restricted }`. The restricted set (Calibri,
Arial, Aptos, Cambria, Georgia, Times New Roman, Verdana and others) is Microsoft fonts that no
public package can ship. If the developer has licensed copies, they go under `fonts/restricted/<id>/`
in the same layout. The editor always tries Calibri first and skips it silently when the file is
absent. The `FontConfig` type is exported, and the full id list is `fontDefinitions` in the
package's `dist/index.d.ts`.

## Server-rendered apps

Render client-side only (`"use client"` or a dynamic import with `ssr: false`); the editor draws on
a canvas.

## Attribution

Apps built on the evaluation packages must show "Powered by GRID" (text or the official lockup) where
users can see it. Assets and the exact rules are in the `grid-branding` skill.

## Reference files

- `reference/api.md`: generated from the installed editor's type definitions. `SpreadsheetEditor`,
  every event interface, `SpreadsheetEditorController`, `SpreadsheetSize`, `FontConfig`.

Docs: <https://docs.grid.is/spreadsheet-editor/>. Loading and saving go through the engine; see the
`spreadsheet-engine` skill.

## Staying current

<!-- generated:versions -->
Written and verified against:

- `@grid-is/spreadsheet-editor@0.6.0`
- `@grid-is/spreadsheet-engine@17.1.0`
<!-- /generated:versions -->

If the installed `@grid-is/spreadsheet-editor` is newer than the version above, read
`node_modules/@grid-is/spreadsheet-editor/dist/index.d.ts` and trust it over this file. The
package is pre-1.0 and its API moves.

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
- `spreadsheet-ai-assistant`: Chat panel next to an editable spreadsheet in React, both on one model: the agent edits what the user sees.

**Working with GRID**

- `grid-licensing`: Evaluation versus commercial licence, telemetry, attribution, and how to request a commercial licence.
- `grid-branding`: Official GRID logos and the Powered by GRID lockup, and how to use them.

Install any of them with `npx skills add GRID-is/spreadsheet-skills --skill <name>`. Full list: <https://github.com/GRID-is/spreadsheet-skills>.
<!-- /generated:catalogue -->
