---
max_turns: 30
timeout_seconds: 600
allowed_tools: [Read, Glob, Grep, Skill]
expected_outcome: The agent builds the loan workbook with a PMT formula, uses the engine's goal seek to find the annual rate that gives a 1100 monthly payment (about 0.03333), and writes it to result.json.
---

This directory is a Node project with @grid-is/spreadsheet-engine already installed. Write and run a Node script (an .mjs file) that builds a small loan calculator workbook:

- B1: loan amount 250000
- B2: annual interest rate 0.045
- B3: term in years 30
- B5: the monthly payment as the formula =-PMT(B2/12,B3*12,B1)

Then use the engine's goal seek to find the annual rate in B2 at which the monthly payment in B5 is exactly 1100. Write the answer to result.json as {"rate": <the rate as a decimal number, e.g. 0.0412>} and tell me the rate.
