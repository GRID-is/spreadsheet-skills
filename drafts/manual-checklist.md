# Manual steps after merging the restructure

Things only a person with the right access can do, in the order that avoids broken links.

## GitHub

- [ ] Rename the repository from `GRID-is/skills` to `GRID-is/spreadsheet-skills` (Settings,
      General, Repository name). GitHub redirects the old name, so existing `npx skills add
      GRID-is/skills` installs keep working.
- [ ] Add topics: `agent-skills`, `skills-sh`, `claude-code`, `codex`, `cursor`, `mcp`,
      `spreadsheet`, `excel`, `xlsx`, `formulas`.
- [ ] Set the repository description to something like "Agent skills for GRID's Excel-compatible
      spreadsheet engine, viewer, editor and MCP server" and the website to https://docs.grid.is.
- [ ] Enable Actions for the repo and check that the `CI` workflow runs on the merge. The
      `Sync API reference` workflow needs "Allow GitHub Actions to create and approve pull
      requests" turned on (Settings, Actions, General, Workflow permissions).
- [ ] Add an `ANTHROPIC_API_KEY` repository secret for the `Skill evals` workflow (Settings,
      Secrets and variables, Actions). Without it the weekly eval run and the eval job on the sync
      PR fail at the first model call. Budget: roughly $2 to $5 per full run at three runs per case.
- [ ] Close PR #3 (branding section). Its content is now the `grid-branding` skill and the
      attribution sections in the React skills, updated for licence v1.1, which requires attribution.
- [ ] Optional: in the engine, viewer, editor and agent-tools release workflows, add a step that
      fires `repository_dispatch` with event type `package-released` on this repo, so the sync PR
      opens the day a package ships instead of the following Monday.

## skills.sh

- [ ] Run one install with telemetry enabled so skills.sh registers the new repo name and reads
      `skills.sh.json`: `npx skills add GRID-is/spreadsheet-skills --skill spreadsheet-engine`.
      Check https://skills.sh/GRID-is/spreadsheet-skills shows the three groups.
- [ ] Send the Official listing request in `drafts/skills-sh-official-listing-email.md`.
- [ ] Publish the launch post in `drafts/launch-post.md` once the skills.sh page renders.

## GRID-web

- [ ] Deploy the routes in `src/app/api/agent/licensing` and `src/app/api/forms/enquiry`. The
      website route was renamed, so this must ship together with the form components that call it
      (they are in the same change).
- [ ] Send one real enquiry through `POST /api/agent/licensing` after deploy and confirm the
      email arrives with the "[AI agent]" subject, the Channel row, and the `licensing-agent` tag in
      Postmark. Nothing in this change was tested against Postmark.
- [ ] Deploy the site copy changes only after the GitHub rename. The onboarding prompts in
      `src/utils/consts.ts` now install one skill from `GRID-is/spreadsheet-skills`
      (`spreadsheet-engine` on the home hero and get-started page, `react-spreadsheet-editor` on the
      "Build an editor" tab), and the mentions in `AgentTools.tsx` and the FAQ content use the new
      name. Until the rename lands, those commands fail.

## Docs and packages

- [ ] docs.grid.is: update `llms.txt` ("For coding agents") and the "Building with an AI agent?"
      box on the Installing page to `npx skills add GRID-is/spreadsheet-skills`, and consider naming
      the skill per package (engine page links `--skill spreadsheet-engine`, and so on).
- [ ] Package READMEs and `AGENTS.md` in spreadsheet-engine, spreadsheet-viewer and
      spreadsheet-editor still say `npx skills add GRID-is/skills` and that "the evaluation licence
      does not require attribution". The shipped LICENCE.md v1.1 requires it (section 2.3). Fix both
      in the next package releases.
- [ ] Decide whether `info@grid.is` is the address the licensing skill should name as the email
      fallback. The licence page shows an obfuscated address; the skill currently points at the form
      and says "the same page lists an email address" without naming one.

## Later

- [ ] Pivot tables: the engine exports `PivotManager`, `PivotTable` and `PivotCache` and the
      generated `reference/pivot-tables.md` lists them, but there is no prose. When the feature is
      released with docs, add a `spreadsheet-pivot-tables` skill.
- [ ] If Google Sheets traffic justifies it, split a `google-sheets-formulas` skill out of
      `excel-formula-parser`. The mode constants and function counts are already documented there.
- [ ] Durable rate limiting on the agent licensing route (Upstash or Vercel KV) if the channel ever
      gets noisy. Muting the `licensing-agent` Postmark tag is the stopgap.
