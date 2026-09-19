<!-- GENERATED FILE. Do not edit by hand. Regenerate with `npm run sync`. -->

# Styles, number formats, comments, notes, tables, themes

Generated from `@grid-is/spreadsheet-engine@17.1.0` (`dist/index.d.ts`). Every public symbol listed here exists in that version. If the installed version differs, read `node_modules/@grid-is/spreadsheet-engine/dist/index.d.ts` instead; it is the source of truth.

Cell formatting is read through `cell.style` and written with `Workbook.editCell` (the `s` field) or the managers below. Threaded comments, legacy notes, Excel tables and the workbook theme each have a manager on the workbook.

## interface CellStyle

### "font-name"

```ts
"font-name"?: string
```

### "font-size"

```ts
"font-size"?: number
```

### "font-color"

```ts
"font-color"?: string
```

### bold

```ts
bold?: boolean
```

### italic

```ts
italic?: boolean
```

### underline

```ts
underline?: CSFUnderlineStyle
```

### "fill-color"

```ts
"fill-color"?: string
```

### "border-left-style"

```ts
"border-left-style"?: BorderStyle
```

### "border-left-color"

```ts
"border-left-color"?: string
```

### "border-right-style"

```ts
"border-right-style"?: BorderStyle
```

### "border-right-color"

```ts
"border-right-color"?: string
```

### "border-top-style"

```ts
"border-top-style"?: BorderStyle
```

### "border-top-color"

```ts
"border-top-color"?: string
```

### "border-bottom-style"

```ts
"border-bottom-style"?: BorderStyle
```

### "border-bottom-color"

```ts
"border-bottom-color"?: string
```

### "horizontal-alignment"

```ts
"horizontal-alignment"?: "general" | "left" | "center" | "right" | "fill" | "justify" | "centerContinuous" | "distributed"
```

### "vertical-alignment"

```ts
"vertical-alignment"?: "bottom" | "top" | "center" | "justify" | "distributed"
```

### "wrap-text"

```ts
"wrap-text"?: boolean
```

### "shrink-to-fit"

```ts
"shrink-to-fit"?: boolean
```

### "number-format"

```ts
"number-format"?: string
```

### "number-format-from-formula"

```ts
"number-format-from-formula"?: string
```

## class StyleManager

Manages a workbook's styles array with efficient deduplication.

This class stores complete styles including number format properties.
Cell objects can override these formats using their userZ/formulaZ properties.

The cache uses property-based keys (sorted properties + values) rather than JSON.stringify
to ensure deterministic hashing regardless of property insertion order.

A separate collection of {@link NamedStyle}s is exposed via {@link named}.

### named

```ts
readonly named: NamedStyles
```

Named-style CRUD. See {@link NamedStyles}.

### new StyleManager()

```ts
constructor(initialStyles?: StyleRelaxed[], initialNamedStyles?: Record<string, NamedStyle>)
```

Create a new StyleManager.

Styles index 0 is the workbook DEFAULT style (XLSX cellXf 0, ECMA-376
18.8.10): what every cell without an explicit `s` reference displays as.
When no initial styles are given (a workbook built from scratch), slot 0
is seeded with the empty default style `{}` so that {@link findOrCreate}
can never hand index 0 to the first non-default style anything creates.
When initial styles are given (a loaded workbook), `styles[0]` is the
file's own default and is left untouched.

- `initialStyles`: - Optional array of styles to initialize the anonymous pool with. The
dedup cache is pre-populated.
- `initialNamedStyles`: - Optional map of named styles keyed by name. Each Record key must
match its entry's `ns.name` (case-insensitively) and must be unique case-insensitively;
mismatches and duplicates are rejected. Keys are normalised to lowercase internally; the
original casing is preserved on each `NamedStyle.name`.

### get()

```ts
get(index: number): StyleRelaxed | null
```

Get a style by its index.

- `index`: Zero-based index into the styles array

Returns: The style object, or null if the index is out of bounds

### defaultStyle

```ts
get defaultStyle(): StyleRelaxed
```

