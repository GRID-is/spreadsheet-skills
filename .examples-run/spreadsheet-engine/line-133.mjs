import { readFile } from "node:fs/promises";
import { Model, ALL_FORMULA_CELLS } from "@grid-is/spreadsheet-engine";

await Model.preconditions;
const csvText = await readFile("sales.csv", "utf8");
const rows = csvText.trim().split("\n").map((line) => line.split(","));

const model = Model.empty("data.xlsx");
const wb = model.getWorkbook("data.xlsx");
const writes = [];
rows.forEach((row, r) =>
  row.forEach((raw, c) => {
    const ref = String.fromCharCode(65 + c) + (r + 1);       // A1, B1, ... (26 columns max this way)
    const num = Number(raw);
    writes.push([ref, r > 0 && raw !== "" && !Number.isNaN(num) ? num : raw]);
  }),
);
model.writeMultiple(writes);

wb.editCell("E1", { v: "Total" });
wb.editCell("E2", { f: "=C2*D2" });
wb.fill("E2", `E2:E${rows.length}`);        // copies the formula down with adjusted references
model.recalculate(ALL_FORMULA_CELLS);
