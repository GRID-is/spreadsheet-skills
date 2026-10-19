<!-- GENERATED FILE. Do not edit by hand. Regenerate with `npm run sync`. -->

# Other exported symbols

Generated from `@grid-is/spreadsheet-engine@18.1.0` (`dist/index.d.ts`). Every public symbol listed here exists in that version. If the installed version differs, read `node_modules/@grid-is/spreadsheet-engine/dist/index.d.ts` instead; it is the source of truth.

## class ArrayEditBlockedError extends EditBlockedError

Thrown when an edit would change part, but not all, of an array formula's range (a CSE array or
a dynamic spill). Raised by data table creation ({@link Workbook.editCell} with `dt`), as Excel's
What-If > Data Table command refuses part of a CSE array; a result range covering all of an
array replaces it, as in Excel.

### name

```ts
name: string
```

### arrayRef

```ts
arrayRef: string
```

A1 range (no sheet prefix) of the array formula; the sheet is in `sheetName`.

### new ArrayEditBlockedError()

```ts
constructor(arrayRef: string, sheetName: string, operationDescription: string)
```

### type FilterOptions

```ts
type FilterOptions = {
  excludeReplies?: boolean;
  excludeResolved?: boolean;
}
```

### type PivotAddOptions

```ts
type PivotAddOptions = {
  /** An empty name generates the lowest free workbook-wide `PivotTableN` name. */ name: string;
  sheetName: string;
  anchorRef: string;
  sourceSheetName: string;
  sourceRef: string;
  rowFields?: string[];
  colFields?: string[];
  dataFields?: Array<{
    name?: string;
    field: string; /** The measure's aggregation; Microsoft APIs call the same setting `summarizeBy`, while JSF stores it as `subtotal`. */
    aggregation?: PivotDataFieldAggregation;
  }>;
}
```

What {@link PivotManager.add} builds a pivot table from. `anchorRef` is the top-left cell of the
output on `sheetName`, written without a sheet prefix. The field lists name source columns by
header text (case-insensitive): a header may sit on the row or the column axis, not both, and may
back several data fields, each with its own `aggregation` (default `sum`) and display
name (default the label Excel derives, e.g. `Sum of Sales`).

## class PivotField

A handle on one pivot field, addressed by its index into the definition's `fields`. The table
hands back the same object on every lookup. A cache refresh that reorders the source columns
moves the handle with its column; one that drops the column marks it removed
({@link isRemoved}): it then reports the name it had, no placement and no items, and refuses
mutation. Mutators must run inside `PivotManager.update`.

### table

```ts
readonly table: PivotTable
```

### name

```ts
get name(): string
```

### sourceName

```ts
get sourceName(): string
```

### axis

```ts
get axis(): PivotFieldAxis | null
```

### isRemoved

```ts
get isRemoved(): boolean
```

### position

```ts
get position(): number
```

### showAll

```ts
get showAll(): boolean
```

### items

```ts
get items(): readonly PivotItem[]
```

### filters

```ts
get filters(): readonly PivotFieldFilter[]
```

Immutable descriptors, rebuilt on every read. Includes the manual filter synthesized from the
field's hidden items.

### setName()

```ts
setName(name: string): void
```

Rejects a caption equal, under {@link excelNameKey}, to one that another field of this table
stores, because Excel repairs such a workbook by dropping the pivot table. A caption equal to
another field's inherited cache name is allowed.

### setShowAll()

```ts
setShowAll(showAll: boolean): void
```

### setAxis()

```ts
setAxis(axis: PivotFieldAxis | null): void
```

### setFilter()

```ts
setFilter(filter: PivotSettableFilter): void
```

Replaces the filter of the same kind this field already carried. A value filter and a
top/bottom filter share one slot in Excel, so setting either one replaces the other.

### clearFilters()

```ts
clearFilters(kind?: PivotFieldFilterKind): void
```

Removes this field's filters of `kind`, or all of them when `kind` is omitted. `kind` matches
exactly: clearing `'value'` leaves a top/bottom filter in place, and vice versa.

### setSort()

```ts
setSort(order: "ascending" | "descending", by?: PivotMeasure): void
```

Sorts by `by`'s values when a measure is given, by the field's own labels otherwise. A value
sort addresses its measure by position, so later measure removals renumber it.

### type PivotFieldFilter

```ts
type PivotFieldFilter = PivotLabelFilter | PivotValueFilter | PivotTopNFilter | PivotManualFilter | PivotOpaqueFilter
```

### type PivotFieldFilterKind

```ts
type PivotFieldFilterKind = "label" | "value" | "topN" | "manual" | "date" | "unknown"
```

## class PivotItem

A handle on one item (a distinct value, or a grouped bucket) of a {@link PivotField}, addressed
by the item's position in the cache field's item list. The field hands back the same object on
every lookup. A cache refresh that rebuilds the field's items marks the handle removed
({@link isRemoved}): it then still reports the last state it had, and refuses mutation. Mutators
must run inside `PivotManager.update`.

### field

```ts
readonly field: PivotField
```

### value

```ts
get value(): CellValue
```

### caption

```ts
get caption(): string
```

### hidden

```ts
get hidden(): boolean
```

### expanded

```ts
get expanded(): boolean
```

### isRemoved

