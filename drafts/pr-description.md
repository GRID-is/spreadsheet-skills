# PR description draft

**Title:** Split skills by task, generate API references from package types

Replaces the two broad skills with thirteen narrow ones named for what developers search, and
makes the API reference inside each skill generated from the installed packages.

- 13 skills under `skills/`, each with a search-first description, a hand-written SKILL.md and
  generated `reference/` files. `skills.sh.json` groups them into three sections.
- `npm run sync` regenerates the references from the packages' type definitions, the tool
  catalogue by calling `@grid-is/agent-tools`, the catalogue block every skill carries, and the
  version stamps. `npm run lint` fails on identifiers that do not exist in the packages, bad
  frontmatter, or em dashes. CI runs both; a weekly Action updates the packages and opens a PR.
- Fixes the engine reference: `model.reset()` and `model.writes()` no longer exist in v17,
  replaced by `ValueSnapshot`. Adds fill, sort, reorder, insert and delete cells, tables, comments,
  notes, styles, describeWorkbook, formula parsing, Google Sheets mode, and the error classes.
- Corrects the attribution guidance: evaluation licence v1.1 requires "Powered by GRID".
- The agent-tools plugin now bundles `spreadsheet-mcp` and `excel-formula-debugging` (copies kept
  in sync by the script) and picks up the three tools the old skill did not list.
- README rewritten for the `spreadsheet-skills` repo name. Drafts for the skills.sh listing
  request, the launch post and the manual checklist are under `drafts/`.

## Where the old content went

| Old | New |
|---|---|
| `grid-development/SKILL.md` package overview, golden rules, minimal example | `spreadsheet-engine`, `react-spreadsheet-viewer`, `react-spreadsheet-editor` (each has its own golden rules) |
| `grid-development/SKILL.md` companion packages (numfmt, xlsx-convert, jsfkit) | `spreadsheet-engine` "Companion packages", `xlsx-cell-formatting` (numfmt) |
| `grid-development/SKILL.md` licensing and telemetry | `grid-licensing`, plus a short licence note in every package skill |
| `grid-development/engine.md` setup, creating, reading, writing | `spreadsheet-engine` task map and `reference/model.md` |
| `engine.md` formulas and structural edits | `spreadsheet-engine` task map and `reference/workbook.md` |
| `engine.md` recalculation | `spreadsheet-engine`, `spreadsheet-what-if` |
| `engine.md` what-if and goal seek (used the removed `reset()`) | `spreadsheet-what-if`, rewritten on `ValueSnapshot` |
| `engine.md` exporting | `xlsx-generation`, `spreadsheet-engine` recipes |
| `engine.md` errors, events, introspection | `spreadsheet-engine` (`reference/errors.md`), `spreadsheet-llm-context`, `excel-formula-parser` |
| `grid-development/viewer.md` | `react-spreadsheet-viewer` in full, theme table updated from the docs |
| `grid-development/editor.md` | `react-spreadsheet-editor` in full, plus `insert-cells`, `delete-cells`, `autoFocus`, `focus()` |
| PR #3 branding section | `grid-branding`, attribution sections in both React skills |
| plugin `spreadsheet/SKILL.md` tool tables and conventions | `spreadsheet-mcp` (tables regenerated; adds `createWorkbook`, `selectWorkbook`, `captureRange`, `executeOfficeJs`) |
| plugin `spreadsheet/references/debugging-spreadsheets.md` | `excel-formula-debugging`, all seven sections |
