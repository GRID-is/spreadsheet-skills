# Launch post: spreadsheet skills for coding agents

Drafts for X and Hacker News. Not published. The before/after is real output from
`describeWorkbook` in `@grid-is/spreadsheet-engine` 17.1 on a small loan calculator; swap in a
screenshot of a bigger model if one is available.

---

## X thread

**1/**
We just rewrote GRID's agent skills. 13 narrow skills instead of 2 broad ones, each with an API
reference generated from the package's own types, so the agent never gets told about a method that
doesn't exist.

npx skills add GRID-is/spreadsheet-skills

**2/**
The one I'd try first: spreadsheet-llm-context.

Before, the agent gets this for a loan model:

B1: 250000
B2: 0.045
B3: 30
B5: =-PMT(B2/12,B3*12,B1)
B6: =B5*B3*12

**3/**
After, with one call to describeWorkbook:

3 apparent inputs:
* Loan amount: B1 with value 250000
* Annual rate: B2 with value 0.045
* Years: B3 with value 30
3 apparent calculated values:
* Monthly payment: Sheet1!B5
* Total paid: Sheet1!B6
* Interest: Sheet1!E2:E4

**4/**
The engine reads the labels next to the numbers, separates inputs from outputs, and hands back
text you can paste into a prompt, plus the same thing as JSON. Then the agent can run scenarios by
label ("set Annual rate to 5%") instead of guessing addresses.

**5/**
The other skills: spreadsheet-engine, xlsx-generation (files with formulas that are actually
evaluated, so you can assert on totals in a test), spreadsheet-what-if, excel-formula-debugging over
MCP, React viewer and editor, and more.

github.com/GRID-is/spreadsheet-skills

---

## Hacker News

**Title:** Show HN: Agent skills for an Excel-compatible spreadsheet engine, with generated API refs

**Text:**

We make an Excel-compatible spreadsheet engine for JavaScript (GRID, grid.is). Coding agents kept
getting our API wrong, in both directions: inventing methods, and not knowing about ones that
exist. The worst case was an agent confidently using `model.reset()`, which we removed two major
versions ago.

So we rebuilt our agent skills repo around one idea: the reference part of each skill is generated
from the `.d.ts` files in the published package, and a lint fails CI if a code example uses an
identifier the package does not export. A weekly Action bumps the packages, regenerates, and opens a
PR. The hand-written part (golden rules, task map, recipes) stays short so the generated part carries
the churn. Each skill also tells the agent to check the installed version and to trust the
package's own types when they are newer than the skill.

The skills themselves are narrow and named for what people search: spreadsheet-engine,
xlsx-generation, spreadsheet-what-if, excel-formula-parser, react-spreadsheet-viewer,
spreadsheet-mcp (an MCP server that loads, edits and recalculates .xlsx files), and so on.

The one I'd point at first is spreadsheet-llm-context. Given a workbook, `describeWorkbook` returns
the inputs and outputs labelled from nearby headers. For a small loan calculator the raw cells are:

    B1: 250000        B5: =-PMT(B2/12,B3*12,B1)
    B2: 0.045         B6: =B5*B3*12
    B3: 30            E2:E4: =B1*B2/12 ...

and the description is:

    3 apparent inputs:
    * Loan amount: B1 with value 250000
    * Annual rate: B2 with value 0.045
    * Years: B3 with value 30
    3 apparent calculated values/ranges:
    * Monthly payment: Sheet1!B5
    * Total paid: Sheet1!B6
    * Interest: Sheet1!E2:E4

That is what you put in the prompt, and then the model can drive scenarios by label.

Repo: https://github.com/GRID-is/spreadsheet-skills
Install: `npx skills add GRID-is/spreadsheet-skills`

The packages are free to evaluate and need a commercial licence for production; that is in the
skills too, including a way for the agent to draft the licence enquiry from the project's
package.json so nobody has to fill in a form.

Happy to answer questions about the generator or the engine.
