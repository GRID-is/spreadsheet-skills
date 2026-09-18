#!/usr/bin/env node
// Builds the workbooks the runnable examples in the skills load, into the
// directory given as the first argument. Written with the engine itself so the
// repo carries no binary files and the fixtures always match the installed
// engine's file format.
//
//   node tests/fixtures/build-fixtures.mjs <dir>
//
// What each workbook is for:
//   budget.xlsx  spreadsheet-engine quick start: Sheet1 spend in column D,
//                Assumptions!B2 drives Summary!B10
//   model.xlsx   spreadsheet-what-if and excel-formula-parser: a small revenue
//                model on Assumptions and Summary, plus a Sheet1 data table
//   loan.xlsx    spreadsheet-llm-context: a labelled loan calculator
//   sales.csv    spreadsheet-engine "from CSV" example

import fs from "node:fs";
import path from "node:path";
import { Model, ALL_FORMULA_CELLS } from "@grid-is/spreadsheet-engine";

const dir = process.argv[2];
if (!dir) {
  console.error("usage: build-fixtures.mjs <dir>");
  process.exit(1);
}
fs.mkdirSync(dir, { recursive: true });

await Model.preconditions;

// Model.empty() starts with Sheet1; `extraSheets` are added after it.
async function build(name, extraSheets, setup) {
  const model = Model.empty(name);
  const wb = model.getWorkbook(name);
  for (const sheetName of extraSheets) wb.addSheet(sheetName);
  setup(model, wb);
  model.recalculate(ALL_FORMULA_CELLS);
  await wb.toXLSXFile(path.join(dir, name));
}

await build("budget.xlsx", ["Summary", "Assumptions"], (model, wb) => {
  model.writeMultiple([
    ["Sheet1!A1", "Category"], ["Sheet1!D1", "Spend"],
    ["Sheet1!A2", "Rent"], ["Sheet1!D2", 100],
    ["Sheet1!A3", "Travel"], ["Sheet1!D3", 200],
    ["Sheet1!A4", "Tools"], ["Sheet1!D4", 300],
    ["Assumptions!A2", "Growth"], ["Assumptions!B2", 0.03],
    ["Summary!A10", "Revenue"], ["Summary!A11", "Revenue with uplift"],
  ]);
  wb.editCell("Summary!B10", { f: "=1000*(1+Assumptions!B2)" });
});

await build("model.xlsx", ["Assumptions", "Summary"], (model, wb) => {
  model.writeMultiple([
    ["Sheet1!A1", "Item"], ["Sheet1!B1", "Qty"], ["Sheet1!C1", "Unit price"], ["Sheet1!D1", "Total"],
    ["Sheet1!A2", "Apples"], ["Sheet1!B2", 5], ["Sheet1!C2", 1.25],
    ["Sheet1!A3", "Pears"], ["Sheet1!B3", 7], ["Sheet1!C3", 0.8],
    ["Sheet1!A4", "Plums"], ["Sheet1!B4", 5], ["Sheet1!C4", 2],
    ["Assumptions!A1", "Base price"], ["Assumptions!B1", 100],
    ["Assumptions!A2", "Growth"], ["Assumptions!B2", 0.03],
    ["Assumptions!A3", "Units"], ["Assumptions!B3", 1000],
    ["Assumptions!A4", "Include upsell"], ["Assumptions!B4", true],
    ["Assumptions!A5", "Churn"], ["Assumptions!B5", 0.02],
    ["Summary!C10", "Revenue"], ["Summary!C20", "NPV"],
  ]);
  wb.editCell("Sheet1!D2", { f: "=B2*C2" });
  wb.fill("Sheet1!D2", "Sheet1!D2:D4");
  wb.editCell("Summary!D10", { f: "=Assumptions!B1*Assumptions!B3*(1+Assumptions!B2)" });
  wb.editCell("Summary!D20", { f: "=D10*(1+Assumptions!B2-Assumptions!B5)*10" });
});

await build("loan.xlsx", [], (model, wb) => {
  model.writeMultiple([
    ["A1", "Loan amount"], ["B1", 250000],
    ["A2", "Annual rate"], ["B2", 0.045],
    ["A3", "Years"], ["B3", 30],
    ["A5", "Monthly payment"],
    ["A6", "Total paid"],
  ]);
  wb.editCell("B2", { s: { numberFormat: "0.0%" } });
  wb.editCell("B5", { f: "=-PMT(B2/12,B3*12,B1)" });
  wb.editCell("B6", { f: "=B5*B3*12" });
});

fs.writeFileSync(
  path.join(dir, "sales.csv"),
  ["item,region,qty,price", "Apples,North,3,1.25", "Pears,South,2,0.8", "Plums,North,5,2"].join("\n") + "\n",
);

console.log(`fixtures written to ${dir}`);