The workbook default style: the style at index 0, which every cell without
an explicit `s` reference displays as (XLSX cellXf 0, ECMA-376 18.8.10),
including the workbook default font. Returns a fresh deep copy on every
read --- the stored object also backs the dedup cache, so mutating it
would desync `findOrCreate`.

### setDefaultStyle()

```ts
setDefaultStyle(style: StyleRelaxed): void
```

Replace the workbook default style (index 0) in place.

This is workbook-wide: it changes the appearance of every cell without an
explicit style reference. The dedup cache is rebuilt so `findOrCreate` of
the new default returns 0 and the old default no longer resolves to it.

The default style may not carry `extendsStyle`; a workbook default cannot
inherit from a named style.

A deep copy of `style` is stored, so later caller-side mutation of the
passed object cannot desync the dedup cache.

- `style`: - The new default style.

### findOrCreate()

```ts
findOrCreate(style: StyleRelaxed): number
```

Find an existing style or create a new one.

This method first checks the cache for an exact match. If found, returns the existing
style's index. If not found, appends the style to the array, updates the cache, and
returns the new index.

`style.extendsStyle` is canonicalized to the casing registered on the
named style before the cache lookup, so two references that differ only
in case dedupe to the same list entry.

- `style`: - The style object to find or create

Returns: The index of the style in the styles array

### toArray()

```ts
toArray(): readonly StyleRelaxed[]
```

Get a list of all defined styles.

Returns the internal array, typed as readonly to prohibit external code from modifying the array
without updating the cache.

Returns: Readonly array of styles

### length

```ts
get length(): number
```

Get the number of styles in the array.

## class NamedStyles

Named-style CRUD, accessible via `styleManager.named`.

