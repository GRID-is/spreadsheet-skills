// SKILL.md line 21
import { Model, ValueSnapshot, FormulaError } from "@grid-is/spreadsheet-engine";

await Model.preconditions;
const model = await Model.fromXLSXFile("model.xlsx");    // browser: Model.fromXLSX(arrayBuffer, name)

// SKILL.md line 49
model.writeMultiple([
  ["Assumptions!B2", 0.05],
  ["Assumptions!B3", 1200],
  ["Assumptions!B4", true],
]);                                                      // one recalculation pass
