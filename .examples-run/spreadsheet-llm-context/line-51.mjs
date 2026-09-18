// SKILL.md line 23
import { Model, describeWorkbook } from "@grid-is/spreadsheet-engine";

await Model.preconditions;
const model = await Model.fromXLSXFile("loan.xlsx");
const wb = model.getWorkbook("loan.xlsx");

const description = describeWorkbook(wb);
console.log(description.toString());

// SKILL.md line 51
description.summary.parameters;
// [{ labels: ["Loan amount"], reference: "B1", referenceLabel: "B1", value: "250000", type: "slider" }, ...]
description.summary.calculated;
// [{ labels: ["Monthly payment"], reference: "B5", referenceLabel: "B5", type: "text" }, ...]
description.summary.description;   // the sheet inventory paragraph
