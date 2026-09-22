<!-- GENERATED FILE. Do not edit by hand. Regenerate with `npm run sync`. -->

# @grid-is/agent-tools/tools API

Generated from `@grid-is/agent-tools@0.3.3` (`dist/tools.d.ts`). Every public symbol listed here exists in that version. If the installed version differs, read `node_modules/@grid-is/agent-tools/dist/tools.d.ts` instead; it is the source of truth.

The tools alone, without the MCP server or file session. They run against an in-memory engine `Model`, in Node or a browser bundle.

## class SpreadsheetTool

### name

```ts
readonly name: string
```

### description

```ts
readonly description: string
```

### parameters

```ts
readonly parameters: TParams
```

### new SpreadsheetTool()

```ts
constructor(options: {
    name: string;
    description: string;
    parameters: TParams;
    run: (ctx: ToolContext, input: z.infer<TParams>) => TResult;
  })
```

### execute()

```ts
execute(ctx: ToolContext, input: z.infer<TParams>): TResult | ToolError
```

## interface ToolContext

Per-call context passed to tool implementations. Carries the model under
test plus any per-call data the tool may want (load-time mismatches today,
potentially more later).

### model

```ts
readonly model: Model
```

### mismatches

```ts
readonly mismatches?: LoadMismatches
```

### type ToolError

```ts
type ToolError = {
  error: string;
}
```

### const captureRange

```ts
const captureRange: SpreadsheetTool<z.ZodObject<{
  reference: z.ZodString;
  headers: z.ZodDefault<z.ZodBoolean>;
  scale: z.ZodDefault<z.ZodNumber>;
}, z.core.$strip>, Promise<ToolError | Uint8Array<ArrayBufferLike>>>
```

### const dependents

```ts
const dependents: SpreadsheetTool<import("zod").ZodObject<{
  reference: import("zod").ZodString;
  mode: import("zod").ZodDefault<import("zod").ZodEnum<{
    cells: "cells";
    grouped: "grouped";
  }>>;
  maxDepth: import("zod").ZodOptional<import("zod").ZodNumber>;
  maxNodes: import("zod").ZodOptional<import("zod").ZodNumber>;
}, import("zod/v4/core").$strip>, GraphToolResult>
```

### const describeStructure

```ts
const describeStructure: SpreadsheetTool<import("zod").ZodObject<{
  sheets: import("zod").ZodOptional<import("zod").ZodArray<import("zod").ZodString>>;
  labelOffset: import("zod").ZodOptional<import("zod").ZodNumber>;
}, import("zod/v4/core").$strip>, DescribeStructureResult | ToolError>
```

### const editCellStyles

```ts
const editCellStyles: SpreadsheetTool<z.ZodObject<{
  sheet: z.ZodString;
  apply: z.ZodArray<z.ZodObject<{
    target: z.ZodString;
    styles: z.ZodObject<{
      bold: z.ZodOptional<z.ZodBoolean>;
      borderBottomColor: z.ZodOptional<z.ZodString>;
      borderBottomStyle: z.ZodOptional<z.ZodEnum<{
        none: "none";
        dashDot: "dashDot";
        dashDotDot: "dashDotDot";
        dashed: "dashed";
        dotted: "dotted";
        double: "double";
        hair: "hair";
        medium: "medium";
        mediumDashDot: "mediumDashDot";
        mediumDashDotDot: "mediumDashDotDot";
        mediumDashed: "mediumDashed";
        slantDashDot: "slantDashDot";
        thick: "thick";
        thin: "thin";
      }>>;
      borderLeftColor: z.ZodOptional<z.ZodString>;
      borderLeftStyle: z.ZodOptional<z.ZodEnum<{
        none: "none";
        dashDot: "dashDot";
        dashDotDot: "dashDotDot";
        dashed: "dashed";
        dotted: "dotted";
        double: "double";
        hair: "hair";
        medium: "medium";
        mediumDashDot: "mediumDashDot";
        mediumDashDotDot: "mediumDashDotDot";
        mediumDashed: "mediumDashed";
        slantDashDot: "slantDashDot";
        thick: "thick";
        thin: "thin";
      }>>;
      borderRightColor: z.ZodOptional<z.ZodString>;
      borderRightStyle: z.ZodOptional<z.ZodEnum<{
        none: "none";
        dashDot: "dashDot";
        dashDotDot: "dashDotDot";
        dashed: "dashed";
        dotted: "dotted";
        double: "double";
        hair: "hair";
        medium: "medium";
        mediumDashDot: "mediumDashDot";
        mediumDashDotDot: "mediumDashDotDot";
        mediumDashed: "mediumDashed";
        slantDashDot: "slantDashDot";
        thick: "thick";
        thin: "thin";
      }>>;
      borderTopColor: z.ZodOptional<z.ZodString>;
      borderTopStyle: z.ZodOptional<z.ZodEnum<{
        none: "none";
        dashDot: "dashDot";
        dashDotDot: "dashDotDot";
        dashed: "dashed";
        dotted: "dotted";
        double: "double";
        hair: "hair";
        medium: "medium";
        mediumDashDot: "mediumDashDot";
        mediumDashDotDot: "mediumDashDotDot";
        mediumDashed: "mediumDashed";
        slantDashDot: "slantDashDot";
        thick: "thick";
        thin: "thin";
      }>>;
      fillColor: z.ZodOptional<z.ZodString>;
      fontColor: z.ZodOptional<z.ZodString>;
      fontName: z.ZodOptional<z.ZodString>;
      fontSize: z.ZodOptional<z.ZodNumber>;
      horizontalAlignment: z.ZodOptional<z.ZodEnum<{
        fill: "fill";
        general: "general";
        left: "left";
        center: "center";
        right: "right";
        justify: "justify";
        centerContinuous: "centerContinuous";
        distributed: "distributed";
      }>>;
      italic: z.ZodOptional<z.ZodBoolean>;
      numberFormat: z.ZodOptional<z.ZodString>;
      numberFormatFromFormula: z.ZodOptional<z.ZodString>;
      shrinkToFit: z.ZodOptional<z.ZodBoolean>;
      underline: z.ZodOptional<z.ZodEnum<{
        none: "none";
        double: "double";
        single: "single";
        singleAccounting: "singleAccounting";
        doubleAccounting: "doubleAccounting";
      }>>;
      verticalAlignment: z.ZodOptional<z.ZodEnum<{
        center: "center";
        justify: "justify";
        distributed: "distributed";
        bottom: "bottom";
        top: "top";
      }>>;
      wrapText: z.ZodOptional<z.ZodBoolean>;
    }, z.core.$strip>;
  }, z.core.$strip>>;
  note: z.ZodOptional<z.ZodString>;
}, z.core.$strip>, ToolError | EditCellStylesResult>
```

