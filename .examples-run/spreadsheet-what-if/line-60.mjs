// SKILL.md line 21
import { Model, ValueSnapshot, FormulaError } from "@grid-is/spreadsheet-engine";

await Model.preconditions;
const model = await Model.fromXLSXFile("model.xlsx");    // browser: Model.fromXLSX(arrayBuffer, name)

// SKILL.md line 60
import { ALL_FORMULA_CELLS } from "@grid-is/spreadsheet-engine";
const wb = model.getWorkbook("model.xlsx");
wb.editCell("Assumptions!B2", { f: "=B1*1.1" });
model.recalculate(ALL_FORMULA_CELLS);
