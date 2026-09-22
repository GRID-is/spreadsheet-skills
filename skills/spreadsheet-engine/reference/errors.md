<!-- GENERATED FILE. Do not edit by hand. Regenerate with `npm run sync`. -->

# Errors: formula error values and thrown errors

Generated from `@grid-is/spreadsheet-engine@17.1.1` (`dist/index.d.ts`). Every public symbol listed here exists in that version. If the installed version differs, read `node_modules/@grid-is/spreadsheet-engine/dist/index.d.ts` instead; it is the source of truth.

`FormulaError` values flow through cell values and `runFormula` results; they are not thrown. The `Error` subclasses are thrown by edits the engine refuses.

## class FormulaError

Error value that may result from formula evaluation and be stored as a cell
value.

Consumers of Apiary should typically not create instances of this class
themselves. Instances are generally the constants {@link ERROR_VALUE} etc.,
or derived from them using {@link FormulaError.detailed}.

### detail

```ts
readonly detail: string | null
```

Detail message, with specific information about the nature and/or cause of
the error.

```ts
"YEARFRAC: basis must be 0, 1, 2, 3, or 4"
```

### code

```ts
readonly code: number
```

Positive integer identifying this error type, as returned by the
`ERROR.TYPE` function.

```ts
3 for a `#VALUE!` error.
```

### name

```ts
readonly name: string
```

Name of the formula error as it appears in a cell.

```ts
"#VALUE!"
```

### origin

```ts
readonly origin: Reference | null
```

Fully-prefixed reference to the formula cell or defined name in which
the error originally arose during formula evaluation, or `null` for error
instances that were not produced by formula evaluation (such as the shared
singleton constants {@link ERROR_VALUE} etc.

Populated automatically by `evaluateAST` when a formula produces an error,
but preserved (not overwritten) when a formula yields an existing error
originating in a different cell or defined name. Thus this property always
points back to the cell where the error first arose, not to the last cell
or intermediate cells along the propagation chain.

### equals()

```ts
equals(other: unknown): boolean
```

### valueOf()

```ts
valueOf(): string
```

### toString()

```ts
toString(): string
```

### detailed()

```ts
detailed(detail: string): FormulaError
```

Get an instance of this error type with the given detail, available as the `.detail` property.

Intended usage:
* Instead of using ERROR_FOO, use ERROR_FOO.detailed(detailText) to include detail specific to this error
* When displaying an error, expose `.detail` if and as appropriate (e.g. only in edit mode?)
* The detail text should be short and oriented towards helping authors understand how their model goes wrong,
  e.g. for ERROR_NAME the detail text might be the function name or defined name that wasn't recognized.
* Apiary internals should not be exposed (e.g. exception messages, except where known to be end-user-friendly)

Error instances created this way are memoized, so that only one error instance with a given code, name and
detail will be created.

- `detail`: some textual detail about the error, e.g. the unrecognized function name for #NAME?

### withOrigin()

```ts
withOrigin(origin: Reference | null): FormulaError
```

Make a new `FormulaError` instance like this one but with the given origin.

- `origin`: a fully-prefixed reference to the formula cell or defined
name in which this error originated, or null to set no origin.

Returns: A new `FormulaError` instance with the given origin

### detailedMessage

```ts
get detailedMessage(): string
```

A string representation of this error including its detail message, if any, in parentheses.

### detailedMessageWithOrigin

```ts
get detailedMessageWithOrigin(): string
```

A string representation of this error including its detail message and/or origin, if any.
This is intended for development and debugging rather than for end-user display, and its exact format may change.

### const ERROR_CALC

```ts
const ERROR_CALC: FormulaError
```

### const ERROR_DIV0

```ts
const ERROR_DIV0: FormulaError
```

### const ERROR_FIELD

```ts
const ERROR_FIELD: FormulaError
```

### const ERROR_GETDATA

```ts
const ERROR_GETDATA: FormulaError
```

### const ERROR_NA

```ts
const ERROR_NA: FormulaError
```

### const ERROR_NAME

```ts
const ERROR_NAME: FormulaError
```

### const ERROR_NULL

```ts
const ERROR_NULL: FormulaError
```

### const ERROR_NUM

```ts
const ERROR_NUM: FormulaError
```

### const ERROR_REF

```ts
const ERROR_REF: FormulaError
```

### const ERROR_SPILL

```ts
const ERROR_SPILL: FormulaError
```

### const ERROR_SYNTAX

```ts
const ERROR_SYNTAX: FormulaError
```

### const ERROR_UNKNOWN

```ts
const ERROR_UNKNOWN: FormulaError
```

### const ERROR_VALUE

```ts
const ERROR_VALUE: FormulaError
```

## class EditBlockedError extends Error

Base class for the engine's edit-guard refusals: operations the engine rejects to protect a
structure Excel also protects --- pivot table output, what-if data table results, worksheet
tables, merged cells and spill ranges under sort, and pivot refreshes that would produce an
invalid or overlapping result. Excel refuses the same operations via a modal alert or a silent
no-op; Apiary throws so the host application can decide how to react --- swallow the error to
reproduce Excel's no-op, or surface it to the user.

Every edit guard throws a subclass of this class, so a host can catch the whole family with a
single `instanceof EditBlockedError` test and fall back to per-class handling only where it
wants to distinguish refusals.

### sheetName

```ts
sheetName: string
```

Name of the sheet holding the protected region that blocked the operation.

### new EditBlockedError()

```ts
constructor(message: string, sheetName: string)
```

## class DataTableEditBlockedError extends EditBlockedError

Thrown when a structural edit (row/column insert, delete or move, `moveCells`, `clearCells`) or
a cell write would change part of a what-if data table in a way Excel refuses (verified
empirically). Excel refuses via a modal alert or a silent no-op depending on the operation;
Apiary surfaces the rejection so the host application can decide how to react.

### name

```ts
name: string
```

### dataTableRef

```ts
dataTableRef: string
```

A1 range (no sheet prefix) of the data table's result cells; the sheet is in `sheetName`.

### operation

```ts
operation: DataTableBlockedOperation
```

The kind of edit that was refused.

### new DataTableEditBlockedError()

```ts
constructor(dataTableRef: string, sheetName: string, operation: DataTableBlockedOperation, operationDescription: string)
```

## class MergedCellWriteBlockedError extends EditBlockedError

Thrown when a direct cell-value write targets a cell that is merged into another --- a non-anchor
cell of a merged range, whose displayed value Excel takes from the merge's anchor. Write to the
anchor cell (`mergedInto`) instead, or unmerge the range first. `cellRef` and `mergedInto` are A1
addresses with no sheet prefix; the sheet is in `sheetName`.

### name

```ts
name: string
```

### cellRef

```ts
cellRef: string
```

A1 address (no sheet prefix) of the refused write; the sheet is in `sheetName`.

### mergedInto

```ts
mergedInto: string
```

A1 address (no sheet prefix) of the merge anchor that `cellRef` is merged into.

### new MergedCellWriteBlockedError()

```ts
constructor(cellRef: string, sheetName: string, mergedInto: string)
```

## class PivotCellWriteBlockedError extends EditBlockedError

Thrown when a direct cell-value write targets a coordinate inside a pivot table's
output region. Output cells are materialized from the pivot's layout on refresh;
change the source data or the pivot's configuration instead.

### name

```ts
name: string
```

### pivotTableName

```ts
pivotTableName: string
```

### cellRef

```ts
cellRef: string
```

A1 address (no sheet prefix) of the refused write; the sheet is in `sheetName`.

### new PivotCellWriteBlockedError()

```ts
constructor(pivotTableName: string, sheetName: string, cellRef: string)
```

## class PivotDuplicateSourceHeadersError extends EditBlockedError

Thrown when refreshing a pivot cache is refused because the source range's header row contains
two case-insensitively equal column names (including two blank headers, which both read as
`''`), matching Excel's "PivotTable field name is not valid" refresh error. Rename one of the
source columns --- or opt into Excel's silent first-match resolution via `refreshCache`'s
`allowDuplicateHeaders` option --- and refresh again. `sheetName` is the sheet holding the
pivot's source range.

### name

```ts
name: string
```

### headerName

```ts
headerName: string
```

The duplicated header name as read from the source (`''` for blank headers).

### new PivotDuplicateSourceHeadersError()

```ts
constructor(headerName: string, sheetName: string)
```

## class PivotEditBlockedError extends EditBlockedError

Thrown when a structural edit (row/column insert, delete or move, `insertCells`/`deleteCells`,
`moveCells`, `clearCells`) or a range operation (`fill`, `sortCells`) targets a range that
overlaps a pivot table's protected footprint. Excel's GUI refuses each of these (via a modal
alert or silent no-op depending on the operation); Apiary surfaces the rejection so the host
application can decide how to react.

Each `operation` has a default message; callers can pass an `operationDescription` when a more
specific phrasing fits the refusal (e.g. `'delete cells whose shift would tear'`).

### name

```ts
name: string
```

### pivotTableName

```ts
pivotTableName: string
```

### operation

```ts
operation: PivotBlockedOperation
```

The kind of edit that was refused.

### new PivotEditBlockedError()

```ts
constructor(pivotTableName: string, sheetName: string, operation: PivotBlockedOperation, operationDescription?: string)
```

## class PivotOutputOverlapsDataError extends EditBlockedError

Thrown when adding or refreshing a pivot table would land its output region on cells that are not
empty and not already owned by the same pivot. Modelled on Excel's overlap warning dialog; the
host is responsible for offering a confirm-and-replace affordance and re-issuing the operation
with the user cells cleared.

### name

```ts
name: string
```

### pivotTableName

```ts
pivotTableName: string
```

### collidingCellRef

```ts
collidingCellRef: string
```

A1 address (no sheet prefix) of a colliding cell; the sheet is in `sheetName`.

### collidingPivotTableName

```ts
collidingPivotTableName: string | null
```

### new PivotOutputOverlapsDataError()

```ts
constructor(pivotTableName: string, sheetName: string, collidingCellRef: string, collidingPivotTableName: string | null)
```

## class ReorderMergeBlockedError extends EditBlockedError

Thrown when a row/column reorder ({@link Workbook.reorderRows}/`reorderColumns`) would cut
through part of a merged cell --- a merge whose rows or columns cannot all travel together,
because it straddles the moved block's boundary or the cut falls inside its span. Excel never
executes such a cut: its GUI snaps the selection outward to encompass the whole merge (even
when the cut rows/columns lie strictly inside the merge's span), and a scripted cut of the
exact bisecting window errors out (GRID-is/excel-test, folder `merge-straddling-row-cut`).
Merges that translate whole with their rows/columns still move.

### name

```ts
name: string
```

### axis

```ts
axis: "row" | "col"
```

The axis the refused reorder moved along.

### mergeRef

```ts
mergeRef: string
```

A1 range (no sheet prefix) of the merged cell the reorder would cut through.

### new ReorderMergeBlockedError()

```ts
constructor(axis: "row" | "col", mergeRef: string, sheetName: string)
```

## class SheetEdgeBlockedError extends EditBlockedError

Thrown when an insert (`insertRows` / `insertColumns` / `insertCells`) would push non-empty cells
or a drawing off the edge of the sheet, which Excel also refuses ("To prevent possible loss of
data..." / "Cannot shift objects off sheet"), leaving the sheet untouched. Unlike the other
guards this protects the sheet's own bounds rather than a named table/pivot/data-table, so it
carries no structure name --- only `reason` (content vs drawing) and the `operation` that was
refused.

### name

```ts
name: string
```

### reason

```ts
reason: SheetEdgeBlockedReason
```

Whether cell content or a drawing would have overflowed.

### operation

```ts
operation: string
```

The insert operation that was refused (`insertRows` / `insertColumns` / `insertCells`).

### new SheetEdgeBlockedError()

```ts
constructor(reason: SheetEdgeBlockedReason, sheetName: string, operation: string)
```

## class SortCellsBlockedError extends EditBlockedError

Thrown when `sortCells` targets a range containing structures the sort cannot relocate as a
unit: merged cells, a multi-row spill, or a spill reaching into the range from outside it.
Excel refuses the corresponding sorts too (for spills, see GRID-is/excel-test#31, folder
`sort-cells-spills`).

### name

```ts
name: string
```

### reason

```ts
reason: SortCellsBlockedReason
```

Why the sort was refused.

### new SortCellsBlockedError()

```ts
constructor(reason: SortCellsBlockedReason, sheetName: string)
```

## class TableEditBlockedError extends EditBlockedError

Thrown when a bounded `insertCells`/`deleteCells`, or a `sortCells`, would tear a worksheet
table (an Excel Table) --- leaving part of it behind, or rearranging structure that is not
sortable data. A delete may only touch a table by removing whole table rows (shift up) or whole
table columns (shift left), and a table elsewhere in the shift path must have its full span
inside the shifted band so it moves whole. A sort may only permute whole rows of a table's data
body, across the table's full width.

### name

```ts
name: string
```

### tableName

```ts
tableName: string
```

### operation

```ts
operation: TableBlockedOperation
```

The kind of edit that was refused.

### new TableEditBlockedError()

```ts
constructor(tableName: string, sheetName: string, operation: TableBlockedOperation, operationDescription: string, detail?: string)
```

## class NameNotFoundError extends Error

### name

```ts
name: string
```

### definedName

```ts
definedName: string
```

The defined name that failed to resolve.

### workbookName

```ts
workbookName: string | null
```

### new NameNotFoundError()

```ts
constructor(name: string, workbookName: string | null)
```

## class SheetNotFoundError extends Error

### name

```ts
name: string
```

### sheetName

```ts
sheetName: string
```

### workbookName

```ts
workbookName: string | null
```

### new SheetNotFoundError()

```ts
constructor(sheetName: string, workbookName: string | null)
```

## class WorkbookNotFoundError extends Error

### name

```ts
name: string
```

### workbookName

```ts
workbookName: string
```

### new WorkbookNotFoundError()

```ts
constructor(workbookName: string)
```

### type DataTableBlockedOperation

```ts
type DataTableBlockedOperation = "insert-rows" | "insert-columns" | "delete-rows" | "delete-columns" | "insert-cells" | "delete-cells" | "move-rows" | "move-columns" | "move-cells" | "move-cells-onto" | "overwrite"
```

The kind of edit a {@link DataTableEditBlockedError} refusal is about, for programmatic handling
(e.g. a localized message) by the host application:

- `insert-rows` / `insert-columns` --- an entire-line insert that would split the table;
- `delete-rows` / `delete-columns` --- an entire-line delete taking part of the table;
- `insert-cells` --- a bounded `insertCells` whose range touches the table's block, or whose
  shift would move only part of it;
- `delete-cells` --- a bounded `deleteCells` taking part of the table (short of removing it
  whole), or whose shift would move only part of it;
- `move-rows` / `move-columns` --- an entire-line move taking part of the table;
- `move-cells` --- a `moveCells` cutting part of the table (or exactly its result range);
- `move-cells-onto` --- a `moveCells` landing on part of the table's result range;
- `overwrite` --- a write or clear changing part of the result range; also used by the fill
  and sort refusals, which refuse any touch of the result range (the message names the
  refused operation).

### type PivotBlockedOperation

```ts
type PivotBlockedOperation = "insert-rows" | "insert-columns" | "delete-rows" | "delete-columns" | "insert-cells" | "delete-cells" | "move-rows" | "move-columns" | "move-cells" | "move-cells-onto" | "clear-cells" | "fill" | "sort"
```

The kind of edit a {@link PivotEditBlockedError} refusal is about, for programmatic handling
(e.g. a localized message) by the host application:

- `insert-rows` / `insert-columns` --- an entire-line insert landing strictly inside the pivot
  table's footprint (insertion at the top/left boundary is allowed and shifts it);
- `delete-rows` / `delete-columns` --- an entire-line delete covering some but not all of the
  pivot table on the deleted axis;
- `insert-cells` / `delete-cells` --- a bounded `insertCells`/`deleteCells` whose range or
  shift path would change or move only part of the pivot table;
- `move-rows` / `move-columns` --- an entire-line move pulling lines out of the pivot table,
  or inserting them strictly inside it;
- `move-cells` --- a `moveCells` whose source range touches the pivot table;
- `move-cells-onto` --- a `moveCells` whose destination range touches the pivot table;
- `clear-cells` --- a `clearCells` touching the pivot table;
- `fill` --- a fill whose written region touches the pivot table;
- `sort` --- a `sortCells` whose range touches the pivot table.

### type TableBlockedOperation

```ts
type TableBlockedOperation = "insert-cells" | "delete-cells" | "sort"
```

The kind of edit a {@link TableEditBlockedError} refusal is about, for programmatic handling
(e.g. a localized message) by the host application:

- `insert-cells` --- a bounded `insertCells` whose shift would move only part of the table;
- `delete-cells` --- a bounded `deleteCells` taking part of the table without removing whole
  table rows or whole table columns, or whose shift would move only part of it;
- `sort` --- a `sortCells` whose range reaches outside the table's data body, or covers only
  part of its columns.