### const editCells

```ts
const editCells: SpreadsheetTool<z.ZodObject<{
  apply: z.ZodArray<z.ZodObject<{
    target: z.ZodString;
    value: z.ZodOptional<z.ZodUnion<readonly [z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodNull]>>;
    styleIndex: z.ZodOptional<z.ZodNumber>;
  }, z.core.$strip>>;
  styles: z.ZodOptional<z.ZodArray<z.ZodObject<{
    bold: z.ZodOptional<z.ZodBoolean>;
    borderBottomColor: z.ZodOptional<z.ZodString>;
    borderBottomStyle: z.ZodOptional<z.ZodEnum<{
      none: "none";
      dashDot: "dashDot";
      dashDotDot: "dashDotDot";
      dashed: "dashed";
      dotted: "dotted";
      double: "double";
      hair: "hair";
      medium: "medium";
      mediumDashDot: "mediumDashDot";
      mediumDashDotDot: "mediumDashDotDot";
      mediumDashed: "mediumDashed";
      slantDashDot: "slantDashDot";
      thick: "thick";
      thin: "thin";
    }>>;
    borderLeftColor: z.ZodOptional<z.ZodString>;
    borderLeftStyle: z.ZodOptional<z.ZodEnum<{
      none: "none";
      dashDot: "dashDot";
      dashDotDot: "dashDotDot";
      dashed: "dashed";
      dotted: "dotted";
      double: "double";
      hair: "hair";
      medium: "medium";
      mediumDashDot: "mediumDashDot";
      mediumDashDotDot: "mediumDashDotDot";
      mediumDashed: "mediumDashed";
      slantDashDot: "slantDashDot";
      thick: "thick";
      thin: "thin";
    }>>;
    borderRightColor: z.ZodOptional<z.ZodString>;
    borderRightStyle: z.ZodOptional<z.ZodEnum<{
      none: "none";
      dashDot: "dashDot";
      dashDotDot: "dashDotDot";
      dashed: "dashed";
      dotted: "dotted";
      double: "double";
      hair: "hair";
      medium: "medium";
      mediumDashDot: "mediumDashDot";
      mediumDashDotDot: "mediumDashDotDot";
      mediumDashed: "mediumDashed";
      slantDashDot: "slantDashDot";
      thick: "thick";
      thin: "thin";
    }>>;
    borderTopColor: z.ZodOptional<z.ZodString>;
    borderTopStyle: z.ZodOptional<z.ZodEnum<{
      none: "none";
      dashDot: "dashDot";
      dashDotDot: "dashDotDot";
      dashed: "dashed";
      dotted: "dotted";
      double: "double";
      hair: "hair";
      medium: "medium";
      mediumDashDot: "mediumDashDot";
      mediumDashDotDot: "mediumDashDotDot";
      mediumDashed: "mediumDashed";
      slantDashDot: "slantDashDot";
      thick: "thick";
      thin: "thin";
    }>>;
    fillColor: z.ZodOptional<z.ZodString>;
    fontColor: z.ZodOptional<z.ZodString>;
    fontName: z.ZodOptional<z.ZodString>;
    fontSize: z.ZodOptional<z.ZodNumber>;
    horizontalAlignment: z.ZodOptional<z.ZodEnum<{
      fill: "fill";
      general: "general";
      left: "left";
      center: "center";
      right: "right";
      justify: "justify";
      centerContinuous: "centerContinuous";
      distributed: "distributed";
    }>>;
    italic: z.ZodOptional<z.ZodBoolean>;
    numberFormat: z.ZodOptional<z.ZodString>;
    numberFormatFromFormula: z.ZodOptional<z.ZodString>;
    shrinkToFit: z.ZodOptional<z.ZodBoolean>;
    underline: z.ZodOptional<z.ZodEnum<{
      none: "none";
      double: "double";
      single: "single";
      singleAccounting: "singleAccounting";
      doubleAccounting: "doubleAccounting";
    }>>;
    verticalAlignment: z.ZodOptional<z.ZodEnum<{
      center: "center";
      justify: "justify";
      distributed: "distributed";
      bottom: "bottom";
      top: "top";
    }>>;
    wrapText: z.ZodOptional<z.ZodBoolean>;
  }, z.core.$strip>>>;
  note: z.ZodOptional<z.ZodString>;
  merge: z.ZodOptional<z.ZodArray<z.ZodString>>;
  unmerge: z.ZodOptional<z.ZodArray<z.ZodString>>;
}, z.core.$strip>, ToolError | EditCellsResult>
```

