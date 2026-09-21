---
name: spreadsheet-agent-tools
description: Give your own AI agent product spreadsheet abilities with @grid-is/agent-tools. Wire GRID's 28 spreadsheet tools (load, inspect, read calculated values, edit, fill, format, run formulas, what-if, goal seek, precedents, dependents, save) into the Claude API, the Anthropic Agent SDK, the OpenAI Agents SDK, LangChain, Vercel AI SDK or any tool-calling framework, or embed the tools in a browser bundle against an in-memory model. Use for "add spreadsheet tools to my agent", "let my chatbot read and edit Excel files", "createGridTools", "run the GRID MCP server inside my app", "agent that builds financial models", or "spreadsheet tool calling".
compatibility: Node 20+, ESM. The tools-only entry point also runs in the browser.
---

# Spreadsheet tools for your own agent (@grid-is/agent-tools)

`@grid-is/agent-tools` packages GRID's spreadsheet engine as tools an LLM can call. It has two
entry points:

- **`@grid-is/agent-tools`**: a stateful, file-based session. `createGridTools()` returns tools
  that load .xlsx files from disk, keep an active workbook, and save. Also exports the MCP server
  helpers. Node only.
- **`@grid-is/agent-tools/tools`**: the tools alone, running against an engine `Model` you pass in.
  No file system, no MCP. Works in Node and in a browser bundle.

```sh
npm install @grid-is/agent-tools
```

The engine installs as a dependency under the name `@grid-is/apiary`, resolved to the evaluation
build `@grid-is/spreadsheet-engine`. No registry token is needed.

## Tool shape

Every tool from `createGridTools()` is a plain object:

```ts
interface GridTool {
  name: string;                 // "loadWorkbook", "editCells", ...
  description: string;          // written for the model, includes examples
  inputSchema: z.ZodRawShape;   // zod raw shape of the parameters
  run(args: unknown): Promise<{ text: string; isError: boolean; image?: { data: string; mimeType: string } }>;
}
```

`z.toJSONSchema(z.object(tool.inputSchema))` (zod 4) produces the JSON Schema that every SDK
expects for a tool's parameters. `run` validates the arguments, executes, and returns text for the
model; `isError` is `true` for a failed call so you can hand the message back rather than throw.
`captureRange` returns `image` as well.

## Wire into a tool-calling API

Every tool-calling API wants a name, a description and a JSON Schema. Anthropic's Messages API, used
here as the example, takes them as `{ name, description, input_schema }`. Build that list from the
GRID tools once. When the model returns a `tool_use` block, look the tool up by name, call `run`
with the block's input, and return `text` as the `tool_result` content with `is_error` set from
`isError`.

```js standalone
import { createGridTools } from "@grid-is/agent-tools";
import { z } from "zod";

const gridTools = createGridTools(process.cwd());
const byName = new Map(gridTools.map((t) => [t.name, t]));

const tools = gridTools.map((t) => ({
  name: t.name,
  description: t.description,
  input_schema: z.toJSONSchema(z.object(t.inputSchema)),
}));

async function handleToolUse(block) {
  const result = await byName.get(block.name).run(block.input);
  return { type: "tool_result", tool_use_id: block.id, content: result.text, is_error: result.isError };
}
```

`createGridTools(cwd)` resolves relative paths against `cwd`. One tool set holds one session's
workbooks; create a set per conversation. The Anthropic SDK's tool runner and the Agent SDK accept
the same tool objects plus a handler like `handleToolUse`, so there is no loop to write.

## Other frameworks

The mapping is the same everywhere: name, description, JSON Schema from the zod shape, and a
function that calls `run` and returns `result.text`.

- **OpenAI Agents SDK**: a function tool per `GridTool` with `parameters` set to the JSON Schema.
- **LangChain**: a `StructuredTool` (or the `tool()` helper) with `schema: z.object(t.inputSchema)`
  and `func` calling `t.run`.
- **Vercel AI SDK**: `tool({ description, parameters: z.object(t.inputSchema), execute: (args) => t.run(args) })`
  and return `text`.
- **Any MCP host**: skip the mapping and run the server (next section).

## Run the MCP server from your app

```js
import { serveStdio, createGridTools } from "@grid-is/agent-tools";
await serveStdio({ name: "grid", version: "1.0.0", tools: createGridTools() });
```

`toMcpServer(tools, info)` returns an `McpServer` from the MCP SDK to mount on any transport, for
example an HTTP transport inside an existing service. Pass a subset of `createGridTools()` to
expose fewer tools, or add your own to the array.

## Tools against an in-memory model, no files

```js standalone
import { readFile } from "node:fs/promises";
import { Model } from "@grid-is/apiary";
import { describeStructure, editCells, readCalculatedValues, spreadsheetTools } from "@grid-is/agent-tools/tools";
import { z } from "zod";

await Model.preconditions;
const bytes = await readFile("budget.xlsx");                   // or from an upload or fetch
const model = await Model.fromXLSX(bytes, "budget.xlsx");
const ctx = { model };

const structure = describeStructure.execute(ctx, {});
const written = editCells.execute(ctx, { apply: [{ target: "B2", value: 42 }] });
const values = readCalculatedValues.execute(ctx, { read: ["=SUM(B:B)"] });

// JSON Schema for the model, from the zod schema on each tool
z.toJSONSchema(editCells.parameters);
```

