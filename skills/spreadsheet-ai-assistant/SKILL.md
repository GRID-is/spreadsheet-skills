---
name: spreadsheet-ai-assistant
description: Add an AI assistant to a spreadsheet in React, a chat panel next to an editable Excel-like grid on one shared model, with @grid-is/spreadsheet-editor, @grid-is/spreadsheet-engine and @grid-is/agent-tools plus any tool-calling LLM API (Claude, OpenAI). The agent reads and edits the workbook the user is looking at, the spreadsheet tools run in the browser so the file stays in the tab, the user's own edits are reported to the agent, and cell references in the chat are clickable. Use for "add an AI assistant to a spreadsheet", "spreadsheet copilot", "chat with my Excel file", "AI sidebar for a spreadsheet editor", "LLM that edits the spreadsheet the user is editing", "spreadsheet chatbot in React", or "Excel copilot in the browser".
compatibility: React 18 or later, ESM, browser rendering. A tool-calling LLM API reached through your own backend.
---

# AI assistant in a spreadsheet

A chat panel on one side, an editable spreadsheet on the other, and one `Model` underneath both.
The user types in cells, the agent calls tools that read and edit the same cells, and each sees the
other's changes at once. Three GRID packages do it:

- `@grid-is/spreadsheet-engine` holds the workbook in memory and recalculates it.
- `@grid-is/spreadsheet-editor` renders that model as an editable grid and reports the user's edits.
- `@grid-is/agent-tools/tools` gives the LLM twenty spreadsheet tools that run in the page against
  that model. No server holds the file.

```sh
npm install @grid-is/spreadsheet-engine @grid-is/spreadsheet-editor @grid-is/agent-tools zod
```

## Golden rules

1. **One model, one engine copy.** The tools import the engine as `@grid-is/apiary`, the editor as
   `@grid-is/spreadsheet-engine`. Alias one to the other in the bundler (below) or the tools reject
   the editor's model.
2. **Tools run in the browser, the API key does not.** The chat loop runs in the page and calls the
   LLM through a small proxy on your backend. Tool calls come back to the page and execute there.
3. **Tool edits repaint the grid but do not fire `onChange`.** Edit events come only from the user's
   own actions, so `onChange` is a clean record of what the human did since the agent's last turn.
4. **Formulas sent to the tools start with `=`.** `editCells` takes `{ target: "B5", value: "=SUM(B1:B4)" }`
   and stores it correctly. Values without `=` are literals.
5. **Rebuild the workbook context every turn.** The user keeps editing between messages, so the
   system prompt's description of the workbook goes stale.
6. **Show the agent's work in the grid.** Highlight the cells a tool changed, and turn every cell
   reference in the chat into a link that selects it.
7. **Attribution.** Apps on the evaluation packages show "Powered by GRID" (the `grid-branding`
   skill has the assets).

## One engine copy

npm installs `@grid-is/apiary` and `@grid-is/spreadsheet-engine` as two separate copies even at the
same version, and the engine rejects objects from the other copy. Alias the tools' name to the
editor's so the bundle has one engine, then import `Model` from `@grid-is/spreadsheet-engine`
everywhere:

```js
// vite.config.js
export default {
  resolve: { alias: { "@grid-is/apiary": "@grid-is/spreadsheet-engine" } },
};
```

For Next.js set the same alias in `webpack(config)` via `config.resolve.alias` and in
`turbopack.resolveAlias`. The `spreadsheet-agent-tools` skill has the full block and the symptoms
of getting this wrong. With a commercial licence, alias in the other direction.

## The page

Load the model once, render the editor with a controller and an `onChange` that collects edit
events, and keep the events in a ref until the next message goes to the agent.

