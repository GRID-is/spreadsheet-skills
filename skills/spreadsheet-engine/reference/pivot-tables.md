<!-- GENERATED FILE. Do not edit by hand. Regenerate with `npm run sync`. -->

# Pivot tables

Generated from `@grid-is/spreadsheet-engine@18.1.0` (`dist/index.d.ts`). Every public symbol listed here exists in that version. If the installed version differs, read `node_modules/@grid-is/spreadsheet-engine/dist/index.d.ts` instead; it is the source of truth.

Pivot table support as exposed by the type definitions. Check the docs for the current release status before relying on it.

## class PivotManager

Owns a workbook's pivot tables and pivot caches and the operations spanning them:
lookup, refresh, JSF (de)serialization, and structural-edit hooks that adjust output
and source ranges when sheets change.

### new PivotManager()

```ts
constructor(workbook: Workbook)
```

### get()

```ts
get(name: string, sheetName?: string): PivotTable | null
```

Look up a pivot table by name. Excel allows same-name pivot tables on
different sheets, so callers that can name a sheet should pass it to
disambiguate; without a sheet, the first match in insertion order wins.

### getAll()

```ts
getAll(): PivotTable[]
```

All pivot tables in the workbook, in insertion order, as a snapshot copy: later additions and
removals do not affect the returned array. Iterate the manager itself for the live sequence.

### [Symbol.iterator]()

```ts
[Symbol.iterator](): IterableIterator<PivotTable>
```

Iterate the workbook's pivot tables in insertion order (live, unlike {@link getAll}).

### add()

```ts
add(options: PivotAddOptions, behavior?: {
    skipRecalc?: boolean;
  }): PivotTable
```

Create a pivot table over a worksheet source range, register it, write its output on
`options.sheetName` and recalculate the model. The source's header row names the fields. The
table shares an existing cache over the same source range and headers, and otherwise gets one
of its own, refreshed from the source. A failure leaves nothing behind: the table, its cells
and an unshared cache are removed again.

- `behavior.skipRecalc`: skip the recalculation call; the output region is still marked
changed

### update()

```ts
update(pt: PivotTable, mutate: (pt: PivotTable) => void, options?: {
    skipRecalc?: boolean;
  }): void
```

Edit a registered pivot table in place. `mutate` runs with the table's mutators unlocked
(`rename`, `setLayoutForm`, the field, item and measure handles, ...); then the definition is
normalized, the output rewritten and the model recalculated. If `mutate` throws, or the new
output does not fit, the definition is restored, the cells are left as they were and the
error propagates. While `mutate` runs, structural edits to the pivot's sheet (inserting,
deleting or moving rows, columns or cells; renaming, copying or removing the sheet) and a
refresh of its cache are refused.

- `options.skipRecalc`: skip the recalculation call; the changed output regions are still
marked changed

### delete()

```ts
delete(pt: PivotTable, options?: {
    skipRecalc?: boolean;
  }): void
```

Remove a registered pivot table, clearing its cells (values, styles, number formats) and
dropping a cache no other pivot table references.

- `options.skipRecalc`: skip the recalculation call; the vacated region is still marked changed

### refreshCache()

```ts
refreshCache(cacheIndex: number, options?: {
    skipRecalc?: boolean;
    allowDuplicateHeaders?: "firstMatch";
    skipRematerialize?: boolean;
  }): boolean
```

Refresh a pivot cache from its worksheet source. Reads the source range, reconciles field
changes into the cache and every pivot table that references it, rebuilds the cache's records,
writes each affected pivot table's updated output cells onto its sheet, and triggers
recalculation (unless `skipRecalc` is set) so dependents of the changed pivot output pick up
new values.

Field-level changes in source headers are reconciled against the cache
(verified empirically in `excel-test/pivot-refresh-semantics/`):

- REORDERED columns: remap by name; pivot keeps the same logical fields.
- RENAMED or DELETED (header cleared): the cache field is removed and every PT reference
  (data, row/col, page) is silently dropped.
