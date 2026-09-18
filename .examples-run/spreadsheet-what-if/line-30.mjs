// SKILL.md line 21
import { Model, ValueSnapshot, FormulaError } from "@grid-is/spreadsheet-engine";

await Model.preconditions;
const model = await Model.fromXLSXFile("model.xlsx");    // browser: Model.fromXLSX(arrayBuffer, name)

// SKILL.md line 30
const snapshot = ValueSnapshot.capture(model);

model.write("Assumptions!B2", 0.05);                     // growth
const revenue = model.readValue("=Summary!D10");

snapshot.applyTo(model);                                 // values, spills and names restored, recalculated
