// SKILL.md line 23
import { Model, describeWorkbook } from "@grid-is/spreadsheet-engine";

await Model.preconditions;
const model = await Model.fromXLSXFile("loan.xlsx");
const wb = model.getWorkbook("loan.xlsx");

const description = describeWorkbook(wb);
console.log(description.toString());

// SKILL.md line 102
const cell = model.readCell("=B5");
const analysis = model.analyzeAndFixFormula(cell.f, { sheetName: "Sheet1" });
if (analysis.status === "ok") {
  const named = analysis.references.map((ref) => description.getCellLabel(model.readCell("=" + String(ref))));
  // "=-PMT(B2/12,B3*12,B1)" depends on: Annual rate, Years, Loan amount
}
