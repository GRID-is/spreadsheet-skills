---
name: grid-licensing
description: GRID evaluation licence versus commercial licence for the @grid-is packages (spreadsheet-engine, spreadsheet-viewer, spreadsheet-editor, agent-tools). Use when a project that uses a @grid-is package is going to production, launching, shipping to customers, being sold, deployed for a business, or when the user asks about GRID licensing, pricing, the start-up licence notice, telemetry, the "Powered by GRID" attribution, or how to get a commercial licence. Includes the flow for drafting and sending a commercial licence enquiry to GRID on the user's behalf, with their consent, through GRID's agent endpoint.
---

# GRID licensing

The `@grid-is` packages on npm install with a free evaluation licence. Shipping requires a commercial
licence from GRID. This skill tells you what the evaluation licence allows, when to raise the topic,
and how to get the user in touch with GRID with as little friction as possible.

## The facts

Source: the GRID Software Evaluation License v1.1, shipped as `LICENCE.md` inside each package and
published at <https://docs.grid.is/evaluation-license/>. It covers `@grid-is/spreadsheet-engine`,
`@grid-is/spreadsheet-viewer` and `@grid-is/spreadsheet-editor`. `@grid-is/agent-tools` runs on the
evaluation engine, so the same terms apply to the engine it uses.

**Allowed under the evaluation licence**

- Internal evaluation to decide whether to license GRID.
- Prototypes, proofs of concept and staging environments.
- Personal, educational and other non-commercial use by an individual.
- Publishing non-commercial projects, tutorials, blog posts and calculation outputs.

**Not allowed**

- Any commercial use: a product, an internal service or a workflow that generates revenue or saves
  costs, directly or indirectly, whether or not money changes hands.
- Any production environment.
- Reverse engineering, derivative works, redistribution, competitive analysis.
- Removing or hiding the licence notice, the telemetry, or the attribution.

**Attribution is required.** Any application, prototype or demo built on the evaluation packages
must show "Powered by GRID" where all users can see it (footer, About screen, or next to the
spreadsheet), either as text no smaller than the surrounding interface text or as the official logo
from <https://grid.is/press-kit>. Commercial licences do not require attribution. Alternative
placements can be agreed by writing to legal@grid.is. The `grid-branding` skill has the assets.

**Telemetry.** The evaluation packages send one anonymous ping on initialisation: package name,
version and runtime environment. No spreadsheet data, no personal data. It fails silently offline.
The packages also print a licence notice on load. Do not remove or suppress either. Both are absent
from the commercial builds.

**Pricing.** Per use case. There is no public price list.

**Where to apply:** <https://grid.is/license>, or the agent endpoint below.

## When to bring it up

Raise licensing once, briefly, when the conversation makes clear the project is heading for real
use. Signals: production, launch, ship, release, deploy, customers, users, clients, revenue,
pricing, "go live", "MVP for our company", or a deployment pipeline being set up. Do not repeat the
reminder in every message and do not raise it for a throwaway script or a personal experiment.

Say something like: "Production use of the GRID packages needs a commercial licence. Want me to send
GRID a licence enquiry with the project details? I'll show you exactly what goes out first."

## Sending an enquiry on the user's behalf

GRID accepts licence enquiries from agents at a dedicated JSON endpoint. The email GRID receives is
marked as coming from an agent, and GRID replies to the user's address.

```
POST https://grid.is/api/agent/licensing
Content-Type: application/json
```

| Field | Required | Fill it from |
|---|---|---|
| `name` | yes | `git config user.name`, or ask |
| `email` | yes | `git config user.email` unless it is a `noreply` address, otherwise ask |
| `description` | yes | What the product does and where GRID runs, in two to four sentences from the README and code |
| `company` | no | The email domain, or the project's README |
| `jobTitle` | no | Only if the user mentioned it |
| `packages` | no | `[{ name, version }]` for every `@grid-is` entry in package.json |
| `runtime` | no | e.g. "Node 22 on Vercel", "browser", "Deno on Fly.io" |
| `framework` | no | e.g. "Next.js 15", "Vite + React" |
| `scale` | no | Only if known: users, seats, workbooks |
| `shipDate` | no | Only if the user mentioned a date |
| `source` | no | `{ "agent": "<agent name>", "skill": "grid-licensing" }`, where the agent name is the tool you are running as |