### const fillCells

```ts
const fillCells: SpreadsheetTool<z.ZodObject<{
  sheet: z.ZodString;
  selection: z.ZodString;
  extend_to: z.ZodString;
  note: z.ZodOptional<z.ZodString>;
}, z.core.$strip>, ToolError | FillCellsResult>
```

### const findCells

```ts
const findCells: SpreadsheetTool<import("zod").ZodObject<{
  sheet: import("zod").ZodOptional<import("zod").ZodString>;
  range: import("zod").ZodOptional<import("zod").ZodString>;
  matchMode: import("zod").ZodOptional<import("zod").ZodEnum<{
    AND: "AND";
    OR: "OR";
  }>>;
  hasFormula: import("zod").ZodOptional<import("zod").ZodBoolean>;
  fillColor: import("zod").ZodOptional<import("zod").ZodString>;
  fontColor: import("zod").ZodOptional<import("zod").ZodString>;
  formulaContains: import("zod").ZodOptional<import("zod").ZodString>;
  valueContains: import("zod").ZodOptional<import("zod").ZodString>;
  valueWithin: import("zod").ZodOptional<import("zod").ZodArray<import("zod").ZodNumber>>;
}, import("zod/v4/core").$strip>, ToolError | FindCellsResult>
```

### function generateWorkbookContext()

```ts
function generateWorkbookContext(model: Model): string | null
```

Generate a pre-analyzed workbook summary suitable for injection into
an LLM system prompt. Combines the information from `symbols` and
`describeStructure` into a concise, structured format.

Returns `null` only if the underlying analysis fails.

### const getComment

```ts
const getComment: SpreadsheetTool<z.ZodObject<{
  address: z.ZodString;
}, z.core.$strip>, ToolError | GetCommentResult>
```

### const getComments

```ts
const getComments: SpreadsheetTool<import("zod").ZodObject<{
  sheet: import("zod").ZodOptional<import("zod").ZodString>;
  offset: import("zod").ZodOptional<import("zod").ZodNumber>;
}, import("zod/v4/core").$strip>, ToolError | GetCommentsResult>
```

### const getStyles

```ts
const getStyles: SpreadsheetTool<z.ZodObject<{
  indices: z.ZodOptional<z.ZodArray<z.ZodNumber>>;
}, z.core.$strip>, ToolError | GetStylesResult>
```

### const goalSeek

```ts
const goalSeek: SpreadsheetTool<z.ZodObject<{
  write: z.ZodArray<z.ZodObject<{
    cell: z.ZodString;
    value: z.ZodUnion<readonly [z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodNull]>;
  }, z.core.$strip>>;
  goalSeek: z.ZodObject<{
    targetCell: z.ZodString;
    targetValue: z.ZodNumber;
    controlCell: z.ZodString;
  }, z.core.$strip>;
  persist: z.ZodOptional<z.ZodBoolean>;
}, z.core.$strip>, ToolError | GoalSeekResult>
```

### const inspect