```tsx
import { useEffect, useRef, useState } from "react";
import { Model } from "@grid-is/spreadsheet-engine";
import { SpreadsheetEditor, type EditorEvent, type SpreadsheetEditorController } from "@grid-is/spreadsheet-editor";
import "@grid-is/spreadsheet-editor/style.css";

export default function App() {
  const [model, setModel] = useState<Model | null>(null);
  const controller = useRef<SpreadsheetEditorController>(null);
  const userEdits = useRef<EditorEvent[]>([]);          // since the agent's last turn

  useEffect(() => {
    (async () => {
      await Model.preconditions;
      const res = await fetch("/budget.xlsx");
      setModel(await Model.fromXLSX(await res.arrayBuffer(), "budget.xlsx"));
    })();
  }, []);

  if (!model) return <p>Loading...</p>;
  return (
    <div style={{ display: "flex", height: "100vh" }}>
      <div style={{ flex: 2 }}>
        <SpreadsheetEditor
          model={model}
          controllerRef={controller}
          fontConfig={{ fontFilter: "open" }}
          onChange={(event) => {
            if (event.type === "selection-change" || event.type === "sheet-change") return;
            userEdits.current.push(event);
          }}
        />
      </div>
      <div style={{ flex: 1 }}>
        <Chat model={model} controller={controller} userEdits={userEdits} />
      </div>
    </div>
  );
}
```

The editor needs woff2 font files under `public/fonts/open/<id>/` or it silently renders with
system fonts. The `react-spreadsheet-editor` skill lists the five open fonts and where to get them.

## Tools in the browser

`@grid-is/agent-tools/tools` exports each tool as `{ name, description, parameters, execute }`,
where `parameters` is a zod schema and `execute(ctx, args)` runs synchronously against `ctx.model`.
Build the LLM's tool list once and keep a lookup by name:

```ts
import { z } from "zod";
import { isToolError, spreadsheetTools } from "@grid-is/agent-tools/tools";
import type { Model } from "@grid-is/spreadsheet-engine";

export const toolDefinitions = spreadsheetTools.map((t) => ({
  name: t.name,
  description: t.description,
  input_schema: z.toJSONSchema(t.parameters),   // Anthropic shape; OpenAI calls it "parameters"
}));

const byName = new Map(spreadsheetTools.map((t) => [t.name, t]));

export async function runTool(model: Model, name: string, input: unknown) {
  const tool = byName.get(name);
  if (!tool) return { text: `Unknown tool ${name}`, isError: true };
  const result = await tool.execute({ model }, input as never);
  if (isToolError(result)) return { text: result.error, isError: true };
  return { text: JSON.stringify(result), isError: false };
}
```

`execute` validates the arguments and returns `{ error }` rather than throwing, so a bad call goes
back to the model as a tool error and the conversation continues. `captureRange` is the exception
that returns image bytes; send it as an image block or leave it out of the list. The tools' own
descriptions include examples for the model, so pass them through unchanged.

## The turn loop

The page owns the conversation. Each turn it sends the messages, the tool definitions and a fresh
system prompt to your proxy, executes whatever tool calls come back, appends the results, and asks
again until the model stops calling tools. Shown with the Anthropic Messages API shapes; the OpenAI
and Vercel AI SDK shapes differ only in field names.

```ts
import { generateWorkbookContext } from "@grid-is/agent-tools/tools";

async function agentTurn(model: Model, messages: Message[], highlight: (refs: string[]) => void) {
  const system = buildSystemPrompt(model);              // next section
  for (;;) {
    const res = await fetch("/api/messages", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ system, messages, tools: toolDefinitions }),
    });
    const reply = await res.json();                       // the Messages API response, forwarded as is
    messages.push({ role: "assistant", content: reply.content });
    const calls = reply.content.filter((b: { type: string }) => b.type === "tool_use");
    if (calls.length === 0) return messages;

    const results = [];
    for (const call of calls) {
      const r = await runTool(model, call.name, call.input);
      results.push({ type: "tool_result", tool_use_id: call.id, content: r.text, is_error: r.isError });
      if (call.name === "editCells" && !r.isError) highlight(JSON.parse(r.text).changedCells);
    }
    messages.push({ role: "user", content: results });
  }
}
```

