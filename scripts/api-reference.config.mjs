// Which exported symbols from which package go into which generated file.
//
// Selectors in `include`:
//   "Name"        a specific exported symbol
//   "kind:class"  every exported symbol of that kind not named elsewhere
//   "rest"        every exported symbol not named elsewhere
// A symbol named explicitly in one output is skipped by kind:/rest selectors
// in the other outputs of the same target.

const ENGINE = "@grid-is/spreadsheet-engine";
const VIEWER = "@grid-is/spreadsheet-viewer";
const EDITOR = "@grid-is/spreadsheet-editor";
const AGENT_TOOLS = "@grid-is/agent-tools";

const engineModel = {
  file: "reference/model.md",
  title: "Model: loading, reading, writing, recalculation",
  intro:
    "`Model` is the entry point. It holds one or more workbooks and the shared dependency graph. " +
    "Value writes recalculate automatically; formula edits go through `Workbook.editCell` and need `model.recalculate(ALL_FORMULA_CELLS)`.",
  include: [
    "Model",
    "AddWorkbookOptions",
    "WriteOptions",
    "RecalculateOptions",
    "RecalcEvent",
    "IterationOptions",
    "ALL_FORMULA_CELLS",
    "CHANGED_ONLY",
    "CHANGED_OR_VOLATILE",
    "ModelMeta",
    "ModelEntity",
    "ModelEventType",
    "ModelEventArgs",
    "ModelEventListener",
    "EvaluationContext",
    "EvaluateExpressionOptions",
    "ValueSnapshot",
    "serializeModel",
    "deserializeModel",
    "ModelError",
  ],
};

const engineWorkbook = {
  file: "reference/workbook.md",
  title: "Workbook and WorkSheet: formulas, structure, export",
  intro:
    "Formula edits, sheet management, row and column operations, fill, sort, merges, defined names, and XLSX export live on `Workbook`. `WorkSheet` gives per-sheet bounds and cell iteration.",
  include: [
    "Workbook",
    "WorkSheet",
    "WorkbookOptions",
    "WorkbookType",
    "WorkbookBody",
    "DefinedName",
    "RewriteFormula",
    "FillType",
    "FILL_TYPES",
    "SortKey",
    "SortOptions",
    "ToXLSXOptions",
    "XLSXOutputType",
    "Dimension",
    "ColumnInfo",
    "OutputBounds",
    "SheetEdgeBlockedReason",
    "SortCellsBlockedReason",
    "ViewSelection",
    "WorkbookView",
    "ViewManager",
  ],
};

const engineCells = {
  file: "reference/cells.md",
  title: "Cells, values and references",
  intro:
    "The shape of a cell as returned by `readCell` and `readCells`, the value types formulas produce, and the helpers for A1 references and coordinates.",
  include: [
    "Cell",
    "CellInterface",
    "CellData",
    "CellItem",
    "CellValue",
    "CellValueAtom",
    "FormulaValue",
    "FormulaArgument",
    "NonMatrixFormulaArgument",
    "ArrayValue",
    "ValueBox",
    "MaybeBoxed",
    "MaybeBoxedFormulaValue",
    "MaybeBoxedFormulaArgument",
    "isBoxed",
    "unbox",
    "isCellValue",
    "isMatrix",
    "Matrix",
    "Lambda",
    "AreaArray",
    "AreaValueArray",
    "AreaCellArray",
    "AreaBoxedValueArray",
    "Reference",
    "A1Reference",
    "NameReference",
    "SlimRange",
    "SlimRangeOrCoords",
    "parseReference",
    "a1ToRowColumn",
    "a1ToRowColumnOrNull",
    "checkA1",
    "isA1Ref",
    "isRef",
    "isNameRef",
    "isCellOrDefinedName",
    "constructCellID",
    "colFromOffs",
    "offsFromCol",
    "MAX_COL",
    "MAX_ROW",
    "Range",
    "Sheet",
  ],
};

const engineStyles = {
  file: "reference/styles-and-metadata.md",
  title: "Styles, number formats, comments, notes, tables, themes",
  intro:
    "Cell formatting is read through `cell.style` and written with `Workbook.editCell` (the `s` field) or the managers below. Threaded comments, legacy notes, Excel tables and the workbook theme each have a manager on the workbook.",
  include: [
    "CellStyle",
    "StyleManager",
    "NamedStyles",
    "NamedStyleDeleteResult",
    "NamedStyleRenameResult",
    "ThemeManager",
    "CommentsManager",
    "NotesManager",
    "AddCommentInput",
    "TableManager",
    "Table",
  ],
};

const enginePivots = {
  file: "reference/pivot-tables.md",
  title: "Pivot tables",
  intro: "Pivot table support as exposed by the type definitions. Check the docs for the current release status before relying on it.",
  include: [
    "PivotManager",
    "PivotTable",
    "PivotCache",
    "PivotColRole",
    "PivotRowRole",
    "PivotPageArea",
    "PivotLookupError",
    "PivotLookupErrorReason",
    "isPivotLookupError",
  ],
};