```ts
get isRemoved(): boolean
```

### setCaption()

```ts
setCaption(name: string): void
```

### setHidden()

```ts
setHidden(hidden: boolean): void
```

### setExpanded()

```ts
setExpanded(expanded: boolean): void
```

### type PivotLabelFilter

```ts
type PivotLabelFilter = {
  kind: "label";
  condition: PivotLabelFilterCondition; /** Negates `condition`. */
  exclusive?: boolean; /** Operand for every condition except `between`. */
  value?: string; /** Required for `between`; ignored otherwise. */
  lowerBound?: string;
  upperBound?: string;
}
```

### type PivotLabelFilterCondition

```ts
type PivotLabelFilterCondition = "equals" | "beginsWith" | "endsWith" | "contains" | "greaterThan" | "greaterThanOrEqual" | "lessThan" | "lessThanOrEqual" | "between"
```

### type PivotManualFilter

```ts
type PivotManualFilter = {
  kind: "manual"; /** The items left visible. Every other item of the field is hidden. */
  selected: readonly PivotItem[];
}
```

## class PivotMeasure

A handle on one data field ("measure") of a pivot table, addressed by its definition entry, so it
survives reordering and a cache refresh alike. {@link remove}, or a refresh that drops the source
column, marks it removed ({@link isRemoved}), after which it refuses mutation. Mutators must run
inside `PivotManager.update`.

### table

```ts
readonly table: PivotTable
```

### field

```ts
readonly field: PivotField
```

### name

```ts
get name(): string
```

### position

```ts
get position(): number
```

### isRemoved

```ts
get isRemoved(): boolean
```

### aggregation

```ts
get aggregation(): PivotDataFieldAggregation
```

### showDataAs

```ts
get showDataAs(): PivotMeasureShowDataAs | null
```

### numberFormat

```ts
get numberFormat(): string | undefined
```

### setName()

```ts
setName(name: string): void
```

### setAggregation()

```ts
setAggregation(aggregation: PivotDataFieldAggregation): void
```

### setShowDataAs()

```ts
setShowDataAs(value: PivotMeasureShowDataAs | null): void
```

### setNumberFormat()

```ts
setNumberFormat(format: string | undefined): void
```

### remove()

```ts
remove(): void
```

### type PivotMeasureShowDataAs

```ts
type PivotMeasureShowDataAs = {
  mode: PivotShowDataAs;
  baseField?: PivotField;
  baseItem?: number;
}
```

A measure's "show data as" mode, with the base field and item the relative modes read.

## class PivotNameConflictError extends Error

A pivot table name is already used on the same sheet, compared as Excel compares names.

### name

```ts
name: string
```

### pivotTableName

```ts
pivotTableName: string
```

### sheetName

```ts
sheetName: string
```

### new PivotNameConflictError()

```ts
constructor(pivotTableName: string, sheetName: string)
```

### type PivotOpaqueFilter

```ts
type PivotOpaqueFilter = {
  kind: "date" | "unknown";
  type: PivotFilterType;
  value?: string;
  lowerBound?: string;
  upperBound?: string;
}
```

A stored filter Apiary reports but does not evaluate: date, OLAP and unresolvable filters.

### type PivotSettableFilter

```ts
type PivotSettableFilter = PivotLabelFilter | PivotValueFilter | PivotTopNFilter | PivotManualFilter
```

The subset `setFilter` accepts. Opaque filters are read-only: rejection is a type error.

## class PivotSourceInvalidError extends Error

A pivot table was added on a source that is not a readable worksheet range.

### name

```ts
name: string
```

### pivotTableName

```ts
pivotTableName: string
```

### reason

```ts
reason: string
```

### new PivotSourceInvalidError()

```ts
constructor(pivotTableName: string, reason: string)
```

### type PivotTopNFilter

```ts
type PivotTopNFilter = {
  kind: "topN";
  measure: PivotMeasure;
  condition: "top" | "bottom";
  selection: PivotTopNSelection;
  threshold: number;
}
```

A top/bottom filter. `setFilter` treats this and {@link PivotValueFilter} as one slot:
writing either replaces the other.

### type PivotTopNSelection

```ts
type PivotTopNSelection = "items" | "percent" | "sum"
```

### type PivotValueFilter

```ts
type PivotValueFilter = {
  kind: "value"; /** Must belong to this pivot table. */
  measure: PivotMeasure;
  condition: PivotValueFilterCondition;
  exclusive?: boolean;
  value?: number;
  lowerBound?: number;
  upperBound?: number;
}
```

### type PivotValueFilterCondition

```ts
type PivotValueFilterCondition = "equals" | "greaterThan" | "greaterThanOrEqual" | "lessThan" | "lessThanOrEqual" | "between"
```

### type StylePatch

```ts
type StylePatch = {
  [K in keyof StyleRelaxed]?: StyleRelaxed[K] | null;
}
```

### function isDateFormat()

```ts
function isDateFormat(numberFormat: string | undefined): boolean
```

Whether a number format string formats its value as a date, matching what Excel treats as one.

True when the format carries a date component --- a day or year token, as in `yyyy-mm-dd` or
`d mmm`. False for a plain numeric format, and false for a time-only format such as `hh:mm`:
numfmt's own `isDateFormat` counts those as date formats, this one does not.

