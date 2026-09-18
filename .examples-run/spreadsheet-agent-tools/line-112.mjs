import { readFile } from "node:fs/promises";
import { Model } from "@grid-is/apiary";
import { describeStructure, editCells, readCalculatedValues, spreadsheetTools } from "@grid-is/agent-tools/tools";
import { z } from "zod";

await Model.preconditions;
const bytes = await readFile("budget.xlsx");                   // or from an upload or fetch
const model = await Model.fromXLSX(bytes, "budget.xlsx");
const ctx = { model };

const structure = describeStructure.execute(ctx, {});
const written = editCells.execute(ctx, { apply: [{ target: "B2", value: 42 }] });
const values = readCalculatedValues.execute(ctx, { read: ["=SUM(B:B)"] });

// JSON Schema for the model, from the zod schema on each tool
z.toJSONSchema(editCells.parameters);