const engineFormulas = {
  file: "reference/formulas.md",
  title: "Formula parsing, function catalogue and modes",
  intro:
    "Introspection over the formula language: the catalogue of supported worksheet functions, the parser, volatile functions, the Excel and Google Sheets modes, and the reference-rewriting helpers.",
  include: [
    "functionSignatures",
    "parseFormula",
    "formulaParserReady",
    "functions",
    "VOLATILES",
    "MODE_EXCEL",
    "MODE_GOOGLE",
    "MODE_GRID_SHEET",
    "MODE_CANVAS",
    "MODE_ALL",
    "TYPE_ALL",
    "TYPE_ARRAY",
    "TYPE_BLANK",
    "TYPE_BOOL",
    "TYPE_ERROR",
    "TYPE_LAMBDA",
    "TYPE_MISSING",
    "TYPE_NONE",
    "TYPE_NUM",
    "TYPE_RANGE",
    "TYPE_STRING",
    "getReplaceSheetReferencesFn",
    "getReplaceTableReferencesFn",
    "getReplaceWorkbookFn",
    "ReplaceSheetReferencesFn",
    "ReplaceTableReferencesFn",
    "ReplaceWorkbookReferencesFn",
    "FormulaSyntaxError",
    "EvaluationError",
  ],
};

const engineErrors = {
  file: "reference/errors.md",
  title: "Errors: formula error values and thrown errors",
  intro:
    "`FormulaError` values flow through cell values and `runFormula` results; they are not thrown. The `Error` subclasses are thrown by edits the engine refuses.",
  include: [
    "FormulaError",
    "ERROR_CALC",
    "ERROR_DIV0",
    "ERROR_FIELD",
    "ERROR_GETDATA",
    "ERROR_NA",
    "ERROR_NAME",
    "ERROR_NULL",
    "ERROR_NUM",
    "ERROR_REF",
    "ERROR_SPILL",
    "ERROR_SYNTAX",
    "ERROR_UNKNOWN",
    "ERROR_VALUE",
    "EditBlockedError",
    "DataTableEditBlockedError",
    "MergedCellWriteBlockedError",
    "PivotCellWriteBlockedError",
    "PivotDuplicateSourceHeadersError",
    "PivotEditBlockedError",
    "PivotOutputOverlapsDataError",
    "ReorderMergeBlockedError",
    "SheetEdgeBlockedError",
    "SortCellsBlockedError",
    "TableEditBlockedError",
    "NameNotFoundError",
    "SheetNotFoundError",
    "WorkbookNotFoundError",
    "DataTableBlockedOperation",
    "PivotBlockedOperation",
    "TableBlockedOperation",
  ],
};

const engineDescribe = {
  file: "reference/describe-workbook.md",
  title: "describeWorkbook: labelled inputs, outputs and data regions",
  intro:
    "`describeWorkbook(workbook)` analyses a workbook and returns labelled parameters (inputs), calculated cells (outputs) and data islands with detected headers. `toString()` gives a plain-text description suitable for a prompt.",
  include: ["describeWorkbook", "WorkbookDescription", "Parameter"],
};

const engineGraph = {
  file: "reference/dependency-graph.md",
  title: "Dependency graph vertices",
  intro: "Identifiers for cells, names and ranges in the dependency graph, and the conversions between them and references.",
  include: [
    "VertexId",
    "CellVertexId",
    "NameVertexId",
    "RangeVertexId",
    "KnownVertexId",
    "VertexIdSet",
    "vertexIdToCell",
    "vertexIdToReference",
    "referenceToVertexId",
  ],
};

const engineCsf = {
  file: "reference/csf.md",
  title: "CSF types (SheetJS Common Spreadsheet Format)",
  intro: "Types accepted by `Model.fromCsf` and produced by `Workbook.toCSF`.",
  include: [
    "WorkbookCSF",
    "SheetCSF",
    "CellCSF",
    "TableCSF",
    "TableColumnCSF",
    "ChartCSF",
    "DrawingCSF",
    "AxisCSF",
    "CloudConnection",
  ],
};

const engineRest = {
  file: "reference/other.md",
  title: "Other exported symbols",
  include: ["rest"],
};

