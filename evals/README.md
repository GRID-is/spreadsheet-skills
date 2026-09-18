# Agent evals

Behavioural checks: does an agent with these skills loaded pick the right one for a task and
produce a working result? Run by `claude plugin eval` (Claude Code 2.1.269 or later), which starts
a fresh headless session per case, sends the prompt and scores the outcome with the graders beside
it. `npm run test:examples` covers the deterministic half (the code in the skills runs); this
covers the agent half. It calls the model, so it costs money and is not run on every push: see
`.github/workflows/evals.yml`.

```sh
npm run test:evals                       # every case, three runs each
npm run test:evals -- --case goal-seek-rate --runs 1
```

`scripts/run-evals.mjs` assembles a throwaway plugin in `.evals-plugin/` (all thirteen skills, the
grid MCP server, and these cases) because `claude plugin eval` evaluates plugins, not bare skill
folders. Results land in `evals/results/<timestamp>/`.

Each case is a directory with `prompt.md` (the task, phrased as a user would type it, never naming
the skill), optional `case.yaml` and `fixture.sh` (workspace setup that runs outside the sandbox),
and one grader per file under `graders/`. Prefer graders that cost nothing and cannot disagree with
themselves: `tool_used` on the Skill tool for "the right skill fired", and `regex` over a small
result file the prompt asks the agent to write for "the answer is right". Avoid `llm` graders.