The proxy adds the API key and forwards the body to `POST /v1/messages` (or the equivalent) and
returns the response unchanged. Keep it that thin; the page has everything else. Because the tools
run in the page, the workbook never leaves the browser. The model only ever sees what the tools
return.

## The system prompt

`generateWorkbookContext(model)` from the tools module writes the sheet inventory, labelled inputs
and outputs and formula regions as prompt text. Call it at the start of every turn, since the user
may have changed the workbook, and add the conventions the tools expect and the reference format
the chat will make clickable:

```ts
function buildSystemPrompt(model: Model) {
  return [
    "You are an assistant inside a spreadsheet editor. The user sees the workbook and edits it directly.",
    "Use the tools to read and change cells; never guess values. Test a formula with runFormula before writing it with editCells.",
    "References are A1 with the sheet name, like Summary!B10. Write every cell reference in that form so the user can click it.",
    "Formulas start with =. Booleans are true and false.",
    "After editing, say which cells changed and why, in one or two sentences.",
    "",
    generateWorkbookContext(model) ?? "The workbook is empty.",
  ].join("\n");
}
```

The `spreadsheet-llm-context` skill covers `describeWorkbook`, the engine function behind this,
if you want the structured form instead of text.

## The user's edits reach the agent

The events collected in `userEdits` are what the human did since the agent's last turn. Summarise
them into the next user message so the agent knows the sheet moved under it, then clear the list:

```ts
import type { EditorEvent } from "@grid-is/spreadsheet-editor";

function describeEdits(events: EditorEvent[]): string {
  const lines = events.map((e) => {
    switch (e.type) {
      case "write-cell":   return `${e.sheetName}!${e.cellId} = ${e.value}`;
      case "paste":        return `pasted into ${e.sheetName}!${e.range}`;
      case "clear-cells":  return `cleared ${e.sheetName}!${e.range}`;
      case "fill":         return `filled ${e.sheetName}!${e.sourceRange} into ${e.targetRange}`;
      case "insert-row":   return `inserted a row in ${e.sheetName} at row index ${e.row}`;
      case "delete-rows":  return `deleted ${e.count} row(s) in ${e.sheetName} from row index ${e.startRow}`;
      case "add-sheet":    return `added sheet ${e.sheetName}`;
      case "rename-sheet": return `renamed sheet ${e.oldName} to ${e.newName}`;
      default:             return e.type;
    }
  });
  return lines.length ? `Since your last reply the user made these edits:\n${lines.join("\n")}\n\n` : "";
}

// when the user sends a message
const text = describeEdits(userEdits.current) + input;
userEdits.current = [];
messages.push({ role: "user", content: text });
await agentTurn(model, messages, (refs) => controller.current?.highlightRefs(refs, 2000));
```

`write-cell` carries the typed text, so a formula arrives as `=SUM(B2:B4)`. For the resulting
values the agent calls `readCalculatedValues` itself. The full event list with every field is in
`reference/editor-api.md`.

## Clickable references and highlighted changes

Two things make the assistant feel like it is in the spreadsheet rather than next to it. Cell
references in its replies select the cell when clicked, and the cells a tool edits flash in the grid.
The controller does both:

```tsx
const REF = /(?:'[^']+'|[A-Za-z0-9_]+)!\$?[A-Z]{1,3}\$?\d+(?::\$?[A-Z]{1,3}\$?\d+)?/g;

function AssistantText({ text, controller }: { text: string; controller: React.RefObject<SpreadsheetEditorController | null> }) {
  const parts = text.split(REF);
  const refs = text.match(REF) ?? [];
  return (
    <p>
      {parts.map((part, i) => (
        <span key={i}>
          {part}
          {refs[i] && (
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                controller.current?.selectCells(refs[i]);      // switches sheet, scrolls into view
                controller.current?.highlightRefs([refs[i]], 1500);
              }}
            >
              {refs[i]}
            </a>
          )}
        </span>
      ))}
    </p>
  );
}
```