export const TARGETS = [
  {
    package: ENGINE,
    dts: "dist/index.d.ts",
    outputs: [
      engineModel,
      engineWorkbook,
      engineCells,
      engineStyles,
      enginePivots,
      engineFormulas,
      engineErrors,
      engineDescribe,
      engineGraph,
      engineCsf,
      engineRest,
    ].map((o) => ({ ...o, file: `skills/spreadsheet-engine/${o.file}` })),
  },
  // Slices of the engine reference for the task-shaped skills, so each is
  // complete on its own when installed alone.
  {
    package: ENGINE,
    dts: "dist/index.d.ts",
    outputs: [
      { ...engineDescribe, file: "skills/spreadsheet-llm-context/reference/describe-workbook.md" },
      { ...engineFormulas, file: "skills/excel-formula-parser/reference/formulas.md" },
      { ...engineStyles, file: "skills/xlsx-cell-formatting/reference/styles-and-metadata.md" },
      { ...engineWorkbook, file: "skills/xlsx-generation/reference/workbook.md" },
      { ...engineModel, file: "skills/spreadsheet-what-if/reference/model.md" },
    ],
  },
  {
    package: VIEWER,
    dts: "dist/index.d.ts",
    outputs: [
      {
        file: "skills/react-spreadsheet-viewer/reference/api.md",
        title: "@grid-is/spreadsheet-viewer API",
        include: ["SpreadsheetViewer", "rest"],
      },
    ],
  },
  {
    package: EDITOR,
    dts: "dist/index.d.ts",
    outputs: [
      {
        file: "skills/react-spreadsheet-editor/reference/api.md",
        title: "@grid-is/spreadsheet-editor API",
        include: ["SpreadsheetEditor", "rest"],
      },
    ],
  },
  {
    package: AGENT_TOOLS,
    dts: "dist/index.d.ts",
    outputs: [
      {
        file: "skills/spreadsheet-agent-tools/reference/api.md",
        title: "@grid-is/agent-tools API (package root)",
        intro: "The stateful, file-based tool set and the MCP server helpers. See tools.md for the tool catalogue.",
        include: ["rest"],
      },
    ],
  },
  {
    package: AGENT_TOOLS,
    dts: "dist/tools.d.ts",
    outputs: [
      {
        file: "skills/spreadsheet-agent-tools/reference/tools-module.md",
        title: "@grid-is/agent-tools/tools API",
        intro: "The tools alone, without the MCP server or file session. They run against an in-memory engine `Model`, in Node or a browser bundle.",
        include: ["rest"],
      },
    ],
  },
];

// The catalogue block rendered into every SKILL.md, so an agent that has one
// skill installed knows the rest exist. Keep summaries to one line.
export const CATALOGUE = {
  repo: "GRID-is/spreadsheet-skills",
  groups: [
    {
      title: "Build with GRID's packages",
      skills: [
        {
          name: "spreadsheet-engine",
          summary: "Excel-compatible calculation engine for JavaScript. Load, read, write, recalculate and export workbooks headlessly.",
          packages: [ENGINE],
        },
        {
          name: "excel-formula-parser",
          summary: "Supported function catalogue, formula parsing and validation, Excel and Google Sheets modes.",
          packages: [ENGINE],
        },
        {
          name: "xlsx-generation",
          summary: "Generate .xlsx files from code with working, verified formulas. Export from Node or download in the browser.",
          packages: [ENGINE],
        },
        {
          name: "xlsx-cell-formatting",
          summary: "Styles, number formats, merges, widths, comments and tables in generated or edited workbooks.",
          packages: [ENGINE],
        },
        {
          name: "spreadsheet-what-if",
          summary: "What-if scenarios, sensitivity analysis, snapshot and revert, goal seek against a workbook.",
          packages: [ENGINE],
        },
        {
          name: "spreadsheet-llm-context",
          summary: "Turn a workbook into labelled inputs, outputs and data regions an LLM can reason about.",
          packages: [ENGINE, AGENT_TOOLS],
        },
        {
          name: "react-spreadsheet-viewer",
          summary: "Read-only spreadsheet view in React: sheet tabs, formula bar, selection events, theming.",
          packages: [VIEWER, ENGINE],
        },
        {
          name: "react-spreadsheet-editor",
          summary: "Editable spreadsheet in React: edit events for autosave, controller, size limits, fonts.",
          packages: [EDITOR, ENGINE],
        },
      ],
    },
    {
      title: "Give an AI agent spreadsheets",
      skills: [
        {
          name: "spreadsheet-mcp",
          summary: "Load, inspect, edit and recalculate .xlsx files from Claude Code, Cursor or any MCP client.",
          packages: [AGENT_TOOLS],
        },
        {
          name: "excel-formula-debugging",
          summary: "Trace #REF!, #DIV/0!, #VALUE! and wrong results through precedents and dependents.",
          packages: [AGENT_TOOLS],
        },
        {
          name: "spreadsheet-agent-tools",
          summary: "Wire GRID's spreadsheet tools into your own agent with the Claude API, OpenAI Agents SDK or LangChain.",
          packages: [AGENT_TOOLS],
        },
      ],
    },
    {
      title: "Working with GRID",
      skills: [
        {
          name: "grid-licensing",
          summary: "Evaluation versus commercial licence, telemetry, attribution, and how to request a commercial licence.",
          packages: [],
        },
        {
          name: "grid-branding",
          summary: "Official GRID logos and the Powered by GRID lockup, and how to use them.",
          packages: [],
        },
      ],
    },
  ],
};
