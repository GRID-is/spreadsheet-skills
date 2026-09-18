<!-- GENERATED FILE. Do not edit by hand. Regenerate with `npm run sync`. -->

# Workbook and WorkSheet: formulas, structure, export

Generated from `@grid-is/spreadsheet-engine@17.1.0` (`dist/index.d.ts`). Every public symbol listed here exists in that version. If the installed version differs, read `node_modules/@grid-is/spreadsheet-engine/dist/index.d.ts` instead; it is the source of truth.

Formula edits, sheet management, row and column operations, fill, sort, merges, defined names, and XLSX export live on `Workbook`. `WorkSheet` gives per-sheet bounds and cell iteration.

## class Workbook extends emitter implements EvaluationContext

Individual workbook within a model. Contains Sheets which contain Cells.
Has its own dependency graph, so there are no dependencies between workbooks.

### ready

```ts
ready: boolean
```

### replacedBy

```ts
replacedBy: string | null
```

reserved for outside use (client loader)

### id

```ts
id: string
```

### type

```ts
type: WorkbookType
```

The origin of the workbook (Excel, Google Sheets, CSV, etc).

### isExternal

```ts
isExternal: boolean
```

Whether this workbook was loaded as an external reference from another workbook.

### mode

```ts
mode: WorkbookMode
```

### name

```ts
name: string
```

### metadata

```ts
metadata: GridMetadata
```

### tables

```ts
readonly tables: TableManager
```

Table collection operations. See {@link TableManager}.

### pivots

```ts
readonly pivots: PivotManager
```

Pivot table and pivot cache operations. See {@link PivotManager}.

### people

```ts
people: Person[]
```

Authors of cell comments, or people mentioned in a cell comment.

### comments

```ts
readonly comments: CommentsManager
```

Workbook-level comment operations. See {@link CommentsManager}.

### notes

```ts
readonly notes: NotesManager
```

Workbook-level note operations. See {@link NotesManager}.

### views

```ts
readonly views: ViewManager
```

Workbook-level view operations.

### styles

```ts
readonly styles: StyleManager
```

### update_time

```ts
update_time: string | undefined
```

### version

```ts
version: number | undefined
```

### cloud_connection

```ts
cloud_connection: CloudConnection | null
```

### charts

```ts
charts: ChartCSF[]
```

### defect

```ts
defect: string | null
```

### externals

```ts
externals: External[]
```

### theme

```ts
readonly theme: ThemeManager
```

Get and set workbook theme properties.

### calcMode

```ts
get calcMode(): CalcMode
set calcMode(value: CalcMode)
```

The calculation mode persisted on this workbook. Round-trips through
JSF/CSF and is emitted to xlsx as the `calcPr calcMode` attribute.

- `'auto'` (default): formulas recalculate on every change.
- `'autoNoTable'`: same as `'auto'`, but data-table anchor cells are
  deferred. Setting this triggers {@link Model.deferDataTables}.
- `'manual'`: informational. Apiary's engine still recalculates on
  writes; the value is preserved for round-trip and consumed by callers
  (e.g. the Office.js compatibility layer) that gate recalc themselves.

The setter drives {@link Model.deferDataTables} in both directions ---
assigning any value other than `'autoNoTable'` resets `deferDataTables`
to `false`. This differs from the one-directional attach-time behavior
documented on {@link Model.deferDataTables}: an explicit `calcMode`
assignment is a deliberate caller intent, so the side effect tracks the
new mode faithfully.

### Workbook.fromJSF()

```ts
static fromJSF(jsf: JSF, model: Model, options?: WorkbookOptions): Workbook
```

Create a Workbook from JSF format.

- `jsf`: - Workbook data in JSF format
- `model`: - The Model instance to attach this workbook to
- `options`: - Workbook initialization options

Returns: A new Workbook instance populated from JSF

### Workbook.fromJsf() (deprecated)

```ts
static fromJsf(jsf: JSF, model: Model, options?: WorkbookOptions): Workbook
```

### Workbook.fromCsf()

```ts
static fromCsf(csf: WorkbookCSF, model: Model, options?: WorkbookOptions): Workbook
```

Create a Workbook from CSF format directly, bypassing JSF conversion.
This provides significantly better performance than converting CSF→JSF→Workbook.

- `csf`: - Workbook data in CSF format
- `model`: - The Model instance to attach this workbook to
- `options`: - Workbook initialization options

Returns: A new Workbook instance populated from CSF

### Workbook.fromXLSXFile()

```ts
static fromXLSXFile(path: string, model: Model, options?: WorkbookOptions): Promise<Workbook>
```

Create a Workbook from an XLSX file path.

This is a convenience method that wraps `@borgar/xlsx-convert` to load XLSX files
directly into a Workbook without requiring users to manually import the conversion library.

Note: This creates only the main workbook. External references in the XLSX file are not
automatically added to the model. Use {@link Model.addWorkbookFromXLSXFile} to also add externals.

- `path`: - Path to the XLSX file (Node.js only - uses fs)
- `model`: - The Model instance to attach this workbook to
- `options`: - Workbook initialization options

Returns: A Promise resolving to a new Workbook instance

### Workbook.fromXlsxFile() (deprecated)

```ts
static fromXlsxFile(path: string, model: Model, options?: WorkbookOptions): Promise<Workbook>
```

### Workbook.fromXLSX()

```ts
static fromXLSX(data: Buffer | ArrayBuffer | Uint8Array, model: Model, filename: string, options?: WorkbookOptions): Promise<Workbook>
```

Create a Workbook from XLSX binary data.

This is a convenience method that wraps `@borgar/xlsx-convert` to load XLSX data
directly into a Workbook without requiring users to manually import the conversion library.

