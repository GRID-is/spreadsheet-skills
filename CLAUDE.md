# Working on this repo

This repo publishes GRID's agent skills. Each folder under `skills/` is one skill: a hand-written
`SKILL.md` plus generated files under `reference/`. `plugins/agent-tools/` is a Claude Code and
Codex plugin whose `skills/` folder is a copy of two of the top-level skills.

## Rules for editing a skill

- **Check the other skills when you change one.** The skills repeat shared facts: the licence note,
  the attribution requirement, the "Staying current" procedure, the golden rules, package names
  and versions, install commands, the endpoint for licence enquiries. If you change such a fact in
  one skill, grep for it across `skills/` and update every copy. The catalogue block and version
  stamps are generated, so do not edit those by hand; edit `scripts/api-reference.config.mjs` and
  run `npm run sync`.
- **Never invent an API.** Every method, prop, tool name or option in a code fence must exist in the
  installed package's type definitions. `npm run lint` checks this. When in doubt, run it against
  the package in `node_modules` before writing it down.
- **Descriptions lead with what people search for.** The frontmatter `description` is what
  `npx skills find` and agents' auto-invoke match on. Start with the task and the words a developer
  types (spreadsheet, Excel, xlsx, formulas, React), name the package, then list trigger phrases.
  No marketing language. Keep it under 1024 characters.
- **Folder name equals frontmatter name.** The lint checks it.
- **No em dashes** anywhere in the skills, and no colons used as em-dash substitutes.
- **Generated files are generated.** Anything starting with `<!-- GENERATED FILE` is overwritten by
  `npm run sync`. Change the generator or its config instead.
- **Plugin skills are copies.** `npm run sync` copies `spreadsheet-mcp` and
  `excel-formula-debugging` into `plugins/agent-tools/skills/`. Edit the top-level ones.

## Before opening a PR

```sh
npm install
npm run sync
npm run lint
claude plugin validate plugins/agent-tools     # if the claude CLI is available
```

## Adding a skill

1. Create `skills/<name>/SKILL.md` with `name`, `description` and optionally `compatibility` in the
   frontmatter, and the two marker blocks every skill carries:
   `<!-- generated:catalogue -->` / `<!-- /generated:catalogue -->` and, for package skills,
   `<!-- generated:versions -->` / `<!-- /generated:versions -->`.
2. Add it to `CATALOGUE` in `scripts/api-reference.config.mjs` with a one-line summary and the
   packages it covers, and to a group in `skills.sh.json`.
3. If it needs generated reference files, add an output to `TARGETS` in the same config.
4. Add a row to the README table.
5. Run `npm run sync` and `npm run lint`.
