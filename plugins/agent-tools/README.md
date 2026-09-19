# agent-tools plugin

Claude Code and Codex plugin for [GRID's Agent Tools](https://docs.grid.is/agent-tools). Runs the
published [`@grid-is/agent-tools`](https://www.npmjs.com/package/@grid-is/agent-tools) MCP server
via `npx`, with no build step and no bundled dependencies, and ships two skills:

- `spreadsheet-mcp`: setup, the full tool catalogue, and the conventions for references, values
  and formulas.
- `excel-formula-debugging`: tracing errors and wrong results through precedents and dependents.

Both are copies of the top-level skills in this repo, kept in sync by `npm run sync`. Edit the
originals under `skills/`.

## Install in Claude Code

```sh
claude plugin marketplace add GRID-is/spreadsheet-skills
claude plugin install agent-tools@grid
```

Or from a running session: `/plugin marketplace add GRID-is/spreadsheet-skills` then
`/plugin install agent-tools@grid`.

## Install in Codex

```sh
codex plugin marketplace add GRID-is/spreadsheet-skills
codex plugin add agent-tools@grid
```

## What you get

- The `grid` MCP server with 28 tools: `loadWorkbook`, `describeStructure`, `viewRange`,
  `editCells`, `fillCells`, `runFormula`, `goalSeek`, `whatIf`, `precedents`, `dependents`,
  `listErrors`, `saveWorkbook` and more. See the
  [tool reference](https://docs.grid.is/agent-tools/tools/).
- The two skills above, loaded automatically when a task involves .xlsx files, formulas or
  financial models.

## Updating

The server is resolved by `npx` at launch, so new `@grid-is/agent-tools` releases are picked up on
the next MCP server start. Pin a version by changing the `args` in `.claude-plugin/plugin.json` and
`.mcp.json` to `["-y", "@grid-is/agent-tools@x.y.z"]`.