Note: This creates only the main workbook. External references in the XLSX file are not
automatically added to the model. Use {@link Model.addWorkbookFromXLSX} to also add externals.

- `data`: - Binary XLSX data (works in browsers and Node.js)
- `model`: - The Model instance to attach this workbook to
- `filename`: - Filename to associate with the workbook
- `options`: - Workbook initialization options

Returns: A Promise resolving to a new Workbook instance

### Workbook.fromXlsx() (deprecated)

```ts
static fromXlsx(data: Buffer | ArrayBuffer | Uint8Array, model: Model, filename: string, options?: WorkbookOptions): Promise<Workbook>
```

### env

```ts
get env(): Map<"username" | "isMobile" | "isPrint", MaybeBoxedFormulaArgument>
```

### getSheet()

```ts
getSheet(sheetName?: string | null): WorkSheet | null
```

Returns: the named sheet if sheetName is truthy (null if not found), else the first sheet.

### requireSheet()

```ts
requireSheet(sheetName: string): WorkSheet
```

Like {@link getSheet}, but throws if the sheet does not exist.

### getGlobal()

```ts
getGlobal(name: string): DefinedName | FormulaError
```

### getSheetByIndex()

```ts
getSheetByIndex(index?: number | null): WorkSheet | null
```

Get a sheet of the given index or else, if index is not provided, the first sheet of this workbook.

- `index`: the index of a sheet

Returns: the sheet found at the given index, or else the first sheet if none was given. If no sheets are present this method returns null.

### getSheets()

```ts
getSheets(): WorkSheet[]
```

### getSheetIndex()

```ts
getSheetIndex(sheetName?: string): number | null
```

Get the order index of a sheet with the given name.

- `sheetName`: the name of the sheet whose index should be returned. It
will be matched case-insensitively.

Returns: The index of the sheet with the given name, or null if no sheet
with that name exists, or 0 if no/empty name was given.

### getSheetSize()

```ts
getSheetSize(sheetName?: string | null): [
    number,
    number
  ]
```

Get the size of a sheet with the given name.

- `sheetName`: the name of the sheet whose size should be returned. It
will be matched case-insensitively. If not provided, or empty, the size
of the first sheet (0, 0) is returned.

Returns: The size of the sheet with the given name, or null if no sheet
with that name exists, or (0, 0) if no/empty name was given.

### getCell()

```ts
getCell(cellId: string, sheetName?: string | null): Cell | null
```

### addSheet()

```ts
addSheet(sheetName?: string | null, index?: number): WorkSheet
```

Add a new empty sheet to the workbook

- `sheetName`: - if no sheet name is provided a unique sheet name will be generated
- `index`: - if no index is provided the sheet will be appended to the list of sheets

### renameSheet()

```ts
renameSheet(currentName: string, newName: string): void
```

Rename the given sheet to a new name, updating all formulas referencing it
Precondition: formula parser has finished importing (`formulaParserReady` has resolved).

- `newName`: must be different from currentName

### reorderSheet()

```ts
reorderSheet(sheetName: string, newIndex: number): void
```

Move a sheet to a new position in the workbook.

- `sheetName`: the name of the sheet to move (matched case-insensitively)
- `newIndex`: the target zero-based position

### copySheet()

```ts
copySheet(sheetName: string, newName?: string): WorkSheet
```

Copy a sheet and insert the copy immediately after the source.

- `sheetName`: the name of the sheet to copy (matched case-insensitively)
- `newName`: name for the copy; if omitted, generates one following Excel's
convention (e.g. "Sheet1 (2)")

Returns: the new sheet

### rewriteFormulas()

```ts
rewriteFormulas(rewriteFormula: (formula: string, formulaSheet: string, formulaWorkbook: string) => string, recalcNow?: boolean, rewriteCharts?: boolean): number
```