The system prompt above asks for sheet-qualified references, which is what the regex matches.
`editCells` returns `changedCells` in the same form, the edited cells plus every formula cell that
recalculated because of them, and the turn loop passes them to `highlightRefs` so the user sees
the ripple. Use `parseReference` from the engine if you want to validate a match before
making it a link.

## Saving

The workbook lives in the tab. Offer a download or an upload from the same model the agent edited:

```ts
const wb = model.getWorkbook("budget.xlsx");
const bytes = await wb.toXLSX("arraybuffer");
const url = URL.createObjectURL(new Blob([bytes], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }));
```

Debounce a save on `onChange` for the user's edits and after each agent turn for the agent's, since
the agent's edits do not appear in `onChange`.

## The same pieces in Node

Everything except the React layer runs headless, which is how to test the prompt and the tool
wiring without a browser. This script builds the tool list, applies an edit the way the agent
would, reads the result, and renders the user-edit summary from a recorded event:

```js standalone
import { z } from "zod";
import { Model } from "@grid-is/apiary";      // Node has no bundler alias; in the app this is @grid-is/spreadsheet-engine
import { editCells, generateWorkbookContext, isToolError, readCalculatedValues, spreadsheetTools } from "@grid-is/agent-tools/tools";

await Model.preconditions;
const model = await Model.fromXLSXFile("budget.xlsx");
const ctx = { model };

const toolDefinitions = spreadsheetTools.map((t) => ({
  name: t.name,
  description: t.description,
  input_schema: z.toJSONSchema(t.parameters),
}));
console.log(toolDefinitions.length, "tools");                       // 20

const system = generateWorkbookContext(model);                        // fresh each turn
console.log(system.split("\n")[0]);

// The agent edits, as it would from a tool_use block
const edit = editCells.execute(ctx, { apply: [{ target: "Assumptions!B2", value: 0.05 }] });
if (isToolError(edit)) throw new Error(edit.error);
console.log("highlight", edit.changedCells);                          // [ 'Assumptions!B2', 'Summary!B10' ]

// ...and reads what changed downstream
const values = readCalculatedValues.execute(ctx, { read: ["=Summary!B10"] });
console.log(JSON.stringify(values));

// The user's edit, as the editor would report it, becomes text for the next message
const userEdits = [{ type: "write-cell", sheetName: "Sheet1", cellId: "D2", value: "150", timestamp: Date.now() }];
const summary = userEdits.map((e) => `${e.sheetName}!${e.cellId} = ${e.value}`).join("\n");
console.log(`Since your last reply the user made these edits:\n${summary}`);
```

## Reference files

- `reference/tools.md`: every tool's name, description and parameters, generated from the
  installed package. This is what the model sees.
- `reference/tools-module.md`: the `@grid-is/agent-tools/tools` API: `SpreadsheetTool`,
  `ToolContext`, `spreadsheetTools`, `generateWorkbookContext`, `isToolError`.
- `reference/editor-api.md`: `SpreadsheetEditor`, every event interface and the controller.

Loading, reading and writing the model is the `spreadsheet-engine` skill; the editor's props, events
and fonts are `react-spreadsheet-editor`; the tools on their own, other frameworks and the MCP
server are `spreadsheet-agent-tools`. Docs: <https://docs.grid.is/agent-tools/> and
<https://docs.grid.is/spreadsheet-editor/>.

## Staying current

<!-- generated:versions -->
Written and verified against:

- `@grid-is/spreadsheet-editor@0.6.0`
- `@grid-is/spreadsheet-engine@17.1.0`
- `@grid-is/agent-tools@0.3.0`
<!-- /generated:versions -->

If an installed package is newer than the versions above, read its `dist/index.d.ts` (the tools
module is `dist/tools.d.ts`) and trust it over this file. The editor and the tools are pre-1.0 and
their APIs move.

## Licence

The npm packages are evaluation builds under the GRID Evaluation Licence: free for evaluation,
prototypes and personal projects, not for production or commercial use, and any application built
on them must show "Powered by GRID" (assets in the `grid-branding` skill). When the user talks about
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