Named styles live alongside the anonymous style pool on the same
{@link StyleManager}. Anonymous styles may inherit from them via
{@link Style.extendsStyle}, which is stored as an opaque pointer
(resolution of inherited properties is the view layer's concern).

Storage of the named-style map is owned by this class. Mutations that
affect anonymous styles (delete, rename) call back into the owning
{@link StyleManager} to rewrite `extendsStyle` pointers and rebuild the
dedup cache.

Note the asymmetry on names that don't exist: {@link delete} returns
`false` (idempotent, deleting nothing still yields the requested
post-state, "the entry does not exist"), while {@link rename} throws
(a rename of a non-existent source has no defined target, so more
likely to be a mistake on the part of the caller).

```ts
const styles = styleManager.named;
styles.add({ name: 'Heading', bold: true, fontSize: 14 });
styles.update('Heading', { color: { type: 'srgb', value: '4472C4' } });
const { cascadedTo } = styles.rename('Heading', 'Title');
styles.delete('Title');
```

### get()

```ts
get(name: string): NamedStyle | null
```

Look up a named style by name (case-insensitive).
Returns `null` if no style with that name exists.

### has()

```ts
has(name: string): boolean
```

Whether a named style with this name exists (case-insensitive).

### getAll()

```ts
getAll(): NamedStyle[]
```

Return all named styles in insertion order.

### toRecord()

```ts
toRecord(): Record<string, NamedStyle>
```

Return all named styles as a JSF-shaped record keyed by name.

### size

```ts
get size(): number
```

The number of named styles.

### add()

```ts
add(style: NamedStyle): NamedStyle
```

Register a new named style.

- `style`: - The named style to register. `style.name` must be non-empty and unique under
case-insensitive comparison; `style.extendsStyle` must be absent (named styles cannot
extend other named styles).

### update()

```ts
update(name: string, patch: NamedStylePatch): NamedStyle
```

Update properties on a named style in place. The stored `name` is untouched (use
{@link rename} to change it); `extendsStyle` is rejected for the same reason it is rejected
by {@link add} (named styles cannot extend other named styles).

Does not touch the anonymous style pool: `extendsStyle` pointers there continue to resolve
to the same named style, just with different properties.

- `name`: - Name of the style to update (case-insensitive). A named style with this name
must exist.
- `patch`: - Properties to merge into the stored style. `name` and `extendsStyle` on the
patch are rejected; all other fields are applied verbatim. Passing `null` or `undefined`
for a property removes that property from the stored style (so a subsequent
`toRecord()`/JSF export omits the key entirely rather than emitting a nullish value).

Returns: The updated named style.

### delete()

```ts
delete(name: string): NamedStyleDeleteResult
```

Remove a named style. Any anonymous styles that inherited from it (via
`extendsStyle`) have that field cleared.

- `name`: - Name of the style to remove (case-insensitive).

Returns: A {@link NamedStyleDeleteResult} describing what was removed and how many pool
entries had their `extendsStyle` cleared.

### rename()

```ts
rename(oldName: string, newName: string): NamedStyleRenameResult
```

Rename a named style. Any styles in the anonymous pool that inherited
from the old name have their `extendsStyle` rewritten to the new name.

- `oldName`: - The current name of the style to rename (case-insensitive). A named style
with this name must exist.
- `newName`: - The new name. Must be non-empty and must not already be in use by a
different named style (case-insensitive).

Returns: A {@link NamedStyleRenameResult} describing how many pool entries had their
`extendsStyle` rewritten to the new name.

### [Symbol.iterator]()

```ts
[Symbol.iterator](): IterableIterator<NamedStyle>
```

### type NamedStyleDeleteResult

```ts
type NamedStyleDeleteResult = {
  /** `true` if a named style was found and removed, `false` otherwise. */ removed: boolean;
  /**
   * Number of anonymous styles whose `extendsStyle` was cleared as a consequence of the
   * delete. Always `0` when `removed` is `false`.
   */
  cascadedTo: number;
}
```

Result of {@link NamedStyles.delete}. The `cascadedTo` count reports how
many anonymous styles lost their `extendsStyle` pointer as part of the
delete; those styles keep their own properties but no longer inherit from
the removed named style.

### type NamedStyleRenameResult

```ts
type NamedStyleRenameResult = {
  /**
   * Number of anonymous styles whose `extendsStyle` was rewritten to the new name.
   */
  cascadedTo: number;
}
```

Result of {@link NamedStyles.rename}. The `cascadedTo` count reports how
many anonymous styles had their `extendsStyle` pointer rewritten to the
new name, so their inheritance chain stays intact.

## class ThemeManager

Manages a workbook's theme, allowing users to get and set its properties.

### isDefault

```ts
isDefault: boolean
```

`true` when this `ThemeManager` was created without an explicit theme, so
the Office default was substituted. Flipped to `false` by any of the
setter methods (`set`, `setColorScheme`, `setMajorFont`, `setMinorFont`,
`addCustomColor`, `removeCustomColor`).

### new ThemeManager()

```ts
constructor(theme?: Theme)
```

### get()

```ts
get(): Readonly<Theme>
```

Returns the current theme.

### set()

```ts
set(theme: Theme): void
```

Sets the current theme.

This will replace any existing theme in its entirety. If you only want to replace parts of a
theme, try {@link ThemeManager.setMajorFont}, {@link ThemeManager.setMinorFont},
{@link ThemeManager.setColorScheme}, {@link ThemeManager.addCustomColor}, or
{@link ThemeManager.removeCustomColor}.

Sets {@link isDefault} to `false`.

```ts
// Copy the theme from another workbook.
workbook.theme.set(otherWorkbook.theme.get());
```

### getColorScheme()

```ts
getColorScheme(): Readonly<ThemeColorScheme>
```

Returns the current theme's colour scheme.

A colour scheme acts as a colour palette for your workbook. It includes a twelve colours such
as `accent1`, `dk2`, and `hlink`.

### setColorScheme()

```ts
setColorScheme(scheme: ThemeColorScheme): void
```

Sets the current theme's colour scheme.

### getMajorFont()

```ts
getMajorFont(): Readonly<ThemeFontCollection>
```

Returns the current theme's major font collection.

A major font collection is commonly used for headings and other prominent text in a workbook.
Use the theme's minor font collection for body text.

### setMajorFont()

```ts
setMajorFont(font: ThemeFontCollection): void
```

Sets the current theme's major font collection.

### getMinorFont()

```ts
getMinorFont(): Readonly<ThemeFontCollection>
```

Returns the current theme's minor font collection.

A minor font collection is commonly used for body text of a workbook. Use the theme's major
font collection for headings and other prominent text.

### setMinorFont()

```ts
setMinorFont(font: ThemeFontCollection): void
```

Sets the current theme's minor font collection.

### getCustomColors()

```ts
getCustomColors(): readonly ThemeCustomColor[]
```

Returns the current theme's custom colours.

Custom colours are user-defined colours that can be used in a workbook. They are not part of
the theme's colour scheme, but they can be used in a workbook alongside those colours.

### addCustomColor()

```ts
addCustomColor(color: ThemeCustomColor): void
```

Adds a custom colour to the current theme.

### removeCustomColor()

```ts
removeCustomColor(index: number): void
```

Removes a custom colour from the current theme by its index.

## class CommentsManager

Manages threaded comments on a workbook's sheets. Access via
`workbook.comments`.

Threaded comments are the modern Excel comments feature: each comment is
anchored to a cell, has a single author, and can be marked resolved.
The cell-anchored older "notes" feature is handled separately by
{@link NotesManager} (`workbook.notes`).

`get*` methods return defensive copies, so mutating the returned objects
does not affect the workbook's stored state --- changes must go through
`update` / `delete` to take effect.

### new CommentsManager()

```ts
constructor(workbook: Workbook)
```

### add()

```ts
add(sheetName: string, comment: AddCommentInput): ThreadedComment
```

Add a new threaded comment to the given sheet.
The comment's `person` (and any mentioned persons in `runs`) are
auto-registered into the workbook's `people` list if not already present.

Returns: the created ThreadedComment

### get()

```ts
get(sheetName: string, options?: FilterOptions): ThreadedComment[]
```

Get all comments on the given sheet.

Copies are returned to prevent external mutation of the sheet's comments.

- `sheetName`: name of the sheet
- `options`: filtering options
- `options.excludeReplies`: When `true`, excludes reply comments.
- `options.excludeResolved`: When `true`, excludes resolved comments and their replies.

### getByCell()

```ts
getByCell(sheetName: string, ref: string, options?: FilterOptions): ThreadedComment[]
```

Get comments attached to a specific cell on the given sheet.

- `sheetName`: name of the sheet
- `ref`: cell reference in A1 notation
- `options`: same filtering as get()

Returns: array of comments for that cell (defensive copies)

### update()

```ts
update(sheetName: string, id: string, updates: Partial<Pick<ThreadedComment, "text" | "resolved" | "runs">>): void
```

Update an existing threaded comment on the given sheet.
Note: `ref` is not updatable through this API; cell moves are
handled by updateAnnotationRefs.

### delete()

```ts
delete(sheetName: string, id: string): void
```

Delete a comment and all its replies from the given sheet.

## class NotesManager

Manages cell notes (the legacy "comments" feature in older Excel versions,
still present alongside threaded comments in the JSF / OOXML formats) on a
workbook's sheets. Access via `workbook.notes`.

Notes are stored on individual cells; a sheet may have at most one note
per cell. `get*` methods return defensive copies, so mutating the result
does not affect the workbook's stored state --- changes must go through
`update` / `delete` to take effect.

### new NotesManager()

```ts
constructor(workbook: Workbook)
```

### add()

```ts
add(sheetName: string, note: Note): Note
```

Add a new note to a cell on the given sheet.

Returns: the created Note (defensive copy)

### get()

```ts
get(sheetName: string): Note[]
```

Get all notes on the given sheet.

Copies are returned to prevent external mutation of the sheet's notes.

- `sheetName`: name of the sheet

### getByCell()

```ts
getByCell(sheetName: string, ref: string): Note | undefined
```

Get the note attached to a specific cell on the given sheet.

- `sheetName`: name of the sheet
- `ref`: cell reference in A1 notation

Returns: the note (defensive copy) or `undefined` if no note exists

### update()

```ts
update(sheetName: string, ref: string, updates: Partial<Pick<Note, "text" | "author">>): void
```

Update an existing note on the given sheet.
Only provided fields are updated; omitted fields are left unchanged.
`ref` itself is not changed by this API; cell moves are handled by
updateAnnotationRefs.

### delete()

```ts
delete(sheetName: string, ref: string): void
```

Delete a note from the given sheet.

### type AddCommentInput

```ts
type AddCommentInput = Omit<ThreadedComment, "id" | "personId" | "runs"> & {
  person: Person;
  runs?: (MentionRunInput | HyperlinkTextRun)[];
}
```

Input for creating a threaded comment via {@link CommentsManager.add}.

Accepts `ref`, `text`, `person`, and optionally `parentId`, `datetime`,
`resolved`, and `runs` (with inline person objects for mentions).

## class TableManager implements TableHost

Manages every {@link Table} in a workbook. Access via `workbook.tables`.

Provides table-level CRUD (`get`, `getAll`, `add`, `delete`) and keeps
table refs and structured references consistent when the underlying sheet
geometry changes (row/column insertion or deletion).

Table names share a namespace with defined names: a name that is already
in use as a defined name cannot be used for a table, and vice versa.

### new TableManager()

```ts
constructor(workbook: Workbook)
```

### adjustTableRefsForRowShift()

```ts
adjustTableRefsForRowShift(sheetName: string, atRow: number, count: number, options?: {
    leftCol?: number;
    rightCol?: number;
    exclude?: Table;
  }): boolean
```

Adjust table refs after rows are inserted or deleted on a sheet.

- `atRow`: 0-based row where the structural edit starts
- `count`: Positive for insertion (shift down), negative for deletion
(rows `atRow..atRow+|count|-1` removed, remaining shift up).
- `options.leftCol`: / rightCol  When provided, only tables whose
columns are fully contained within [leftCol, rightCol] are affected
(for column-scoped shifts such as Table.insertRow). Tables that only
partially overlap are skipped to avoid misaligning their non-shifted
columns.
- `options.exclude`: A table to skip (the one performing the edit).

Returns: true if any table's ref was adjusted or any table was removed,
in which case a recalculation is in order.

### adjustTableForRowEdit()

```ts
adjustTableForRowEdit(table: Table, atRow: number, count: number): boolean
```

Adjust one table's ref after rows are inserted or deleted on its sheet,
shrinking its header/totals row counts when a deletion overlaps them and
removing the table when the deletion swallows it entirely.

- `atRow`: 0-based row where the structural edit starts
- `count`: Positive for insertion, negative for deletion.

Returns: true if the table's ref was adjusted or the table was removed.

### adjustTableRefsForMove()

```ts
adjustTableRefsForMove(fromRef: A1Reference, toRef: A1Reference): void
```

After a moveCells operation, update the refs of any tables that were
fully contained within the source range. Tables only partially
overlapping the source, or at the destination, are not affected ---
matching Excel's behavior.

### adjustTableRefsForRowMove()

```ts
adjustTableRefsForRowMove(sheetName: string, from: number, to: number, count: number): void
```

Adjust table refs after a reorderRows operation. The three-step
insert/move/delete sequence in reorderRowsOrColumns has already moved
cells; this adjusts table refs to match the net effect:

- Tables fully within the source `[from, from+count)` move by `to − from`.
- Tables fully within the displaced range shift by `±count`.
- Partially overlapping tables are left unchanged.

- `from`: 0-based index of the first row that was moved
- `to`: 0-based index where the first row ended up
- `count`: number of rows moved

### adjustTableRefsForColMove()

```ts
adjustTableRefsForColMove(sheetName: string, from: number, to: number, count: number): void
```

Adjust table refs after a reorderColumns operation. Column-axis mirror
of {@link adjustTableRefsForRowMove}.

### adjustTableRefsForColShift()

```ts
adjustTableRefsForColShift(sheetName: string, atCol: number, count: number): boolean
```

Adjust table refs (and column definitions) after columns are inserted
or deleted on a sheet. Mirrors adjustTableRefsForRowShift but along
the column axis.

- `atCol`: 0-based column where the edit starts
- `count`: Positive for insertion, negative for deletion.

Returns: true if any table's ref was adjusted or any table was removed,
in which case a recalculation is in order.

### adjustTableForColEdit()

```ts
adjustTableForColEdit(table: Table, atCol: number, count: number): boolean
```

Adjust one table's ref and column definitions after columns are inserted
or deleted on its sheet, adding default-named columns when an insertion
expands the table, dropping column definitions when a deletion overlaps
it, and removing the table when the deletion swallows it entirely.

- `atCol`: 0-based column where the structural edit starts
- `count`: Positive for insertion, negative for deletion.

Returns: true if the table's ref was adjusted or the table was removed.

### get()

```ts
get(name: string): Table | null
```

Look up a table by name (case-insensitive).

### getAll()

```ts
getAll(): Table[]
```

Return all tables in the workbook.

### getIntersecting()

```ts
getIntersecting(sheetName: string, range: SlimRange): Table[]
```

Return the tables on `sheetName` whose range intersects `range`.

### [Symbol.iterator]()

```ts
[Symbol.iterator](): IterableIterator<Table>
```

### add()

```ts
add(jsfTable: Table): Table
```

Create and register a new table from a JSF table definition.
Throws on validation failure (invalid name, invalid ref, name collision).

### delete()

```ts
delete(name: string, options?: {
    clearData?: boolean;
  }): boolean
```

Remove a table by name. Returns false if the table does not exist.
By default only the table definition is removed; cell data is left intact.
Pass `{ clearData: true }` to also clear cell contents in the table's range.

## class Table

An Excel-style structured table: a named, rectangular range with named
columns, an optional header row, and an optional totals row, against which
structured references (`Table[Column]`, `Table[#Headers]`, etc.) resolve.

Obtain an existing `Table` instance via `workbook.tables.get(name)`,
or create a new one by passing a JSF table definition to
`workbook.tables.add()`; do not instantiate this class directly.

Row-modifying methods ({@link appendRow}, {@link insertRow}) defer
recalculation: after calling them the caller must run
`model.recalculate(ALL_FORMULA_CELLS)` for structured references like
`=SUM(Table[Column])` to pick up the new row.

### new Table()

```ts
constructor(jsf: Table, ref: A1Reference, host: TableHost)
```

### name

```ts
get name(): string
```

### ref

```ts
get ref(): string
```

### totalsRowCount

```ts
get totalsRowCount(): number
```

### headerRowCount

```ts
get headerRowCount(): number
```

### sheetName

```ts
get sheetName(): string
```

### style

```ts
get style(): TableStyle | undefined
```

The table's visual style, or `undefined` when the table has none.
Returns a fresh deep copy on every read.

### dataRowCount

```ts
get dataRowCount(): number
```

Number of data rows (excludes header and totals).

### appendRow()

```ts
appendRow(values?: CellValue[]): number
```

Append a data row to the table: shifts cells within the table's column
range, expands the table ref, and writes the supplied cell values
(blanking any unset columns within the table width).

Uses column-scoped `moveCells` rather than full-row `insertRows` so
that sibling tables on the same sheet in non-overlapping columns are
not affected.

Recalculation is deferred: the caller must call
`model.recalculate(ALL_FORMULA_CELLS)` afterward. A full recalc
(not incremental) is needed because the dependency graph does not
yet have edges for the newly expanded table range, so structured
references like `=SUM(Table[Column])` will not update incrementally.

- `values`: A single row of cell values, e.g. ['Alice', 95000]

Returns: Zero-based index of the newly added row within the data body

### insertRow()

```ts
insertRow(index: number, values?: CellValue[]): number
```

Insert a data row at the given position within the data body.
Shifts existing rows down.

Recalculation is deferred: the caller must call
`model.recalculate(ALL_FORMULA_CELLS)` afterward. See
{@link appendRow} for why a full recalc is needed.

- `index`: Zero-based position within the data body
- `values`: A single row of cell values

Returns: The data row index that was passed in

### rename()

```ts
rename(newName: string): void
```

Rename this table and rewrite all structured references in formulas.

### containsCoords()

```ts
containsCoords(row: number, column: number): boolean
```

### wholeTable()

```ts
wholeTable(whichRows: WhichRows): Reference | FormulaError
```

### rowRef()

```ts
rowRef(dataRowIndex: number): Reference | FormulaError
```

Get a single data row as a Reference covering all columns.

### column()

```ts
column(name: string, include: WhichRows): Reference | FormulaError
```

### columnRange()

```ts
columnRange(from: string, to: string, include: WhichRows): Reference | FormulaError
```

