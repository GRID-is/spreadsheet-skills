---
max_turns: 30
timeout_seconds: 600
allowed_tools: [Read, Glob, Grep, Skill]
expected_outcome: report.xlsx is written by a Node script using @grid-is/spreadsheet-engine, the Total column and grand total are spreadsheet formulas, and result.json records the grand total 28.7 and the formula in D2.
---

This directory is a Node project with @grid-is/spreadsheet-engine already installed. Write and run a Node script (an .mjs file) that creates report.xlsx with this data starting in A1:

Item | Qty | Unit price
Apples | 12 | 0.95
Pears | 7 | 1.4
Plums | 30 | 0.25

Add a "Total" column D where every row is a spreadsheet formula multiplying Qty by Unit price (a formula in the cell, not a number computed in JavaScript), and put a grand total in D5 as a formula that sums the Total column. Recalculate, then read the grand total and the formula in D2 back from the workbook and write them to result.json as {"grandTotal": <number>, "totalFormula": "<formula>"}. Save the workbook as report.xlsx and tell me the grand total.
