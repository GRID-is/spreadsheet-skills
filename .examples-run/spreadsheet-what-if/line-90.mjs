// SKILL.md line 21
import { Model, ValueSnapshot, FormulaError } from "@grid-is/spreadsheet-engine";

await Model.preconditions;
const model = await Model.fromXLSXFile("model.xlsx");    // browser: Model.fromXLSX(arrayBuffer, name)

// SKILL.md line 90
const growth = model.goalSeek("Assumptions!B2", "Summary!D20", 1_000_000);
if (growth instanceof FormulaError) {
  // no solution found within the solver's tolerance, e.g. #VALUE!
}