- DUPLICATE column names (case-insensitive): throw {@link PivotDuplicateSourceHeadersError}
  by default. Stricter than Excel, which silently picks the first match by position and
  produces wrong values; the throw preempts that corruption. (Excel throws "PivotTable field
  name is not valid" at pivot *creation* time.) Callers that need Excel's silent-mangle for
  bug-for-bug compatibility can opt in with `allowDuplicateHeaders: 'firstMatch'`.

Derived fields --- calculated (`formula`) and grouped (`fieldGroup`) --- are preserved across a
refresh, and reconciled against the new columns when the source structure changes (reorder /
rename / add / delete): see {@link _computeDerivedFieldPreservingRemap}. Re-materializing
throws `PivotOutputOverlapsDataError` if the refresh would grow a pivot's output footprint
into populated user cells (mirroring Excel's "this action will overlap..." dialog).

On any change --- rebuilt records OR a field-only remap (rename / reorder / drop / add of a
source column, which changes captions and dependent results while records stay identical) ---
marks each affected PT's pre- and post-refresh output ranges as changed in `RecalcState` so
GETPIVOTDATA formulas (whose dependence on individual pivot output cells is not expressed in
the dep graph) get triggered through normal range-overlap propagation, and recalculates.
The range marks happen even with `skipRecalc: true` so a later caller-driven `recalculate()`
picks up the same fanout.

- `cacheIndex`: the 0-based index of the pivot cache to refresh
- `options.skipRecalc`: if true, skip the post-refresh recalculation call (the range marks
are still recorded for a later recalc to pick up)
- `options.allowDuplicateHeaders`: if `'firstMatch'`, mirror Excel's silent-accept
behaviour: duplicate (case-insensitive) headers resolve by first-occurrence position,
producing values from the wrong column when an existing field's name matches multiple new
headers. Default is to throw, which is stricter than Excel but preempts the corruption.
- `options.skipRematerialize`: if true, return right after the records are rebuilt, skipping
the per-PT re-materialize, the GETPIVOTDATA range marks, and the recalc. For the load path
({@link _materializePivotOnLoad}), which materializes each pivot itself --- once, with the
collision check skipped over its own saved output.

Returns: true when the cache's records were actually rebuilt from the source, false when the
cache doesn't exist, isn't a worksheet source, or the freshly-read records (including their
date-formatting encoding) matched the existing records cell-for-cell. Note that `false`
does NOT mean "no work happened": in the records-matched case, header reconciliation may
already have permuted or dropped fields (which also recalculates dependents), and (unless
`skipRematerialize`) every PT that references the cache is re-materialized even when
nothing changed at all.

### findAt()

```ts
findAt(sheetName: string, row: number, col: number): PivotTable | null
```

Find the pivot table whose protected footprint ({@link PivotTable.getProtectedBounds})
contains the given cell, or null if no pivot table covers that cell.

### findIntersecting()

```ts
findIntersecting(sheetName: string, top: number, left: number, bottom: number, right: number): PivotTable | null
```

Find the first pivot table on `sheetName` whose protected footprint
intersects the inclusive cell range `[top..bottom] x [left..right]`, or
null if none. Used by GETPIVOTDATA, whose `pivot_table` argument may be a
multi-cell range that overlaps but does not anchor at the pivot's
top-left (Microsoft documents the arg as "a reference to any cell,
range of cells, or named range of cells in a PivotTable").

Iteration order matches `findAt`'s (insertion order within sheet), so
the first registered pivot wins on ambiguous overlaps.

## class PivotTable

Runtime representation of a pivot table. Wraps the JSF PivotTable definition and provides
methods for computing layout, writing to sheet cells, and looking up values for GETPIVOTDATA.

### cacheIndex

```ts
readonly cacheIndex: number
```

Position in the owning manager's `_caches` array, or `-1` when unbound. Used only for
serialization correlation; runtime lookups go through the attached cache directly. Readonly
because the invariant "matches `manager._caches.indexOf(_cache)`" must be updated atomically
with the cache attachment.

### name

```ts
get name(): string
```

### cache

```ts
get cache(): PivotCache | null
```

The live cache this pivot table computes from (possibly shared), or null before it is bound.

### sheet

```ts
get sheet(): string
```

### ref

```ts
get ref(): CellRange
```

The A1-style range covering the pivot's output area.

### rowFieldIndices

```ts
get rowFieldIndices(): readonly number[]
```

Row field indices with negative placeholders (e.g. -2 for "Values") filtered out.

### colFieldIndices

```ts
get colFieldIndices(): readonly number[]
```

Column field indices with negative placeholders (e.g. -2 for "Values") filtered out.

### fields

```ts
get fields(): readonly PivotField[]
```

### rowFields

```ts
get rowFields(): readonly PivotField[]
```

### colFields

```ts
get colFields(): readonly PivotField[]
```

### pageFields

```ts
get pageFields(): readonly PivotField[]
```

### addMeasure()

```ts
addMeasure(field: PivotField, options?: {
    name?: string;
    aggregation?: PivotDataFieldAggregation;
  }): PivotMeasure
```

### measures

```ts
get measures(): readonly PivotMeasure[]
```

### dataFields

```ts
get dataFields(): readonly PivotDataField[]
```

The data fields (a fresh deep copy on every read --- elements too, since the `readonly`
array typing would not stop element mutation), defaulting to empty when absent. Mutations
belong on `jsf.dataFields` (followed by {@link clearLayout}), never here.

### colStride

```ts
get colStride(): number
```

Columns each column-header group occupies in the computed output: normally
one per data field, but collapses to 1 when the location lacks slack for
the synthetic Values row (Excel's `hideValuesRow="1"` signature: multi-data
+ col-axis + no slack between `firstHeaderRow` and `firstDataRow`). Used by
the cell emitter for column position arithmetic --- except the row-axis Values
layout, which overrides the column stride to 1 and expands rows by the data-field
count instead (see {@link resolveRowAxisStrides}). Degenerate case (no data
fields) yields 1.

### location

```ts
get location(): import("@jsfkit/types").PivotTableLocation
```

### rowGrandTotals

```ts
get rowGrandTotals(): boolean
```

### colGrandTotals

```ts
get colGrandTotals(): boolean
```

### layoutForm

```ts
get layoutForm(): "compact" | "outline" | "tabular"
```

The report layout form, read from the fields on the row and column axes: the form is recorded
per field and the layout renders from those flags, while the root `compact` and `outline` are
the defaults for a field placed later. Fields that disagree report the least tabular form among
them, compact before outline. A definition with no axis field reports the root's form.

### showMissing

```ts
get showMissing(): boolean
```

### missingCaption

```ts
get missingCaption(): string | undefined
```

### rename()

```ts
rename(newName: string): void
```

### setGrandTotals()

```ts
setGrandTotals(axis: "row" | "col", enabled: boolean): void
```

### setLayoutForm()

```ts
setLayoutForm(form: "compact" | "outline" | "tabular"): void
```

### setShowMissing()

```ts
setShowMissing(show: boolean): void
```

### setMissingCaption()

```ts
setMissingCaption(caption: string | undefined): void
```

### style

```ts
get style(): import("@jsfkit/types").PivotTableStyle | undefined
```

### pageArea

```ts
get pageArea(): PivotPageArea | null
```

Geometry of the page-field (report filter) area, or null when the pivot has no page fields.
The renderer (mondrian) reads this to find the filter cells --- they sit above and outside
`ref`, so its per-cell pivot index built from `ref` never reaches them --- e.g. to position a
declared table style's `pageFieldLabels` / `pageFieldValues` regions.

The geometry is purely positional: when the anchor sits too high for all the rows to fit
(a hand-built JSF; Excel reserves the rows on creation), the reported region can extend above
the top of the sheet, and `getCellWrites` omits the cells that fall there. Callers clip to
the sheet.

### rowRoles

```ts
get rowRoles(): PivotRowRole[]
```

Style roles of the output rows that are not plain data rows: the row axis's subheading
(group label) and subtotal rows, as 0-based row offsets from the top of the output area.
The renderer (mondrian) reads this to position a declared table style's
`firstRowSubheading` / `firstSubtotalRow` regions. Blank separator rows
(`insertBlankRow="1"`) carry no role; the renderer styles them as plain body rows.
In the row-axis Values (`dataOnRows`) layout each aggregate subtotal spans one sheet row per
data field, so it contributes that many entries --- regardless of its role, since an
outline-above aggregate (Values nested at a non-innermost row position) classifies as a
`subheading` yet still expands (see below). Only the separator and blank rows stay single-row
(the positioner collapses their data-field offset).

A row is a `subheading` when it is the group's label row, and a `subtotal` only when it is a
dedicated subtotal row below its group. Excel styles the *above-group* row (outline/compact
"subtotal at top", where the group label and its subtotal share one row) as a subheading, not a
subtotal --- verified in Excel on `PivotStyleLight16` (an above-group row shows no top border
and no fill, the `firstRowSubheading` look, where `firstSubtotalRow` would add a top border).
So `outlineAbove` rows classify as `subheading` alongside the bare separator rows; only
below-group rows (`outlineAbove === false`) are `subtotal`.

### colRoles

```ts
get colRoles(): PivotColRole[]
```

Column-axis style roles --- the {@link rowRoles} mirror for the column axis, as 0-based column
offsets from the left of the output area. The renderer positions a declared table style's
`firstSubtotalColumn` region on these.

The column axis has no outline/separator placement modes (column subtotals always sit
right-of-group), so every entry is a `subtotal`; there is no column subheading. A column
subtotal materializes once per displayed data field --- the data fields multiply the columns,
except in the `hideValuesRow` collapse where they show as a single block, and in the row-axis
Values (`onRows`) layout where they multiply rows instead --- so this emits one role per
(subtotal, displayed data-field column), at the same columns the cell emitter writes them to:
the positions come from the emitter's own `subtotalCol` closure (see `_refRelativeEmitter`).
Verified against `excel-test/pivot-valuesouter-colsubtotal-verify` and
`excel-test/pivot-values-inner-position`.

### getDataValue()

```ts
getDataValue(dataFieldName: string, criteria: Array<[
    string,
    CellValue
  ]>, options?: {
    caseSensitiveFieldNames?: boolean;
  }): CellValue | PivotLookupError
```

Look up an aggregated value by data field name and field/item criteria (GETPIVOTDATA).

### containsOutput()

```ts
containsOutput(row: number, col: number): boolean
```

Check whether `(row, col)` falls within this pivot table's output area.

### getOutputBounds()

```ts
getOutputBounds(): Readonly<OutputBounds> | null
```

Compute and cache the output bounds from the materialized cell writes. Unlike `ref`, which is
only rewritten when a refresh/repaint runs and so can lag a source-data change, these bounds
always reflect the current data. Returns null for malformed refs. Every call returns a fresh
copy: the bounds behind `containsOutput`, `PivotManager.findAt`, and the pivot write guards
must not be reachable through the return value.

### getProtectedBounds()

```ts
getProtectedBounds(): Readonly<OutputBounds> | null
```

The pivot's full protected footprint: its output area ({@link getOutputBounds}) extended to
cover the page-field (report-filter) area, which materializes ABOVE the anchor (and, when the
page fields wrap into multiple column-groups, to the RIGHT of the body) and outside `ref` (see
{@link PivotPageArea}). Identical to `getOutputBounds` when the pivot has no page fields.

The range/structural write guards (clearCells, moveCells, insert/delete cells, insert/delete
rows or columns) use this rather than `getOutputBounds` so they agree with the single-cell write
guard, which blocks writes anywhere in the per-sheet R-tree footprint (fed from
`boundsOfWrites`, which already covers the page-field caption cells). Without it, a range or
structural edit overlapping only the page area would slip past while a direct write to the same
cell is blocked.

Body-bounds consumers keep using `getOutputBounds`: `syncLayoutToJSF`'s `ref` excludes the page
area by Excel convention, and the adopted-output export scrub deliberately reads only the body.

## class PivotCache

Runtime representation of a pivot cache: wraps the JSF `PivotCache` definition and exposes
resolved records with shared-item indices replaced by actual values.

### resolvedRecords

```ts
get resolvedRecords(): readonly (readonly CellValue[])[]
```

The records with every calc-field column resolved. Indexing `resolvedRecords[r][fieldIndex]`
returns a real value for any field, so this getter first materializes any calc-field column not
yet filled (a no-op once they all are). Use it when you need an arbitrary field's value and
cannot assume it has been resolved. When resolution has already happened, or only specific calc
fields are needed, read {@link records} instead (resolving just those via
{@link ensureCalcFieldsResolved}) to avoid materializing columns no one reads.

### compiledCalcFields

```ts
get compiledCalcFields(): ReadonlyMap<number, CompiledCalcField>
```

Compiled calc-field formulas, keyed by cache field index. Populated for fields with a
`formula` that compiles successfully; missing entries mean no formula or an unsupported one
(treated as if the field had no formula).

Layout consumes these under Excel's aggregate-then-apply model: each cell sums the formula's
referenced source fields over the contributing records (inlining any referenced calc field
over those sums), then calls `evaluate` once with those scalars substituted (see
{@link CalcFieldAggregator}).

### new PivotCache()

```ts
constructor(jsf: PivotCache)
```

### fieldNames

```ts
get fieldNames(): string[]
```

### sourceSheet

```ts
get sourceSheet(): string | undefined
```

### sourceRef

```ts
get sourceRef(): string | undefined
```

### adjustSourceRangeForMove()

```ts
adjustSourceRangeForMove(sheetName: string, dimension: Dimension, from: number, to: number, count: number): void
```

Adjust the source data range after a row/column reorder on a sheet (a move of the block
`[from, from + count)` landing with its first row/column at `to`). Unlike the
delete-then-insert model of {@link adjustSourceRange}, a source range fully inside the
moved block follows it to the new position: the move keeps the source data intact, so
clearing the ref (the genuine-deletion outcome) would silently disable refresh. Any other
range gets the delete-then-insert adjustment, which matches Excel for ranges the move
partially overlaps (see excel-test/pivot-move-source/verify.js).

### type PivotColRole

```ts
type PivotColRole = {
  col: number;
  /**
   * Always `'subtotal'`: the column axis has no outline/separator placement (column subtotals
   * always sit right-of-group), so there is no column-subheading row-axis analog.
   */
  kind: "subtotal"; /** 1-based column-field nesting level (1 = outermost). */
  level: number;
}
```

### type PivotRowRole

```ts
type PivotRowRole = {
  row: number;
  kind: "subheading" | "subtotal"; /** 1-based row-field nesting level (1 = outermost). */
  level: number;
}
```

The style role of one pivot output row that a renderer styles differently from a plain data
row, identified by its 0-based row offset from the top of the pivot's output area
({@link PivotTable.ref}):

- `subheading`: a group-label row. This covers a bare label (no aggregated data) and the
  subtotal-above collapsed row, where the group label and its subtotal share one row (compact,
  and tabular outline --- Excel's defaults); Excel styles such top-of-group rows as headings.
- `subtotal`: a dedicated subtotal row below its group.

### type PivotPageArea

```ts
type PivotPageArea = {
  /** Ref-relative row offset of the first (top) page-field row (`-(rowCount + 1)`). */ firstRow: number; /** Number of rows the page area spans (the grid height). */
  rowCount: number; /** Number of page-field column-groups (the grid width). */
  colCount: number; /** Columns between adjacent column-groups' caption cells (Excel uses 3). */
  colStride: number; /** Ref-relative column offset of the first column-group's caption cells. */
  labelCol: number; /** Ref-relative column offset of the first column-group's selected-item cells. */
  valueCol: number; /** Field fill order across the grid: over-then-down when true, else down-then-over (default). */
  overThenDown: boolean;
}
```

Geometry of a pivot's page-field (report filter) area. The area sits above the pivot's output
area, OUTSIDE `ref` --- Excel's `location/@ref` convention excludes it --- so its row offsets,
relative to the top of `ref`, are negative. Each page field is a caption / selected-item cell
pair; the fields fill a grid `rowCount` rows tall by `colCount` column-groups wide, ending one
blank spacer row above the output area (so the last row is at ref-relative row `-2`).

The grid is a single column by default (`pageWrap` 0); Excel wraps it when `pageWrap` is set.
Adjacent column-groups are `colStride` columns apart (Excel uses 3: caption, value, one gap).
Fields are assigned to cells in `pageFields` order, either down-then-over (default) or
over-then-down (`overThenDown`); use {@link pageFieldCellOffset} to map a field index to its
ref-relative cell. (A partial final group/row is expected when the field count is not a multiple
of the wrap.) All verified in Excel.

### type PivotLookupError

```ts
type PivotLookupError = {
  readonly [PIVOT_LOOKUP_ERROR_BRAND]: true;
  readonly reason: PivotLookupErrorReason;
}
```

### type PivotLookupErrorReason

```ts
type PivotLookupErrorReason = "no_cache" | "data_field_not_found" | "unknown_criteria_field" | "ambiguous_match" | "no_match"
```

### function isPivotLookupError()

```ts
function isPivotLookupError(value: unknown): value is PivotLookupError
```

Whether the value is a {@link PivotLookupError}. Sound in both directions: only
{@link pivotLookupError} can attach the module-private symbol brand, so brand-present is
equivalent to is-error.

