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

// SKILL.md line 89
wb.styles.named.add({ name: "Heading", bold: true, fontSize: 14 });
wb.editCell("A1", { s: { extendsStyle: "Heading" } });
wb.styles.named.update("Heading", { color: { type: "srgb", value: "4472C4" } });
wb.styles.named.rename("Heading", "Title");
wb.styles.named.delete("Title");
