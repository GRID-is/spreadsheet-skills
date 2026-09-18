// SKILL.md line 21
import { Model, ALL_FORMULA_CELLS, FormulaError } from "@grid-is/spreadsheet-engine";

await Model.preconditions;
const model = Model.empty("report.xlsx");
const wb = model.getWorkbook("report.xlsx");

// 1. Data in one batch (one recalculation pass)
model.writeMultiple([
  ["A1", "Item"], ["B1", "Qty"], ["C1", "Unit price"], ["D1", "Total"],
  ["A2", "Apples"], ["B2", 3], ["C2", 1.25],
  ["A3", "Pears"], ["B3", 2], ["C3", 0.8],
]);

// 2. Formulas, then recalculate
wb.editCell("D2", { f: "=B2*C2" });
wb.fill("D2", "D2:D3");                       // fills the formula down, references adjusted
wb.editCell("A5", { v: "Grand total" });
wb.editCell("D5", { f: "=SUM(D2:D3)" });
model.recalculate(ALL_FORMULA_CELLS);

// 3. Verify before saving
const total = model.readValue("=D5");
if (total instanceof FormulaError || total !== 5.35) throw new Error(`Unexpected total ${total}`);

// 4. Save
await wb.toXLSXFile("report.xlsx");           // Node

// SKILL.md line 140
const check = await Model.fromXLSXFile("report.xlsx", { readOnly: true });
check.readValue("=D5");                       // 5.35, from the cached value
