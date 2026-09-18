// SKILL.md line 23
import { Model, describeWorkbook } from "@grid-is/spreadsheet-engine";

await Model.preconditions;
const model = await Model.fromXLSXFile("loan.xlsx");
const wb = model.getWorkbook("loan.xlsx");

const description = describeWorkbook(wb);
console.log(description.toString());

// SKILL.md line 128
import { format } from "numfmt";
const cell = model.readCell("=B2");
format(cell.z ?? "General", cell.v);     // "4.5%"
