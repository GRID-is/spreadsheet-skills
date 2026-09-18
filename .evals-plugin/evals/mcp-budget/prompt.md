---
max_turns: 30
timeout_seconds: 600
allowed_tools: [Read, Glob, Grep, Skill]
expected_outcome: The agent uses the grid MCP tools to create budget.xlsx with a SUM formula, saves it, and reports the total 1629.
---

Create a spreadsheet file called budget.xlsx in this directory. Put "Category" in A1 and "Amount" in B1, then these rows: Rent 1200, Travel 340, Tools 89. Put "Total" in A5 and a formula in B5 that sums the amounts. Save the file and tell me the total.