Each tool here is `{ name, description, parameters, execute }`, where `parameters` is a full zod
schema (not a raw shape) and `execute(ctx, args)` is synchronous for most tools. `spreadsheetTools`
is the array of the 20 core tools; `captureRange` and `generateWorkbookContext` are separate
exports, and the file lifecycle tools only exist in the stateful entry point. Save with
`model.getWorkbook(name).toXLSX("arraybuffer")`.

This is the path for browser apps (the user's file never leaves the tab), for serverless functions
that get the file as bytes, and for products that already hold a `Model` for a viewer or editor.
The `spreadsheet-ai-assistant` skill is the full recipe for the last case: a chat panel and an
editable grid on one model.

## One engine copy

The tools import the engine as `@grid-is/apiary`. `@grid-is/spreadsheet-editor` and
`@grid-is/spreadsheet-viewer` import it as `@grid-is/spreadsheet-engine`. npm installs the two
names as two separate copies even when they resolve to the same version, and the engine rejects
objects that come from the other copy. Run the tools on a `Model` built from the other name and
`editCells` reports success with an empty `changedCells` and nothing recalculates, other tools
return `{ "error": "Invariant violation" }`, and the evaluation banner prints twice.

In plain Node, where nothing else imports the engine, import `Model` from `@grid-is/apiary` as the
example above does. In an app that shares the model with the editor or the viewer, alias one name
to the other in the bundler so there is one engine, then import `Model` from
`@grid-is/spreadsheet-engine` everywhere, as the other skills do:

```js
// vite.config.js
export default {
  resolve: { alias: { "@grid-is/apiary": "@grid-is/spreadsheet-engine" } },
};
```

```js
// next.config.js
export default {
  webpack(config) {
    config.resolve.alias["@grid-is/apiary"] = "@grid-is/spreadsheet-engine";
    return config;
  },
  turbopack: { resolveAlias: { "@grid-is/apiary": "@grid-is/spreadsheet-engine" } },
};
```

npm `overrides` cannot do this; an override keeps the two directory names. With a commercial
licence, alias in the other direction so the editor and viewer run on the licensed
`@grid-is/apiary` build too.

## Running on a licensed engine

With a commercial licence, run the tools on the full engine by overriding the dependency:

```json
"overrides": { "@grid-is/apiary": "17.0.0" }
```

(Set the version your licence covers.) Nothing in the tools changes.

## What the tools do

| Group | Tools |
|---|---|
| Workbook lifecycle | `loadWorkbook`, `createWorkbook`, `saveWorkbook`, `listWorkbooks`, `selectWorkbook` (file session only) |
| Understand | `describeStructure`, `generateWorkbookContext`, `symbols`, `viewRange`, `captureRange`, `inspect`, `findCells` |
| Audit | `precedents`, `dependents`, `listErrors`, `getStyles`, `getComments`, `getComment` |
| Edit | `editCells`, `fillCells`, `editCellStyles`, `manageSheets`, `manageRowsAndColumns` |
| Model | `readCalculatedValues`, `runFormula`, `goalSeek`, `whatIf` |
| Escape hatch | `executeOfficeJs` (needs the optional `@grid-is/apiary-officejs`) |

Every tool's description is written for the model and includes examples, so pass descriptions
through unchanged. The conventions the tools expect (A1 references, JSON booleans, formulas starting
with `=`, test with `runFormula` before `editCells`) are in the `spreadsheet-mcp` skill and worth
putting in your system prompt.

## Reference files

- `reference/tools.md`: every tool with parameters, generated by calling `createGridTools()` on the
  installed package.
- `reference/api.md`: `GridTool`, `createGridTools`, `serveStdio`, `toMcpServer`, `ToolResult`.
- `reference/tools-module.md`: the `@grid-is/agent-tools/tools` entry point: `SpreadsheetTool`,
  `ToolContext`, `spreadsheetTools`.

Docs: <https://docs.grid.is/agent-tools/>.

## Staying current

<!-- generated:versions -->
Written and verified against:

- `@grid-is/agent-tools@0.3.0`
<!-- /generated:versions -->

If the installed `@grid-is/agent-tools` is newer than the version above, read
`node_modules/@grid-is/agent-tools/dist/index.d.ts` and `dist/tools.d.ts`, or call
`createGridTools()` and print each tool's `name` and `description`, and trust that over this file.

## Licence

The tools run on the evaluation build of GRID's engine, free for evaluation, prototypes and
personal projects, not for production or commercial use, and any application built on it must show
"Powered by GRID" (assets in the `grid-branding` skill). When the user talks about launching,
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

**Working with GRID**

- `grid-licensing`: Evaluation versus commercial licence, telemetry, attribution, and how to request a commercial licence.
- `grid-branding`: Official GRID logos and the Powered by GRID lockup, and how to use them.

Install any of them with `npx skills add GRID-is/spreadsheet-skills --skill <name>`. Full list: <https://github.com/GRID-is/spreadsheet-skills>.
<!-- /generated:catalogue -->