```ts
const inspect: SpreadsheetTool<z.ZodObject<{
  reference: z.ZodString;
  offset: z.ZodOptional<z.ZodNumber>;
}, z.core.$strip>, ToolError | PaginatedReadResult>
```

### function isToolError()

```ts
function isToolError(value: unknown): value is ToolError
```

### const listErrors

```ts
const listErrors: SpreadsheetTool<import("zod").ZodObject<{
  sheet: import("zod").ZodOptional<import("zod").ZodString>;
  range: import("zod").ZodOptional<import("zod").ZodString>;
  max: import("zod").ZodOptional<import("zod").ZodNumber>;
}, import("zod/v4/core").$strip>, ToolError | ListErrorsResult>
```

### const manageRowsAndColumns

```ts
const manageRowsAndColumns: SpreadsheetTool<z.ZodObject<{
  columns: z.ZodOptional<z.ZodObject<{
    insert: z.ZodOptional<z.ZodObject<{
      column: z.ZodString;
      count: z.ZodNumber;
    }, z.core.$strip>>;
    delete: z.ZodOptional<z.ZodObject<{
      column: z.ZodString;
      count: z.ZodNumber;
    }, z.core.$strip>>;
    autoSize: z.ZodOptional<z.ZodArray<z.ZodString>>;
  }, z.core.$strip>>;
  rows: z.ZodOptional<z.ZodObject<{
    insert: z.ZodOptional<z.ZodObject<{
      row: z.ZodNumber;
      count: z.ZodNumber;
    }, z.core.$strip>>;
    delete: z.ZodOptional<z.ZodObject<{
      row: z.ZodNumber;
      count: z.ZodNumber;
    }, z.core.$strip>>;
    autoSize: z.ZodOptional<z.ZodArray<z.ZodNumber>>;
  }, z.core.$strip>>;
  sheet: z.ZodString;
  note: z.ZodOptional<z.ZodString>;
}, z.core.$strip>, ToolError | ManageRowsAndColumnsResult>
```

### const manageSheets

```ts
const manageSheets: SpreadsheetTool<z.ZodObject<{
  add: z.ZodOptional<z.ZodObject<{
    name: z.ZodString;
  }, z.core.$strip>>;
  remove: z.ZodOptional<z.ZodObject<{
    sheet: z.ZodString;
  }, z.core.$strip>>;
  rename: z.ZodOptional<z.ZodObject<{
    sheet: z.ZodString;
    name: z.ZodString;
  }, z.core.$strip>>;
  setVisibility: z.ZodOptional<z.ZodObject<{
    sheet: z.ZodString;
    hidden: z.ZodEnum<{
      visible: "visible";
      hidden: "hidden";
      veryHidden: "veryHidden";
    }>;
  }, z.core.$strip>>;
  note: z.ZodOptional<z.ZodString>;
}, z.core.$strip>, ToolError | ManageSheetsResult>
```

### const precedents

```ts
const precedents: SpreadsheetTool<import("zod").ZodObject<{
  reference: import("zod").ZodString;
  mode: import("zod").ZodDefault<import("zod").ZodEnum<{
    cells: "cells";
    grouped: "grouped";
  }>>;
  maxDepth: import("zod").ZodOptional<import("zod").ZodNumber>;
  maxNodes: import("zod").ZodOptional<import("zod").ZodNumber>;
}, import("zod/v4/core").$strip>, GraphToolResult>
```

### const readCalculatedValues

```ts
const readCalculatedValues: SpreadsheetTool<z.ZodObject<{
  read: z.ZodArray<z.ZodString>;
  apply: z.ZodOptional<z.ZodArray<z.ZodObject<{
    cell: z.ZodString;
    value: z.ZodUnion<readonly [z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodNull]>;
  }, z.core.$strip>>>;
  cursors: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodNumber>>;
}, z.core.$strip>, ToolError | ReadCalculatedValuesResult>
```

### const runFormula

```ts
const runFormula: SpreadsheetTool<z.ZodObject<{
  apply: z.ZodOptional<z.ZodArray<z.ZodObject<{
    cell: z.ZodString;
    value: z.ZodUnion<readonly [z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodNull]>;
  }, z.core.$strip>>>;
  formula: z.ZodOptional<z.ZodString>;
  formulas: z.ZodOptional<z.ZodArray<z.ZodString>>;
  sheet: z.ZodOptional<z.ZodString>;
}, z.core.$strip>, ToolError | RunFormulaResult>
```

### const spreadsheetTools

