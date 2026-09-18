// SKILL.md line 17
import { Model } from "@grid-is/spreadsheet-engine";

await Model.preconditions;
const model = Model.empty("report.xlsx");
const wb = model.getWorkbook("report.xlsx");

wb.editCell("A1", {
  v: "Revenue",
  s: {
    bold: true,
    fontSize: 12,
    fontFamily: "Arial",
    color: { type: "srgb", value: "FFFFFF" },
    fillColor: { type: "srgb", value: "1F4E79" },
    horizontalAlignment: "center",
    borderBottomStyle: "thin",
    borderBottomColor: { type: "srgb", value: "000000" },
  },
});
wb.editCell("B2", { v: 1234.5, s: { numberFormat: "#,##0.00" } });
wb.editCell("C2", { v: 0.185, s: { numberFormat: "0.0%" } });

// SKILL.md line 133
wb.tables.add({
  name: "Sales",
  ref: "Sheet1!A1:D20",                      // sheet-qualified, header row included
  columns: [{ name: "Item" }, { name: "Qty" }, { name: "Unit price" }, { name: "Total" }],
});
model.runFormula("=SUM(Sales[Total])");
wb.tables.getAll();
wb.tables.delete("Sales", { clearData: false });
