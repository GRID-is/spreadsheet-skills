// SKILL.md line 23
import { Model, functionSignatures, MODE_EXCEL, MODE_GOOGLE } from "@grid-is/spreadsheet-engine";

await Model.preconditions;
const excel = functionSignatures(MODE_EXCEL);       // { SUM: [...], XLOOKUP: [...], ... }
const google = functionSignatures(MODE_GOOGLE);
const all = functionSignatures();                   // every function in any mode

Object.keys(excel).length;                          // 467 in v17.1
Object.keys(google).length;                         // 500 in v17.1
"QUERY" in google;                                  // true; Google Sheets only
"XLOOKUP" in excel && "LET" in excel && "LAMBDA" in excel;   // true

// SKILL.md line 68
const model = await Model.fromXLSXFile("model.xlsx");

model.analyzeAndFixFormula("=SUM(B2:B4)");
// { status: "ok", formula: "=SUM(B2:B4)", result: 17, references: [...], functions: ["SUM"] }

model.analyzeAndFixFormula("=SUMM(B2:B4)");
// { status: "has_problems", problems: [{ type: "uses_unsupported_functions", unsupportedFunctions: ["SUMM"] }] }

model.analyzeAndFixFormula("=SUM(B2:B4");
// { status: "unparsable_formula" }

// SKILL.md line 103
import { VOLATILES } from "@grid-is/spreadsheet-engine";
VOLATILES.has("NOW");       // true; NOW, TODAY, RAND, RANDARRAY, RANDBETWEEN and others
