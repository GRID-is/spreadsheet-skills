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

// SKILL.md line 181
import { ValueSnapshot } from "@grid-is/spreadsheet-engine";

const snapshot = ValueSnapshot.capture(model);
model.write("Assumptions!B2", 0.08);
const outcome = model.readValue("=Summary!B10");
snapshot.applyTo(model);                  // values and spills restored, recalculated
