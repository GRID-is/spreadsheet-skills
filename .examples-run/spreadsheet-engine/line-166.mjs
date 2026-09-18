// SKILL.md line 48
import { Model, ALL_FORMULA_CELLS } from "@grid-is/spreadsheet-engine";

await Model.preconditions;
const model = await Model.fromXLSXFile("budget.xlsx");

model.runFormula("=SUM(D:D)");            // evaluate anything against the workbook
model.readValue("=Summary!B10");          // computed value of a cell
model.write("Assumptions!B2", 0.05);      // dependents recalculate automatically

const wb = model.getWorkbook("budget.xlsx");
wb.editCell("Summary!B11", { f: "=B10*1.1" });
model.recalculate(ALL_FORMULA_CELLS);     // required after a formula edit

await wb.toXLSXFile("budget-updated.xlsx");

// SKILL.md line 166
import { FormulaError } from "@grid-is/spreadsheet-engine";

const check = model.analyzeAndFixFormula("=SUM(B2:B9");
if (check.status !== "ok") {
  // "unparsable_formula", or "has_problems" with a problems array
}
const trial = model.runFormula("=SUM(B2:B9)");
if (trial instanceof FormulaError) {
  // trial.detail often explains why
}
