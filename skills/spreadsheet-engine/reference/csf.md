<!-- GENERATED FILE. Do not edit by hand. Regenerate with `npm run sync`. -->

# CSF types (SheetJS Common Spreadsheet Format)

Generated from `@grid-is/spreadsheet-engine@17.1.0` (`dist/index.d.ts`). Every public symbol listed here exists in that version. If the installed version differs, read `node_modules/@grid-is/spreadsheet-engine/dist/index.d.ts` instead; it is the source of truth.

Types accepted by `Model.fromCsf` and produced by `Workbook.toCSF`.

### type WorkbookCSF

```ts
type WorkbookCSF = WorkbookBody & Partial<WorkbookInfo>
```

### type SheetCSF

```ts
type SheetCSF = {
  structure?: "none" | "datatable";
  name: string;
  cells: {
    [addr: string]: CellCSF;
  };
  hidden?: boolean;
  col_widths?: {
    [colName: string]: number;
  };
  row_heights?: {
    [rowNum: number]: number;
  };
  defaults?: {
    col_width?: number;
    row_height?: number;
  };
  columns?: ColumnInfo[];
  merged_cells?: string[];
  gsdv?: string[];
  show_grid_lines?: boolean;
  drawings?: DrawingCSF[];
}
```

### type CellCSF

```ts
type CellCSF = {
  /** Formula text (e.g. 'SUM(A1:A4)')*/ f?: string | null;
  /**
   * Formula type: 'a' = array formula, or absent to mean single-cell formula,
   * in CSF versions after we introduce this our .xlsx processor. Before that CSF
   * version change, this is always absent in CSF delivered from the GRID API.
   */
  ft?: "a";
  /**
   * Value held by the cell; this is either a formula result or a literal value.
   * Note that a string representing an error value (such as `#VALUE!`) is
   * interpreted as that error value (with no detail message) when we populate
   * cells from CSF. Yes, this does mean that we cannot currently represent such
   * string values in CSF!
   */
  v?: string | number | boolean | FormulaError | null; /** Cell's user-assigned number format */
  z?: string | null; /** Cell's formula-assigned number format, propagated from other cells */
  zf?: string | null;
  /**
   * Style index (into styles array, present in API responses but replaced by s
   * by assigning from styles array to individual cells on load
   */
  si?: number; /** Styles/theme of the cell */
  s?: CellStyle | null; /** A URL to an external resource */
  href?: string | null;
  /**
   * Spill range of the cell (e.g. 'A2:B4').
   *
   * Given a cell A1 that spills into A1:C2, every cell in the range (including
   * the A1 cell) should have an `F` value of 'A1:C2'.
   */
  F?: string;
  /**
   * Cell value type. Corresponds to the types given by SheetJS and Headless API
   *
   * b = boolean
   * e = error
   * n = number
   * d = date
   * s = string
   * z = null/blank
   *
   * This property is optional as it is redundant in all cases except for errors and dates.
   */
  t?: "b" | "e" | "n" | "d" | "s" | "z";
}
```

Plain JavaScript objects representing cell contents.

### type TableCSF

```ts
type TableCSF = {
  name: string;
  sheet: string;
  ref: string;
  columns: TableColumnCSF[];
  totals_row_count?: number;
  header_row_count?: number;
}
```

### type TableColumnCSF

```ts
type TableColumnCSF = {
  name: string;
  data_type?: "text" | "number" | "boolean" | "datetime" | "unknown";
  formula?: string;
}
```

### type ChartCSF

```ts
type ChartCSF = {
  id: string;
  type: ChartType | "combo";
  series: Series[];
  axes?: AxisCSF[];
  title?: FormulaOrLiteralString;
  auto_title_deleted?: boolean;
  labels?: Formula;
  legend?: {
    position: "top" | "bottom" | "left" | "right" | "top-right";
  };
  data_labels?: {
    values: boolean;
  };
  grouping?: "standard" | "stacked" | "clustered" | "percentStacked";
  vary_colors?: boolean;
}
```

### type DrawingCSF

```ts
type DrawingCSF = {
  anchor: AbsoluteAnchor | CellAnchor | TwoCellAnchor;
  chart_id?: string;
}
```

### type AxisCSF

```ts
type AxisCSF = {
  type: "category" | "value" | "date" | "series";
  position: "left" | "right" | "top" | "bottom";
  title?: FormulaOrLiteralString;
  number_format?: string;
  orientation?: "minMax" | "maxMin";
  min?: number;
  max?: number;
  log_base?: number;
}
```

### type CloudConnection

```ts
type CloudConnection = {
  automatic_refresh?: "live" | "delayed" | "unavailable";
  cloud_drive_id: string;
  cloud_drive_provider: "airtable" | "airtable_api_key" | "dropbox" | "google" | "onedrive" | "notion" | "smartsheet" | "url";
  cloud_file_id: string;
  cloud_file_path: string;
  display_name: string;
  href?: string;
  id: string;
  should_ping: boolean;
  state: "active" | "inactive" | "degraded";
}
```