```ts
const spreadsheetTools: (SpreadsheetTool<import("zod").ZodObject<{
  sheets: import("zod").ZodOptional<import("zod").ZodArray<import("zod").ZodString>>;
  labelOffset: import("zod").ZodOptional<import("zod").ZodNumber>;
}, import("zod/v4/core").$strip>, DescribeStructureResult | ToolError> | SpreadsheetTool<import("zod").ZodObject<{
  read: import("zod").ZodArray<import("zod").ZodString>;
  apply: import("zod").ZodOptional<import("zod").ZodArray<import("zod").ZodObject<{
    cell: import("zod").ZodString;
    value: import("zod").ZodUnion<readonly [import("zod").ZodString, import("zod").ZodNumber, import("zod").ZodBoolean, import("zod").ZodNull]>;
  }, import("zod/v4/core").$strip>>>;
  cursors: import("zod").ZodOptional<import("zod").ZodRecord<import("zod").ZodString, import("zod").ZodNumber>>;
}, import("zod/v4/core").$strip>, ToolError | ReadCalculatedValuesResult> | SpreadsheetTool<import("zod").ZodObject<{
  apply: import("zod").ZodOptional<import("zod").ZodArray<import("zod").ZodObject<{
    cell: import("zod").ZodString;
    value: import("zod").ZodUnion<readonly [import("zod").ZodString, import("zod").ZodNumber, import("zod").ZodBoolean, import("zod").ZodNull]>;
  }, import("zod/v4/core").$strip>>>;
  formula: import("zod").ZodOptional<import("zod").ZodString>;
  formulas: import("zod").ZodOptional<import("zod").ZodArray<import("zod").ZodString>>;
  sheet: import("zod").ZodOptional<import("zod").ZodString>;
}, import("zod/v4/core").$strip>, ToolError | RunFormulaResult> | SpreadsheetTool<import("zod").ZodObject<{
  apply: import("zod").ZodArray<import("zod").ZodObject<{
    target: import("zod").ZodString;
    value: import("zod").ZodOptional<import("zod").ZodUnion<readonly [import("zod").ZodString, import("zod").ZodNumber, import("zod").ZodBoolean, import("zod").ZodNull]>>;
    styleIndex: import("zod").ZodOptional<import("zod").ZodNumber>;
  }, import("zod/v4/core").$strip>>;
  styles: import("zod").ZodOptional<import("zod").ZodArray<import("zod").ZodObject<{
    bold: import("zod").ZodOptional<import("zod").ZodBoolean>;
    borderBottomColor: import("zod").ZodOptional<import("zod").ZodString>;
    borderBottomStyle: import("zod").ZodOptional<import("zod").ZodEnum<{
      none: "none";
      dashDot: "dashDot";
      dashDotDot: "dashDotDot";
      dashed: "dashed";
      dotted: "dotted";
      double: "double";
      hair: "hair";
      medium: "medium";
      mediumDashDot: "mediumDashDot";
      mediumDashDotDot: "mediumDashDotDot";
      mediumDashed: "mediumDashed";
      slantDashDot: "slantDashDot";
      thick: "thick";
      thin: "thin";
    }>>;
    borderLeftColor: import("zod").ZodOptional<import("zod").ZodString>;
    borderLeftStyle: import("zod").ZodOptional<import("zod").ZodEnum<{
      none: "none";
      dashDot: "dashDot";
      dashDotDot: "dashDotDot";
      dashed: "dashed";
      dotted: "dotted";
      double: "double";
      hair: "hair";
      medium: "medium";
      mediumDashDot: "mediumDashDot";
      mediumDashDotDot: "mediumDashDotDot";
      mediumDashed: "mediumDashed";
      slantDashDot: "slantDashDot";
      thick: "thick";
      thin: "thin";
    }>>;
    borderRightColor: import("zod").ZodOptional<import("zod").ZodString>;
    borderRightStyle: import("zod").ZodOptional<import("zod").ZodEnum<{
      none: "none";
      dashDot: "dashDot";
      dashDotDot: "dashDotDot";
      dashed: "dashed";
      dotted: "dotted";
      double: "double";
      hair: "hair";
      medium: "medium";
      mediumDashDot: "mediumDashDot";
      mediumDashDotDot: "mediumDashDotDot";
      mediumDashed: "mediumDashed";
      slantDashDot: "slantDashDot";
      thick: "thick";
      thin: "thin";
    }>>;
    borderTopColor: import("zod").ZodOptional<import("zod").ZodString>;
    borderTopStyle: import("zod").ZodOptional<import("zod").ZodEnum<{
      none: "none";
      dashDot: "dashDot";
      dashDotDot: "dashDotDot";
      dashed: "dashed";
      dotted: "dotted";
      double: "double";
      hair: "hair";
      medium: "medium";
      mediumDashDot: "mediumDashDot";
      mediumDashDotDot: "mediumDashDotDot";
      mediumDashed: "mediumDashed";
      slantDashDot: "slantDashDot";
      thick: "thick";
      thin: "thin";
    }>>;
    fillColor: import("zod").ZodOptional<import("zod").ZodString>;
    fontColor: import("zod").ZodOptional<import("zod").ZodString>;
    fontName: import("zod").ZodOptional<import("zod").ZodString>;
    fontSize: import("zod").ZodOptional<import("zod").ZodNumber>;
    horizontalAlignment: import("zod").ZodOptional<import("zod").ZodEnum<{
      fill: "fill";
      general: "general";
      left: "left";
      center: "center";
      right: "right";
      justify: "justify";
      centerContinuous: "centerContinuous";
      distributed: "distributed";
    }>>;
    italic: import("zod").ZodOptional<import("zod").ZodBoolean>;
    numberFormat: import("zod").ZodOptional<import("zod").ZodString>;
    numberFormatFromFormula: import("zod").ZodOptional<import("zod").ZodString>;
    shrinkToFit: import("zod").ZodOptional<import("zod").ZodBoolean>;
    underline: import("zod").ZodOptional<import("zod").ZodEnum<{
      none: "none";
      double: "double";
      single: "single";
      singleAccounting: "singleAccounting";
      doubleAccounting: "doubleAccounting";
    }>>;
    verticalAlignment: import("zod").ZodOptional<import("zod").ZodEnum<{
      center: "center";
      justify: "justify";
      distributed: "distributed";
      bottom: "bottom";
      top: "top";
    }>>;
    wrapText: import("zod").ZodOptional<import("zod").ZodBoolean>;
  }, import("zod/v4/core").$strip>>>;
  note: import("zod").ZodOptional<import("zod").ZodString>;
  merge: import("zod").ZodOptional<import("zod").ZodArray<import("zod").ZodString>>;
  unmerge: import("zod").ZodOptional<import("zod").ZodArray<import("zod").ZodString>>;
}, import("zod/v4/core").$strip>, ToolError | EditCellsResult> | SpreadsheetTool<import("zod").ZodObject<{
  sheet: import("zod").ZodString;
  selection: import("zod").ZodString;
  extend_to: import("zod").ZodString;
  note: import("zod").ZodOptional<import("zod").ZodString>;
}, import("zod/v4/core").$strip>, ToolError | FillCellsResult> | SpreadsheetTool<import("zod").ZodObject<{
  add: import("zod").ZodOptional<import("zod").ZodObject<{
    name: import("zod").ZodString;
  }, import("zod/v4/core").$strip>>;
  remove: import("zod").ZodOptional<import("zod").ZodObject<{
    sheet: import("zod").ZodString;
  }, import("zod/v4/core").$strip>>;
  rename: import("zod").ZodOptional<import("zod").ZodObject<{
    sheet: import("zod").ZodString;
    name: import("zod").ZodString;
  }, import("zod/v4/core").$strip>>;
  setVisibility: import("zod").ZodOptional<import("zod").ZodObject<{
    sheet: import("zod").ZodString;
    hidden: import("zod").ZodEnum<{
      visible: "visible";
      hidden: "hidden";
      veryHidden: "veryHidden";
    }>;
  }, import("zod/v4/core").$strip>>;
  note: import("zod").ZodOptional<import("zod").ZodString>;
}, import("zod/v4/core").$strip>, ToolError | ManageSheetsResult> | SpreadsheetTool<import("zod").ZodObject<{
  columns: import("zod").ZodOptional<import("zod").ZodObject<{
    insert: import("zod").ZodOptional<import("zod").ZodObject<{
      column: import("zod").ZodString;
      count: import("zod").ZodNumber;
    }, import("zod/v4/core").$strip>>;
    delete: import("zod").ZodOptional<import("zod").ZodObject<{
      column: import("zod").ZodString;
      count: import("zod").ZodNumber;
    }, import("zod/v4/core").$strip>>;
    autoSize: import("zod").ZodOptional<import("zod").ZodArray<import("zod").ZodString>>;
  }, import("zod/v4/core").$strip>>;
  rows: import("zod").ZodOptional<import("zod").ZodObject<{
    insert: import("zod").ZodOptional<import("zod").ZodObject<{
      row: import("zod").ZodNumber;
      count: import("zod").ZodNumber;
    }, import("zod/v4/core").$strip>>;
    delete: import("zod").ZodOptional<import("zod").ZodObject<{
      row: import("zod").ZodNumber;
      count: import("zod").ZodNumber;
    }, import("zod/v4/core").$strip>>;
    autoSize: import("zod").ZodOptional<import("zod").ZodArray<import("zod").ZodNumber>>;
  }, import("zod/v4/core").$strip>>;
  sheet: import("zod").ZodString;
  note: import("zod").ZodOptional<import("zod").ZodString>;
}, import("zod/v4/core").$strip>, ToolError | ManageRowsAndColumnsResult> | SpreadsheetTool<import("zod").ZodObject<{
  sheet: import("zod").ZodString;
  apply: import("zod").ZodArray<import("zod").ZodObject<{
    target: import("zod").ZodString;
    styles: import("zod").ZodObject<{
      bold: import("zod").ZodOptional<import("zod").ZodBoolean>;
      borderBottomColor: import("zod").ZodOptional<import("zod").ZodString>;
      borderBottomStyle: import("zod").ZodOptional<import("zod").ZodEnum<{
        none: "none";
        dashDot: "dashDot";
        dashDotDot: "dashDotDot";
        dashed: "dashed";
        dotted: "dotted";
        double: "double";
        hair: "hair";
        medium: "medium";
        mediumDashDot: "mediumDashDot";
        mediumDashDotDot: "mediumDashDotDot";
        mediumDashed: "mediumDashed";
        slantDashDot: "slantDashDot";
        thick: "thick";
        thin: "thin";
      }>>;
      borderLeftColor: import("zod").ZodOptional<import("zod").ZodString>;
      borderLeftStyle: import("zod").ZodOptional<import("zod").ZodEnum<{
        none: "none";
        dashDot: "dashDot";
        dashDotDot: "dashDotDot";
        dashed: "dashed";
        dotted: "dotted";
        double: "double";
        hair: "hair";
        medium: "medium";
        mediumDashDot: "mediumDashDot";
        mediumDashDotDot: "mediumDashDotDot";
        mediumDashed: "mediumDashed";
        slantDashDot: "slantDashDot";
        thick: "thick";
        thin: "thin";
      }>>;
      borderRightColor: import("zod").ZodOptional<import("zod").ZodString>;
      borderRightStyle: import("zod").ZodOptional<import("zod").ZodEnum<{
        none: "none";
        dashDot: "dashDot";
        dashDotDot: "dashDotDot";
        dashed: "dashed";
        dotted: "dotted";
        double: "double";
        hair: "hair";
        medium: "medium";
        mediumDashDot: "mediumDashDot";
        mediumDashDotDot: "mediumDashDotDot";
        mediumDashed: "mediumDashed";
        slantDashDot: "slantDashDot";
        thick: "thick";
        thin: "thin";
      }>>;
      borderTopColor: import("zod").ZodOptional<import("zod").ZodString>;
      borderTopStyle: import("zod").ZodOptional<import("zod").ZodEnum<{
        none: "none";
        dashDot: "dashDot";
        dashDotDot: "dashDotDot";
        dashed: "dashed";
        dotted: "dotted";
        double: "double";
        hair: "hair";
        medium: "medium";
        mediumDashDot: "mediumDashDot";
        mediumDashDotDot: "mediumDashDotDot";
        mediumDashed: "mediumDashed";
        slantDashDot: "slantDashDot";
        thick: "thick";
        thin: "thin";
      }>>;
      fillColor: import("zod").ZodOptional<import("zod").ZodString>;
      fontColor: import("zod").ZodOptional<import("zod").ZodString>;
      fontName: import("zod").ZodOptional<import("zod").ZodString>;
      fontSize: import("zod").ZodOptional<import("zod").ZodNumber>;
      horizontalAlignment: import("zod").ZodOptional<import("zod").ZodEnum<{
        fill: "fill";
        general: "general";
        left: "left";
        center: "center";
        right: "right";
        justify: "justify";
        centerContinuous: "centerContinuous";
        distributed: "distributed";
      }>>;
      italic: import("zod").ZodOptional<import("zod").ZodBoolean>;
      numberFormat: import("zod").ZodOptional<import("zod").ZodString>;
      numberFormatFromFormula: import("zod").ZodOptional<import("zod").ZodString>;
      shrinkToFit: import("zod").ZodOptional<import("zod").ZodBoolean>;
      underline: import("zod").ZodOptional<import("zod").ZodEnum<{
        none: "none";
        double: "double";
        single: "single";
        singleAccounting: "singleAccounting";
        doubleAccounting: "doubleAccounting";
      }>>;
      verticalAlignment: import("zod").ZodOptional<import("zod").ZodEnum<{
        center: "center";
        justify: "justify";
        distributed: "distributed";
        bottom: "bottom";
        top: "top";
      }>>;
      wrapText: import("zod").ZodOptional<import("zod").ZodBoolean>;
    }, import("zod/v4/core").$strip>;
  }, import("zod/v4/core").$strip>>;
  note: import("zod").ZodOptional<import("zod").ZodString>;
}, import("zod/v4/core").$strip>, ToolError | EditCellStylesResult> | SpreadsheetTool<import("zod").ZodObject<{
  indices: import("zod").ZodOptional<import("zod").ZodArray<import("zod").ZodNumber>>;
}, import("zod/v4/core").$strip>, ToolError | GetStylesResult> | SpreadsheetTool<import("zod").ZodObject<{
  write: import("zod").ZodArray<import("zod").ZodObject<{
    cell: import("zod").ZodString;
    value: import("zod").ZodUnion<readonly [import("zod").ZodString, import("zod").ZodNumber, import("zod").ZodBoolean, import("zod").ZodNull]>;
  }, import("zod/v4/core").$strip>>;
  goalSeek: import("zod").ZodObject<{
    targetCell: import("zod").ZodString;
    targetValue: import("zod").ZodNumber;
    controlCell: import("zod").ZodString;
  }, import("zod/v4/core").$strip>;
  persist: import("zod").ZodOptional<import("zod").ZodBoolean>;
}, import("zod/v4/core").$strip>, ToolError | GoalSeekResult> | SpreadsheetTool<import("zod").ZodObject<{}, import("zod/v4/core").$strip>, ToolError | SymbolsResult> | SpreadsheetTool<import("zod").ZodObject<{
  reference: import("zod").ZodString;
  show: import("zod").ZodOptional<import("zod").ZodEnum<{
    value: "value";
    formula: "formula";
    fill: "fill";
    fontColor: "fontColor";
    numberFormat: "numberFormat";
    rawValue: "rawValue";
  }>>;
}, import("zod/v4/core").$strip>, string> | SpreadsheetTool<import("zod").ZodObject<{
  reference: import("zod").ZodString;
  offset: import("zod").ZodOptional<import("zod").ZodNumber>;
}, import("zod/v4/core").$strip>, ToolError | PaginatedReadResult> | SpreadsheetTool<import("zod").ZodObject<{
  changes: import("zod").ZodRecord<import("zod").ZodString, import("zod").ZodUnion<readonly [import("zod").ZodString, import("zod").ZodNumber, import("zod").ZodBoolean, import("zod").ZodNull]>>;
}, import("zod/v4/core").$strip>, ToolError | WhatIfResult> | SpreadsheetTool<import("zod").ZodObject<{
  reference: import("zod").ZodString;
  mode: import("zod").ZodDefault<import("zod").ZodEnum<{
    cells: "cells";
    grouped: "grouped";
  }>>;
  maxDepth: import("zod").ZodOptional<import("zod").ZodNumber>;
  maxNodes: import("zod").ZodOptional<import("zod").ZodNumber>;
}, import("zod/v4/core").$strip>, GraphToolResult> | SpreadsheetTool<import("zod").ZodObject<{
  sheet: import("zod").ZodOptional<import("zod").ZodString>;
  range: import("zod").ZodOptional<import("zod").ZodString>;
  max: import("zod").ZodOptional<import("zod").ZodNumber>;
}, import("zod/v4/core").$strip>, ToolError | ListErrorsResult> | SpreadsheetTool<import("zod").ZodObject<{
  sheet: import("zod").ZodOptional<import("zod").ZodString>;
  offset: import("zod").ZodOptional<import("zod").ZodNumber>;
}, import("zod/v4/core").$strip>, ToolError | GetCommentsResult> | SpreadsheetTool<import("zod").ZodObject<{
  address: import("zod").ZodString;
}, import("zod/v4/core").$strip>, ToolError | GetCommentResult> | SpreadsheetTool<import("zod").ZodObject<{
  sheet: import("zod").ZodOptional<import("zod").ZodString>;
  range: import("zod").ZodOptional<import("zod").ZodString>;
  matchMode: import("zod").ZodOptional<import("zod").ZodEnum<{
    AND: "AND";
    OR: "OR";
  }>>;
  hasFormula: import("zod").ZodOptional<import("zod").ZodBoolean>;
  fillColor: import("zod").ZodOptional<import("zod").ZodString>;
  fontColor: import("zod").ZodOptional<import("zod").ZodString>;
  formulaContains: import("zod").ZodOptional<import("zod").ZodString>;
  valueContains: import("zod").ZodOptional<import("zod").ZodString>;
  valueWithin: import("zod").ZodOptional<import("zod").ZodArray<import("zod").ZodNumber>>;
}, import("zod/v4/core").$strip>, ToolError | FindCellsResult>)[]
```

All spreadsheet tools as an array for easy iteration

### const symbols

```ts
const symbols: SpreadsheetTool<z.ZodObject<{}, z.core.$strip>, ToolError | SymbolsResult>
```

### const viewRange

```ts
const viewRange: SpreadsheetTool<z.ZodObject<{
  reference: z.ZodString;
  show: z.ZodOptional<z.ZodEnum<{
    value: "value";
    formula: "formula";
    fill: "fill";
    fontColor: "fontColor";
    numberFormat: "numberFormat";
    rawValue: "rawValue";
  }>>;
}, z.core.$strip>, string>
```

### const whatIf

```ts
const whatIf: SpreadsheetTool<z.ZodObject<{
  changes: z.ZodRecord<z.ZodString, z.ZodUnion<readonly [z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodNull]>>;
}, z.core.$strip>, ToolError | WhatIfResult>
```