Rewrite every formula cell's formula string by passing it through the
given transform; cells whose transformed result differs from the original
are updated and their dependency-graph edges rebuilt. Unless `rewriteCharts`
is false, this workbook's chart source-range formulas are rewritten too, so
a structural edit propagated across the model (each workbook's formulas run
through the edit's {@link RewriteFormula}) keeps a sibling workbook's charts
tracking the edited cells just as its formula cells do.

- `rewriteFormula`: Transform applied to each formula. Receives the
formula and its containing sheet/workbook names (see {@link }). Returning the input unchanged skips the cell.
- `recalcNow`: If false, skip the trailing recalculate(); the caller is
then responsible for triggering it.
- `rewriteCharts`: If false, leave this workbook's charts untouched. The
edited workbook's own structural-edit methods pass false because they
rewrite their charts separately (via {@link Workbook._rewriteChartFormulas});
a table rename passes false because chart refs deliberately do not follow a
table rename.

Returns: number of formulas changed

### removeSheet()

```ts
removeSheet(sheetName: string): boolean
```

Remove a sheet from the workbook.

- `sheetName`: the name of the sheet to delete. It will be
matched case-insensitively.

Returns: true if the sheet was removed, false if it did not exist

### removeDefinedName()

```ts
removeDefinedName(name: string, sheetName?: string | null): boolean
```

Remove a defined name (global or sheet-scoped) from the workbook.
This will schedule cells depending on that name for recalculation, but
will not perform that recalculation.

- `name`: the name of the defined name to remove. It will be matched
case-insensitively.
- `sheetName`: the name of a sheet the defined name is scoped to,
null if it is a global defined name. It will be matched
case-insensitively.

Returns: true if the name was removed, false if it did not exist (or the sheet did not exist)

### iterFormulaCells()

```ts
iterFormulaCells(): IterableIterator<Cell | DefinedName>
```

### iterDataTableCells()

```ts
iterDataTableCells(): IterableIterator<Cell>
```

### clearCells()

```ts
clearCells(ref: string | Reference): boolean
```

- `ref`: A reference to the cell, or range of cells, to clear. Defined names are not supported.

Returns: true if any changes were made (so a recalculation is in order).

### editCell()

```ts
editCell(cellRef: string | Reference, cellData: CellData): Cell | DefinedName
```

Write the given cell data attributes (`.v`, `.f`, etc.) to an existing or
new cell.

If cell value is an error value, normalize it to the corresponding
singleton error value in `errorTable`.

If `cellData` has a formula, it is parsed and (if parsing succeeds) the AST
is stored in the cell object.

If `cellData` has an `.f` property (whether null or not), the workbook's dependency graph is
updated to remove dependencies of the old formula (if any) and add those of the new (if any).

Precondition: formula parser has finished importing (`formulaParserReady` has resolved).

- `cellRef`: the cell to edit, as a `Reference` or a string representing
one. If this indicates a range, the top-left cell of that range is
edited. May also be a name reference (defined name).
- `cellData`: object with attributes to write to the cell

Returns: the existing or new `Cell` instance.

### writeCellData() (deprecated)

```ts
writeCellData(cellRef: string | Reference, cellData: CellData): Cell | DefinedName
```

### write()

```ts
write(cellRef: string | A1Reference, value: CellValue): boolean
```

Write `value` to the cell at `cellRef` (an A1 address). Returns true iff a cell was edited;
returns false (without throwing) when `cellRef` names a sheet that does not exist on this
workbook. Writes are persistent edits; see {@link Model.write} for the rationale.

### writeMultiple()

```ts
writeMultiple(writes: Array<readonly [
    string | A1Reference,
    CellValue
  ]>): void
```

Write each `[ref, value]` pair via {@link write}. Does not recalculate; the caller is
responsible (typically {@link Model.writeMultiple}).

### setColumnWidth()

```ts
setColumnWidth(sheetName: string, column: number, width: number): void
```

- `column`: 0-based column index
- `width`: non-negative

### setRowHeight()

```ts
setRowHeight(sheetName: string, rowNum: number, height: number): void
```

Sets the height of a row.

One function, SUBTOTAL, may yield different results depending on whether
some cells in the range belong to hidden rows or not. Therefore, if the
row becomes hidden, or was hidden before this change, a recalculation of
formulas referencing cells in the affected row will be required. This call
will register state about that, so that the next recalculation will update
formula cells as needed. It is up to the caller to make sure a recalculation
is eventually triggered.

- `rowNum`: 0-based row index
- `height`: non-negative

### mergeCells()

```ts
mergeCells(sheetName: string, rangeStr: string, { recalcNow }?: {
    recalcNow?: boolean | undefined;
  }): void
```

Merge a range of cells on the given sheet.

- `sheetName`: name of the sheet
- `rangeStr`: range in A1 notation, e.g. "A1:B2"
- `options`
- `options.recalcNow`: if true (default), recalculate after merging; set
to false to batch multiple merges before a single recalc

### unmergeCells()

```ts
unmergeCells(sheetName: string, rangeStr: string): void
```

Unmerge cells on the given sheet. Any existing merge that overlaps the
given range is fully removed. If no merges overlap, this is a no-op.

- `sheetName`: name of the sheet
- `rangeStr`: range in A1 notation, e.g. "A1:B2"

### isGlobal()

```ts
isGlobal(name: string): boolean
```

### setDefinedName()

```ts
setDefinedName<AbortOnError extends true | false = false>(name: string, formula: string, sheet?: WorkSheet | null, abortOnError?: AbortOnError, validateNow?: boolean): DefinedName | (AbortOnError extends true ? null : never)
```

Add a defined name in this workbook with the given formula.
If any error is detected in the formula (syntax error, or use of something
we do not support), abort and return null if `abortOnError` is true, else
go ahead and make the defined name but record the error with this.addError.

This method does not create a vertex in the dependency graph. If the graph
is already built (i.e. outside initial workbook construction), the caller
must call `updateDependencies([dn.vertexId])` on the returned DefinedName
to register its vertex and outgoing edges.

- `sheet`: sheet to scope the name to, or null for workbook scope
- `abortOnError`: true to return null and make no change if formula has any errors
- `validateNow`: set to false to skip formula validation here (caller is responsible for it then)

### rowHeight()

```ts
rowHeight(rowIndex: number, sheetName: string): number
```

Height of the given row in the given sheet, in pixels. When no span covers
the row, falls back to the sheet's default row height if set
(`sheet.defaults.rowHeight`), otherwise to the Excel default
({@link EXCEL_DEFAULT_ROW_HEIGHT_PX}, 16).

- `rowIndex`: 1-based row index
- `sheetName`: name of the sheet in which to look up a row height

### columnWidth()

```ts
columnWidth(columnIndex: number, sheetName: string): number
```

Width of the given column in the given sheet, in pixels. When no span
covers the column, falls back to the sheet's default column width if set
(`sheet.defaults.colWidth`), otherwise to the Excel default
({@link EXCEL_DEFAULT_COLUMN_WIDTH_PX}, 65).

- `columnIndex`: 1-based column index
- `sheetName`: name of the sheet in which to look up a column width

### errorLevel

```ts
get errorLevel(): number
```

### errors

```ts
get errors(): ModelError[]
```

### insertColumns()

```ts
insertColumns(sheetName: string, columnIndex: number, count: number, toTheRight: boolean): RewriteFormula
```

Insert `count` columns at a specific index in the given sheet.

- `columnIndex`: 0-based column index
- `count`: how many columns to insert
- `toTheRight`: determines whether the inserted columns are inserted to the
left or right of the column at `columnIndex`.

### insertRows()

```ts
insertRows(sheetName: string, rowIndex: number, count: number, below: boolean): RewriteFormula
```

Insert `count` rows at a specific index in the given sheet.

- `rowIndex`: 0-based row index
- `count`: how many rows to insert
- `below`: determines whether the inserted rows are inserted below or
above of the row at `rowIndex`.

### deleteColumns()

```ts
deleteColumns(sheetName: string, columnIndex: number, count: number): RewriteFormula
```

Delete `count` columns at a specific index in the given sheet.

- `columnIndex`: 0-based column index
- `count`: how many columns should be deleted

### deleteRows()

```ts
deleteRows(sheetName: string, rowIndex: number, count: number): RewriteFormula
```

Delete `count` rows at a specific index in the given sheet.

- `rowIndex`: 0-based row index
- `count`: how many rows should be deleted

### deleteCells()

```ts
deleteCells(range: string | A1Reference, shift: "up" | "left"): RewriteFormula
```

Delete the cells in `range`, shifting the cells below them up
(`shift: 'up'`) or the cells to their right left (`shift: 'left'`) to
fill the gap. The counterpart to {@link insertCells}.

A full-row range with `shift: 'up'` delegates to {@link deleteRows}; a
full-column range with `shift: 'left'` delegates to {@link deleteColumns}.
For those delegated cases the table and pivot-table guards are the ones
those methods enforce; the `@throws` conditions below describe the
bounded-range path.

- `range`: The cells to delete.
- `shift`: Direction the surviving cells move to fill the gap.

Returns: A {@link RewriteFormula} that adjusts references in other
workbooks' formulas to account for the delete. This workbook's own
formulas are rewritten in place.

### insertCells()

```ts
insertCells(range: string | A1Reference, shift: "down" | "right"): RewriteFormula
```

Insert blank cells at `range`, shifting the cells currently there --- and
everything below them (`shift: 'down'`) or to their right
(`shift: 'right'`) --- to make room. The counterpart to {@link deleteCells}.

A full-row range with `shift: 'down'` delegates to {@link insertRows}; a
full-column range with `shift: 'right'` delegates to {@link insertColumns}.

- `range`: The cells to insert; content there is displaced, not overwritten.
- `shift`: Direction the existing cells move to make room.

Returns: A {@link RewriteFormula} that adjusts references in other workbooks'
formulas to account for the insert. This workbook's own formulas are
rewritten in place.

### fill()

```ts
fill(source: string | A1Reference, destination: string | A1Reference, type?: FillType): void
```

Fill `destination` from `source`, as an Excel fill-handle drag does.
`destination` must contain `source` and extend it along a single axis ---
up, down, left, or right --- leaving the other axis unchanged. Each column
(vertical fill) or row (horizontal fill) is projected independently from
its own seed cells, carrying values, formulas, and formatting.

- `source`: The seed range to project. Its cells are left untouched.
- `destination`: The range to fill.
- `type`: How to project the seed; see {@link FillType}. Defaults to
`'default'`: a seed of two or more cells extends its numeric runs as
linear series, everything else is copied.

### reorderColumns()

```ts
reorderColumns(sheetName: string, from: number, to: number, count: number): RewriteFormula
```

Reorder `count` columns by lifting them out at `from` and reinserting them
at `to`, reflowing the columns in between to make room. Nothing is
overwritten: the columns the block passes over slide left or right to fill
the space it vacated, and the block drops into the gap opened at the
destination.

Contrast with {@link moveCells}, which overwrites the destination and
leaves the source range blank rather than reflowing.

- `from`: 0-based index of the first column to move
- `to`: 0-based index of the destination of the first column
- `count`: the number of columns to move

### reorderRows()

```ts
reorderRows(sheetName: string, from: number, to: number, count: number): RewriteFormula
```

Reorder `count` rows by lifting them out at `from` and reinserting them at
`to`, reflowing the rows in between to make room. Nothing is overwritten:
the rows the block passes over slide up or down to fill the space it
vacated, and the block drops into the gap opened at the destination. This is
the row equivalent of dragging a selected row band to a new position.

Contrast with {@link moveCells}, which overwrites the destination and
leaves the source range blank rather than reflowing.

- `from`: 0-based index of the first row to move
- `to`: 0-based index of the destination of the first row
- `count`: the number of rows to move

### moveCells()

```ts
moveCells(from: string | A1Reference, to: string | A1Reference, recalcNow?: boolean): RewriteFormula
```

Move the cells in the `from` range to the `to` range, preserving cell
values, formulas, styles, comments, and notes. References inside the
moved formulas are adjusted to track their new positions, and tables
fully contained within `from` move with the cells.

This is an overwrite move: whatever was at `to` is replaced, and the
`from` range is left blank. To instead reflow surrounding content to make
room (insert at the destination, never overwrite), use
{@link reorderRows} or {@link reorderColumns}.

This workbook's own formula cells are adjusted here, including ones outside `from` that
reference the moved or the overwritten cells, and so are its defined names; a caller has
nothing further to do for them. A defined name that survives the move keeps its sheet
qualifier, naming the destination sheet after a cross-sheet one; a name the move breaks keeps
it only when it named a single cell.

The names Apiary creates for itself are the exception, and are left as they are: a cached
formula, whose original the GRID Sheets host rewrites and re-caches under its own id, and an
extracted subexpression, which is left behind pointing at the emptied source while the
formulas it was hoisted out of follow the move (see `rewriteDependentsOf` in `moveCells.ts`).

Returns a {@link RewriteFormula} function for the *other* workbooks in the model, whose
formulas may reference this one. The caller applies it to each of them via
{@link Workbook.rewriteFormulas}; this method does not do that itself.

Do not apply the rewrite function to this workbook. This workbook's formulas have already been
adjusted, and the function turns a reference to `to` into `#REF!` (the move destroyed whatever
was there), so a second pass would break exactly the references the first pass repointed.

Precondition: formula parser has finished importing (`formulaParserReady` has resolved).

- `from`: Must be the same dimensions as `to`
- `to`: Must be the same dimensions as `from`
- `recalcNow`: If false, skip the recalculate() call at the end. Useful
when the caller will write more data before recalculating.

Returns: A {@link RewriteFormula} for other workbooks' formulas, as described above.

### sortCells()

```ts
sortCells(sheetName: string, range: {
    top: number;
    left: number;
    bottom: number;
    right: number;
  }, sortKeys: SortKey[], options?: SortOptions): void
```

Sort rows within a range of cells by one or more key columns.

Formulas move with their cells, with relative references adjusted for the
row position change. References from outside the sort range pointing into it
are deliberately not rewritten (they see new values at the same address).

Throws `PivotEditBlockedError` if the range overlaps a pivot table's footprint, and
`DataTableEditBlockedError` if it overlaps a data table's result cells --- whether the
overlap is partial or complete. Throws `SortCellsBlockedError` if the range contains
structures the sort cannot relocate as a unit: merged cells, a multi-row spill, or a spill
reaching into the range from outside.

Precondition: formula parser has finished importing (`formulaParserReady` has resolved).

### clearCachedFormulasExcept()

```ts
clearCachedFormulasExcept(formulas: string[]): void
```

### toCSF()

```ts
toCSF(): CSFOutput
```

### toJSF()

```ts
toJSF(): JSF
```

Serialize this workbook to JSF (JSON Spreadsheet Format).

This is the inverse of {@link Workbook.fromJSF}, producing a JSF object
that can be used to reconstruct the workbook state.

Returns: A JSF object representing this workbook

### toJsf() (deprecated)

```ts
toJsf(): JSF
```

### toXLSX()

```ts
toXLSX<T extends XLSXOutputType = "nodebuffer">(outputType?: T, options?: ToXLSXOptions): Promise<XLSXOutputMap[T]>
```

Convert this workbook to XLSX format and return the result as a Buffer.

This method converts the workbook to JSF format first, then generates
an XLSX file from that representation.

- `outputType`: - The output format: `'nodebuffer'` (default) or `'arraybuffer'`
- `options`: - Optional settings (e.g. compression level)

Returns: A Buffer containing the XLSX file data

### toXlsx() (deprecated)

```ts
toXlsx<T extends XLSXOutputType = "nodebuffer">(outputType?: T, options?: ToXLSXOptions): Promise<XLSXOutputMap[T]>
```

### toXLSXFile()

```ts
toXLSXFile(path: string, options?: ToXLSXOptions): Promise<void>
```

Convert this workbook to XLSX format and write it to a file.

This method converts the workbook to JSF format first, then generates
an XLSX file from that representation and writes it to the specified path.

- `path`: - The file path to write the XLSX file to
- `options`: - Optional settings (e.g. compression level)

### toXlsxFile() (deprecated)

```ts
toXlsxFile(path: string, options?: ToXLSXOptions): Promise<void>
```

## class WorkSheet extends emitter

An object describing a sheet of A1-addressable spreadsheet cells.

### name

```ts
name: string
```

### index

```ts
index: number
```

### hidden

```ts
hidden: 0 | 1 | 2
```

### merges

```ts
merges: Record<string, [
    width: number,
    height: number
  ]>
```

### columns

```ts
columns: GridSize[]
```

### rows

```ts
rows: GridSize[]
```

### defaults

```ts
defaults: {
    colWidth?: number;
    rowHeight?: number;
  }
```

### merged_cells

```ts
merged_cells: string[]
```

### drawings

```ts
drawings: DrawingCSF[]
```

### comments

```ts
comments: ThreadedComment[]
```

Threaded comments.

Top-level comments may have replies. Each top-level comment is linked to a single cell in the
sheet. Comment bodies are plain text. Structured annotations such as \@mentions and hyperlinks
are expressed via the optional `runs` array, which references character ranges within the text.

### notes

```ts
notes: Note[]
```

Cell notes.

Each note is linked to a single cell and contains plain text content.

### locallyScopedNames

```ts
locallyScopedNames: Record<string, DefinedName>
```

### new WorkSheet()

```ts
constructor(name: string, workbookKey: number, index: number, styles: StyleManager, hidden?: 0 | 1 | 2, /** The origin of the workbook (Excel, Google Sheets, CSV, etc). */ workbookType?: WorkbookType)
```

### cellCount

```ts
get cellCount(): number
```

### getCell()

```ts
getCell(cellID: string): Cell | null
```

### getCellByID()

```ts
getCellByID(cellID: string): Cell | null
```

- `cellID`: cell address in A1 form without prefix

### getCellByRange()

```ts
getCellByRange(range: {
    top: number;
    left: number;
  }): Cell | null
```

### pivotOutputAt()

```ts
pivotOutputAt(row: number, col: number): string | null
```

Return the name of the pivot table whose output region contains `(row, col)`, or `null` if
none.

### resolveArea()

```ts
resolveArea<O extends ResolveAreaOptions>(range: SlimRange, options?: O): {
    area: AreaArrayElement<O>[][];
  } & AreaArrayLocation & {
    defaultValue: AreaArrayElement<O> | null;
    defaultColumn: (AreaArrayElement<O> | null)[];
    defaultRow: (AreaArrayElement<O> | null)[];
  }
```

### getSpillAnchoredAtRange()

```ts
getSpillAnchoredAtRange(range: Range | Reference): Range | null
```

Get the area which a spilled range covers, given a reference to the
spilled range's anchor cell.

### getCells()

```ts
getCells(includeStyleOnly?: boolean): IterableIterator<Cell>
```

Returns an iterator of all cells contained in this sheet, even individual
cells within spilled ranges.

- `includeStyleOnly`: include cells that have never had a value but only style info

### iterFormulaCells()

```ts
iterFormulaCells(): IterableIterator<Cell>
```

Yield all formula cells.

### dataTableCells

```ts
get dataTableCells(): ReadonlySet<Cell>
```

### iterAnchorCellsInRange()

```ts
iterAnchorCellsInRange(range: SlimRange): IterableIterator<Cell>
```

Iterate all cells in range, except spilled cells

### getSize()

```ts
getSize(): [
    width: number,
    height: number
  ]
```

### getBounds()

```ts
getBounds(): SlimRange
```

### setColumnWidth()

```ts
setColumnWidth(column: number, width: number): void
```

- `column`: 0-based column index
- `width`: non-negative

### mergeCells()

```ts
mergeCells(rangeStr: string): void
```

Merge a range of cells. The range must span at least 2 cells and must not
overlap any existing merge.

Existing values in non-anchor cells are discarded (cleared to empty). The
anchor cell's value is left as-is; no values are moved into it.

- `rangeStr`: range in A1 notation, e.g. "A1:B2"

### unmergeCells()

```ts
unmergeCells(rangeStr: string): void
```

Unmerge cells. Any existing merge that overlaps the given range is fully
removed. If no merges overlap, this is a no-op.

- `rangeStr`: range in A1 notation, e.g. "A1:B2"

### nextValueCellByID()

```ts
nextValueCellByID(cellAddr: string, direction: string): Cell | null
```

Find the next non-blank cell in the given direction relative to the given
cell. The search ignores the cell at `cellAddr`.

- `cellAddr`: Cell which search is relative to
- `direction`: Direction relative to `cellAddr` to search in; can be 'left', 'right', 'up', 'down',
or case variations of those.

Returns: Non-blank cell or null

### nextValueCellByCoords()

```ts
nextValueCellByCoords(row: number, col: number, direction: string): Cell | null
```

Find the next non-blank cell in the given direction relative to (row, col).
The search ignores the cell at exactly (row, col).

- `row`: Row index
- `col`: Column index
- `direction`: Direction relative to (row, col) to search in; can be 'left', 'right', 'up', 'down',
or case variations of those.

Returns: Non-blank cell or null

### nextBoundaryByID()

```ts
nextBoundaryByID(cellAddr: string, direction: string): CellBoundary | null
```

Find the next boundary between an empty and non empty cell in the given
direction relative to the given cell.

- `cellAddr`: Cell which search is relative to
- `direction`: Direction relative to `cellAddr` to search in; can be 'left', 'right', 'up', 'down',
or case variations of those.

### nextBoundaryByCoords()

```ts
nextBoundaryByCoords(row: number, col: number, direction: string): CellBoundary | null
```

Find the next boundary between an empty and non empty cell in the given
direction relative to (row, col).

- `direction`: Direction relative to (row, col) to search in; can be 'left', 'right', 'up', 'down',
or case variations of those.

### iterValueCellsInColumn()

```ts
iterValueCellsInColumn(columnIndex: number, maxRow?: number): Generator<Cell, void, unknown>
```

### type WorkbookOptions

```ts
type WorkbookOptions = {
  /**
   * Filename to associate with the workbook. Used by fromXLSX methods when
   * loading from binary data, since the filename cannot be inferred.
   * Should not include path, just filename with extension.
   */
  filename?: string; /** Settings for iterative calculations (nullish to disable; that's the default) */
  iterativeCalculation?: IterativeCalculationOptions;
  /**
   * Spreadsheet-engine compatibility mode, governing formula evaluation and other behaviors that differ between Excel,
   * Google Sheets, and Grid Sheets (e.g. coercion of formula results, number-format propagation, spill extents).
   * Defaults to the mode mapped from the workbook's type (`'excel'` → Excel, `'google-sheets'` → Google Sheets),
   * falling back to `MODE_GRID_SHEET` when no mapping applies. An XLSX load settles that type from the file's
   * originating application, so it is not always `'excel'`.
   */
  mode?: WorkbookMode;
  /**
   * When `true`, skip formula validation and the initial-recalc scheduling
   * during workbook construction. Useful when loading a workbook only to
   * inspect its structure (saved values stay as-is) without paying the
   * recalc cost. Defaults to `false`.
   */
  readOnly?: boolean;
  /**
   * Whether formulas should be assumed to be of array type even if not
   * accompanied by an `F` property. Set this to true in tests specs, unless
   * specifically testing implicit intersection and the like.
   * @default false
   */
  assumeArrayFormulas?: boolean;
  /**
   * Whether this workbook was loaded as an external reference from another workbook.
   * External workbooks can be replaced by "real" workbooks with the same name.
   * @default false
   */
  isExternal?: boolean;
}
```

### type WorkbookType

```ts
type WorkbookType = (typeof _WORKBOOK_TYPES)[number]
```

## interface WorkbookBody

### schema_version

```ts
schema_version?: string
```

### sheets

```ts
sheets: SheetCSF[]
```

### tables

```ts
tables?: TableCSF[]
```

### names

```ts
names?: NameCSF[]
```

### styles

```ts
styles?: CellStyle[]
```

### calculation_properties

```ts
calculation_properties?: {
    iterate: boolean;
    iterate_count: number;
    iterate_delta: number;
  }
```

### metadata

```ts
metadata?: {
    pruned_sheets?: string[];
    defects?: Record<string, string>;
  }
```

### charts

```ts
charts?: ChartCSF[]
```

## class DefinedName implements CellInterface

DefinedName object. Instances of this are stored in `Workbook._globals` and
`WorkSheet._locallyScopedNames`.

### id

```ts
id: string
```

this defined name's name

### f

```ts
f: string | null
```

formula, if any

### ft

```ts
ft: "a"
```

Formula type is always 'a' for defined names.

### new DefinedName()

```ts
constructor(orgCell: {
    f?: string;
  } | DefinedName, name?: string | null, container?: CellContainer)
```

Construct a DefinedName instance.

- `orgCell`: object to copy attributes from (all optional, this may be empty)
- `name`: the name of the defined name
- `container`

### v

```ts
get v(): FormulaValue
set v(value: MaybeBoxedFormulaValue)
```

Set the value of the defined name. If the value is a boxed value, the number format
will become the defined name's formula-assigned number format.

### valueBoxed

```ts
get valueBoxed(): MaybeBoxedFormulaValue
```

The value of the defined name. If the value has a formula-assigned number
format, the value will be a boxed value containing that number format.

### workbookKey

```ts
get workbookKey(): number
```

### sheetIndex

```ts
get sheetIndex(): number | null
```

### isInternal

```ts
get isInternal(): boolean
```

Whether this defined name is an internal implementation detail (cached formula cell or
extracted subexpression) that should not be serialized or exposed to users. See
{@link Docs.InternalDefinedNames}.

Both kinds are found by hashing their formula, so neither is ever rewritten in place.

### isExtractedSubexpression

```ts
get isExtractedSubexpression(): boolean
```

Whether this defined name contains a subexpression the optimizer hoisted out of the formulas
that repeat it, as opposed to the other internal kind, a cached formula. Extraction affects
only how those formulas evaluate; their `f` text is unchanged. See
{@link Docs.InternalDefinedNames}.

### z

```ts
get z(): string | null
```

The effective number format of the defined name. Null unless propagated
from number formats of referenced cells.

### formulaZ

```ts
get formulaZ(): string | null
```

The defined name's formula-assigned number format, if present.

### toString()

```ts
toString(): string
```

### hasValueOrFormula()

```ts
hasValueOrFormula(): boolean
```

### clear()

```ts
clear(): void
```

### isSpilled()

```ts
isSpilled(): this is Cell & {
    _spill: {
      valid: true;
    };
    F: string;
    sheetIndex: number;
  }
```

### spillWidth()

```ts
spillWidth(): number
```

### spillHeight()

```ts
spillHeight(): number
```

### isSpillAnchor()

```ts
isSpillAnchor(): boolean
```

### edit() (deprecated)

```ts
edit(cellData: JSFCellExpanded): void
```

### type RewriteFormula

```ts
type RewriteFormula = (formula: string, formulaSheet: string, formulaWorkbook: string) => string
```

A formula-rewriting transform, returned by structural-edit methods on
{@link Workbook} (move/delete/insert) so the caller can apply it to other
workbooks whose formulas may reference the affected region.

`formulaSheet` and `formulaWorkbook` are the names of the sheet and
workbook containing the formula being rewritten --- needed to attribute
unprefixed refs to the right workbook/sheet rather than the one where the
edit ran. {@link Workbook.rewriteFormulas} supplies them automatically;
direct callers must.

### type FillType

```ts
type FillType = (typeof FILL_TYPES)[number]
```

How a fill projects the seed cells into the destination, mirroring Excel's
fill-handle drag:

- `copy` --- repeat the seed without progression.
- `series` --- extend each numeric run as an arithmetic series.
- `linearTrend` / `growthTrend` --- fit a least-squares line / exponential
  and extrapolate. Only offered when a run has two or more numbers
  ({@link seedSupportsTrend}).
- `default` --- like `series`, but a single-cell plain number copies.

### const FILL_TYPES

```ts
const FILL_TYPES: readonly [
  "default",
  "copy",
  "series",
  "linearTrend",
  "growthTrend"
]
```

The {@link FillType} values, in one place for runtime validation.

### type SortKey

```ts
type SortKey = {
  /** 0-based absolute column index (not relative to the sort range). */ column: number;
  ascending?: boolean;
}
```

### type SortOptions

```ts
type SortOptions = {
  hasHeader?: boolean;
  /**
   * Skip recalculation after sorting. The caller is responsible for
   * triggering recalculation when ready (e.g. after batching multiple
   * edits).
   */
  skipRecalc?: boolean;
}
```

### type ToXLSXOptions

```ts
type ToXLSXOptions = {
  /**
   * DEFLATE compression level. Must be an integer 0-9: 0 stores uncompressed,
   * 1 is fastest, 9 is smallest. Defaults to 6 (the zlib default).
   */
  compressionLevel?: number;
}
```

### type XLSXOutputType

```ts
type XLSXOutputType = keyof XLSXOutputMap
```

Allowed values of the `outputType` argument on {@link toXLSX}.

### type Dimension

```ts
type Dimension = "row" | "col"
```

Axis along which a row/column insertion, deletion, or move operates.

### type ColumnInfo

```ts
type ColumnInfo = {
  begin: number;
  end: number;
  width: number;
  si?: number;
}
```

### type OutputBounds

```ts
type OutputBounds = {
  top: number;
  left: number;
  bottom: number;
  right: number;
}
```

A 0-based cell rectangle, both ends inclusive: rows `top`..`bottom` and columns `left`..`right`,
with `(0, 0)` being cell A1.

### type SheetEdgeBlockedReason

```ts
type SheetEdgeBlockedReason = "content" | "drawing"
```

What a {@link SheetEdgeBlockedError} refused an insert for pushing off the sheet edge:

- `content` --- a non-empty cell would be pushed past the last row/column;
- `drawing` --- a drawing (chart, image, shape) would be pushed past the last row/column.

### type SortCellsBlockedReason

```ts
type SortCellsBlockedReason = "merged-cells" | "multi-row-spill" | "spill-from-outside"
```

Why a {@link SortCellsBlockedError} refused the sort:

- `merged-cells` --- the range contains merged cells;
- `multi-row-spill` --- the range contains a spill spanning more than one row, which sorting
  rows independently would split;
- `spill-from-outside` --- a spill anchored left of the range extends into it, so its
  spilled-into cells cannot move with the sorted rows.

### type ViewSelection

```ts
type ViewSelection = {
  sheetName: string;
  activeCell: string;
  activeRanges?: string[];
}
```

A sheet's selection state under a particular workbook view.

`activeCell` is the single focused cell (always present; defaults to `'A1'`
when no selection has been set). `activeRanges` is Excel's multi-selection
--- the list of contiguous ranges that make up the selection --- and is
omitted entirely for a plain single-cell selection. When both are set,
`activeCell` must be contained within one of the entries of `activeRanges`
(Excel discards the entire `activeRanges` list otherwise).

## class WorkbookView

A single workbook view, bound to its index in `workbook.views`. Provides
access to the active sheet and per-sheet view state (selection, layout,
zoom, frozen panes).

Obtain via `workbook.views.get(index)` / `.require(index)`; do not
construct directly.

All methods throw if the view has been removed from the workbook.

```ts
const view = workbook.views.require();
view.setActiveSheetName('Inputs');
view.setSelection('Inputs', {
  activeCell: 'B5',
  activeRanges: ['B5:D10', 'F1'],
});
```

### new WorkbookView()

```ts
constructor(workbook: Workbook, index: number)
```

### index

```ts
get index(): number
```

The zero-based index of this workbook view.

### getActiveSheetName()

```ts
getActiveSheetName(): string | null
```

Name of the active sheet, or null if the stored index does not resolve
to a sheet. Returns the first sheet when not explicitly set (OOXML default).

Note: deleting a sheet does not update the stored activeSheet index, so
this may return null or the wrong sheet after a deletion.

### getActiveSheetIndex()

```ts
getActiveSheetIndex(): number
```

Index of the active sheet. Returns 0 when not explicitly set (OOXML default).

### setActiveSheetName()

```ts
setActiveSheetName(sheetName: string): void
```

Set the active sheet by name.

### getFrozenPanes()

```ts
getFrozenPanes(sheetName: string): WorksheetViewFrozenPanes | null
```

Return the frozen panes for a given sheet in this workbook view, if the sheet has them.

- `sheetName`: Name of the sheet whose frozen panes you want

Returns: A copy of the JSF frozen panes, or null if the sheet has none

### hasFrozenPanes()

```ts
hasFrozenPanes(sheetName: string): boolean
```

Returns true if the given sheet has frozen panes in this workbook view, false otherwise.

- `sheetName`: Name of the sheet you want to check for frozen panes

### freezePanes()

```ts
freezePanes(sheetName: string, panes: Omit<WorksheetViewFrozenPanes, "type"> & {
    type?: WorksheetViewFrozenPanes["type"];
  }): void
```

Freezes panes for one particular sheet in this workbook view.

- `sheetName`: Name of the sheet whose panes should be frozen
- `panes`: Details of how the sheet view's panes should be frozen

### unfreezePanes()

```ts
unfreezePanes(sheetName: string): void
```

Unfreezes panes for one particular sheet in this workbook view.

If a sheet with the given name exists but doesn't have frozen panes, this is a no-op.

- `sheetName`: Name of the sheet whose frozen panes should be removed

### getSelection()

```ts
getSelection(sheetName: string): ViewSelection
```

Returns the active cell and active ranges for a sheet.

Unlike {@link getSheetView}, `activeCell` is always present and defaults to `'A1'`.

### getSheetView()

```ts
getSheetView(sheetName: string): WorksheetView | null
```

Returns the raw stored sheet view, or null if no view entry exists.

Unlike {@link getSelection}, this doesn't include `activeCell` if it's not set on the view
explicitly.

### setSelection()

```ts
setSelection(sheetName: string, options?: {
    activeCell?: string;
    activeRanges?: string[];
  }): void
```

Sets the active cell and active ranges for a sheet. This replaces the
full selection state --- any field you omit is cleared, not preserved.
Passing `activeCell: 'A1'` (or omitting it) with no `activeRanges`
resets the selection to default.

## class ViewManager

Manages a workbook's collection of views. Access via `workbook.views`.

A view holds the active-sheet pointer and per-sheet selection / layout /
zoom state. Most workbooks have exactly one view (`get(0)`); the multi-view
model exists to support OOXML's `bookViews` collection.

Use {@link get} or {@link require} to obtain a {@link WorkbookView} bound
to a specific index, then call methods on it to read or write per-sheet
state.

```ts
const view = workbook.views.require();
view.setActiveSheetName('Summary');
view.setSelection('Summary', { activeCell: 'B2' });
```

### new ViewManager()

```ts
constructor(workbook: Workbook)
```

### get()

```ts
get(index?: number): WorkbookView | null
```

Returns the {@link WorkbookView} at the given index, or null if it does
not exist.

- `index`: - Zero-based view index. Defaults to `0` (the only view in
typical single-view workbooks).

### require()

```ts
require(index?: number): WorkbookView
```

Like {@link get}, but throws if the workbook view does not exist.

- `index`: - Zero-based view index. Defaults to `0`.

### add()

```ts
add(): WorkbookView
```

Adds a workbook view and returns it.

### remove()

```ts
remove(index: number): void
```

Removes the workbook view at the given index. Cascades to remove
matching sheet views from all sheets and decrements the workbookView
index on sheet views that referenced a higher index.
No-op if the index is out of range or negative.

### getAll()

```ts
getAll(): WorkbookView[]
```

Returns all workbook views as plain JSF view objects (defensive copies),
not {@link WorkbookView} instances. To operate on a view, use
{@link get} / {@link require} instead.

