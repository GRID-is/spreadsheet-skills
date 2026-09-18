// SKILL.md line 23
import { Model, describeWorkbook } from "@grid-is/spreadsheet-engine";

await Model.preconditions;
const model = await Model.fromXLSXFile("loan.xlsx");
const wb = model.getWorkbook("loan.xlsx");

const description = describeWorkbook(wb);
console.log(description.toString());

// SKILL.md line 79
const d = describeWorkbook(wb);
const inputs = d.summary.parameters.map((p) => `${p.labels.join(" / ")} (${p.reference}) = ${p.value}`);
const outputs = d.summary.calculated.map((c) => `${c.labels.join(" / ")} (${c.reference})`);

const system = [
  "You are answering questions about a spreadsheet model.",
  d.summary.description,
  "Inputs:", ...inputs,
  "Outputs:", ...outputs,
  "To change an input or read an output, call the tool with the reference in parentheses.",
].join("\n");