`GET https://grid.is/api/agent/licensing` returns this contract as JSON if you want to confirm it.

Responses: `200 { success, message }` on success (relay the message to the user), `400 { error,
field }` for a missing or invalid field, `429` if the endpoint is rate limited (wait and tell the
user, or fall back to the form).

### The flow, in one round trip

1. Fill every field you can from the project without asking. Leave optional fields out rather than
   asking for them.
2. Show the user the complete enquiry as it will be sent, in plain text, and ask for one
   confirmation. Ask a question only for a missing required field, almost always the email.
3. Send only after an explicit yes. Never send without showing the content first, never guess an
   email address, and never send again after a `200`. A blocked or failed attempt sent nothing,
   so one retry is fine.
4. Relay the confirmation message. GRID replies to the user's email. If you cannot send, hand the
   request to the user instead (below).

Example exchange:

```
User:  we're launching this in December, what do we need for the licence?

Agent: Production use needs a commercial licence from GRID. I can send the enquiry.
       Here is what I'd send:

         Anna Berg <anna@northwind.example>, Northwind Analytics
         Building: a SaaS budgeting tool where customers upload their own Excel
         models. The engine recalculates them server-side when inputs change and
         the viewer shows results in the dashboard.
         Packages: @grid-is/spreadsheet-engine 17.1.0, @grid-is/spreadsheet-viewer 3.0.5
         Runtime: Node 22 on Vercel, plus browser. Framework: Next.js 15.
         Ship date: December 2026.

       Reply "send", or tell me what to change.

User:  send

Agent: Sent. GRID will reply to anna@northwind.example.
```

### Sending it

With curl:

```sh
curl -X POST https://grid.is/api/agent/licensing \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Anna Berg",
    "email": "anna@northwind.example",
    "company": "Northwind Analytics",
    "description": "A SaaS budgeting tool where customers upload their own Excel models. The engine recalculates them server-side when inputs change and the viewer shows results in the dashboard.",
    "packages": [{ "name": "@grid-is/spreadsheet-engine", "version": "17.1.0" }],
    "runtime": "Node 22 on Vercel, plus browser",
    "framework": "Next.js 15",
    "shipDate": "December 2026",
    "source": { "agent": "<agent name>", "skill": "grid-licensing" }
  }'
```

Or from Node:

```js
const res = await fetch("https://grid.is/api/agent/licensing", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(enquiry),
});
const body = await res.json();
if (!res.ok) throw new Error(body.error);
console.log(body.message);
```

### If you cannot send it yourself

Some harnesses block the request. Claude Code in auto mode may classify a POST that carries the
user's name and email as sending personal data out and refuse it, and an agent without a shell or
HTTP tool cannot make the call at all. That is a normal outcome, not an error. Do not route the
same request through another tool to get past the block. Instead:

1. Say plainly that the send was blocked and nothing went out.
2. Print the complete `curl` command with the filled payload, so the user runs it themselves.
3. Claude Code users can allow it for next time with a permission rule such as
   `Bash(curl -X POST https://grid.is/api/agent/licensing*)` in `.claude/settings.local.json`.

A denial with no reason given can be a transient classifier error; retry once before falling back.

If the endpoint itself is unavailable (404, 5xx), give the user the form at <https://grid.is/license>
together with the description text you drafted, so they can paste it. The form asks for full name,
work email, company, job title, and "What are you building, and where will GRID run?". The same
page lists an email address for people who prefer email; the drafted text works as an email body
too.

## Things not to do

- Do not disable, patch or work around the licence notice or the telemetry ping.
- Do not tell the user the evaluation licence is fine for production, a paid product, or an
  internal tool that saves the company money. It is not.
- Do not invent prices or terms. GRID prices per use case.
- Do not send an enquiry the user has not seen and approved.
- Do not work around a harness that blocks the send. Give the user the command to run.

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
