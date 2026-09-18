// SKILL.md line 21
import { Model, ValueSnapshot, FormulaError } from "@grid-is/spreadsheet-engine";

await Model.preconditions;
const model = await Model.fromXLSXFile("model.xlsx");    // browser: Model.fromXLSX(arrayBuffer, name)

// SKILL.md line 72
const snapshot = ValueSnapshot.capture(model);
const rows = [];
for (const growth of [0.02, 0.04, 0.06, 0.08]) {
  for (const churn of [0.01, 0.02, 0.03]) {
    model.writeMultiple([["Assumptions!B2", growth], ["Assumptions!B5", churn]]);
    rows.push({ growth, churn, npv: model.readValue("=Summary!D20") });
  }
}
snapshot.applyTo(model);
