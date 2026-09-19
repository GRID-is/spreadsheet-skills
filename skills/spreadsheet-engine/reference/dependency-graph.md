<!-- GENERATED FILE. Do not edit by hand. Regenerate with `npm run sync`. -->

# Dependency graph vertices

Generated from `@grid-is/spreadsheet-engine@17.1.0` (`dist/index.d.ts`). Every public symbol listed here exists in that version. If the installed version differs, read `node_modules/@grid-is/spreadsheet-engine/dist/index.d.ts` instead; it is the source of truth.

Identifiers for cells, names and ranges in the dependency graph, and the conversions between them and references.

## class VertexId

Base class for vertex identifiers, which unambiguously identify the vertices
for cells, ranges and defined names in a model's dependency graph.

### workbookKey

```ts
workbookKey: number
```

Key identifying a workbook in this model. Although it is numeric, the
number does not necessarily indicate its ordering in the model.

### key

```ts
key: string
```

Underlying string encoding of the identifier. Guaranteed to be identical
for two vertex ID instances that identify the same thing within a model,
and to be distinct for instances that don't.

### new VertexId()

```ts
constructor(workbookKey: number, key: string)
```

- `workbookKey`: The dependency graph key of the workbook
- `key`: The key of this vertex ID (which includes the workbook key)

### VertexId.fromKey()

```ts
static fromKey(key: string): KnownVertexId
```

Make a VertexId instance for the given key. Two calls with the same key will
return distinct but equivalent instances.

### toString()

```ts
toString(): string
```

### toRange()

```ts
toRange(): Range | null
```

Derive a bare {@link Range} for the cell or range represented by this vertex ID,
without workbook or sheet attachment.
For a vertex ID that does not represent a cell or range, this is null.

### overlaps()

```ts
overlaps(otherId: KnownVertexId): boolean
```

Check whether this vertex ID overlaps another.

### contains()

```ts
contains(otherId: KnownVertexId): boolean
```

Check whether this vertex ID fully contains another (meaning all of the
other vertex ID is within this one)

## class CellVertexId extends VertexId

Vertex ID representing a cell in a sheet.

### sheetIndex

```ts
sheetIndex: number
```

Zero-based index of the worksheet containing this cell

### rowIndex

```ts
rowIndex: number
```

Zero-based index of the row containing this cell (e.g. 4 for row 5 of C5).

### colIndex

```ts
colIndex: number
```

Zero-based index of the column containing this cell (e.g. 2 for column C of C5).

### new CellVertexId()

```ts
constructor(workbookKey: number, sheetIndex: number, rowIndex: number, colIndex: number)
```

- `workbookKey`: The dependency graph key of the workbook
- `sheetIndex`: Zero-based sheet index
- `rowIndex`: Zero-based row index
- `colIndex`: Zero-based column index

### overlaps()

```ts
overlaps(otherId: KnownVertexId): boolean
```

Check whether this range overlaps another vertex ID.

False if not the same workbook and sheet.

### toRange()

```ts
toRange(): Range
```

Derive a bare {@link Range} for the cell represented by this vertex ID,
without workbook or sheet attachment.

### topLeft()

```ts
topLeft(): CellVertexId
```

Top-left cell

Returns: `this`

### withCoordinates()

```ts
withCoordinates(x: number, y: number): CellVertexId
```

Get a cell vertex ID for the given coordinates in the same sheet as this one.

- `x`: zero-based column index
- `y`: zero-based row index

### visitCells()

```ts
visitCells(callback: CallbackWithStop<CellVertexId>, bounds?: {
    right: number;
    bottom: number;
  }): void
```

Visit this cell vertex ID with the given callback if it is within the given bounds.

- `callback`: function to call with each cell vertex ID
- `bounds`: the maximum 0-based x and y coordinates to visit. If not
specified, then all coordinates of this range vertex ID are visited.

### offset()

```ts
offset(rows: number, cols: number): CellVertexId
```

Get a cell vertex ID at the given offset from this one, in the same sheet.

- `rows`: the number of rows to offset (negative for upward offset)
- `cols`: the number of columns to offset (negative for leftward offset)

### top

```ts
get top(): number
```

Zero-based row index

### left

```ts
get left(): number
```

Zero-based column index

### bottom

```ts
get bottom(): number
```

Zero-based row index

### right

```ts
get right(): number
```

Zero-based column index

## class NameVertexId extends VertexId

Vertex ID representing a defined name.
Workbook-scoped if `sheetIndex is null`, else scoped to the given cell.

### sheetIndex

```ts
sheetIndex: number | null
```

Zero-based index of sheet, if this represents a sheet-scoped defined name

### name

```ts
name: string
```

Name, as specified when this vertex ID was constructed.
Note that vertex IDs with different casing of the name are equivalent.

### new NameVertexId()

```ts
constructor(workbookKey: number, sheetIndex: number | null, name: string)
```

- `workbookKey`: The dependency graph key of the workbook
- `sheetIndex`: Zero-based sheet index (if name is sheet-scoped, else null)
- `name`: The defined name

## class RangeVertexId extends VertexId

Vertex ID representing a range in a sheet.
Note: the range _can_ be 1x1. Such a vertex ID is still not equivalent to the
corresponding CellVertexId (though each {@link VertexId.overlaps}
and {@link VertexId.contains} the other).

### sheetIndex

```ts
sheetIndex: number
```

Zero-based index of the worksheet containing this cell

### top

```ts
top: number
```

Zero-based index of the top row of this range (1 for B2:D4)

### left

```ts
left: number
```

Zero-based index of the leftmost column of this range (1 for B2:D4)

### bottom

```ts
bottom: number
```

Zero-based index of the bottom row of this range (3 for B2:D4)

### right

```ts
right: number
```

Zero-based index of the rightmost column of this range (3 for B2:D4)

### new RangeVertexId()

```ts
constructor(workbookKey: number, sheetIndex: number, top: number, left: number, bottom: number, right: number)
```

- `workbookKey`: The dependency graph key of the workbook
- `sheetIndex`: Zero-based sheet index
- `top`: Zero-based row index
- `left`: Zero-based column index
- `bottom`: Zero-based row index
- `right`: Zero-based column index

### toRange()

```ts
toRange(): Range
```

Derive a bare {@link Range} for the range represented by this vertex ID,
without workbook or sheet attachment.

### topLeft()

```ts
topLeft(): CellVertexId
```

Get a vertex ID representing the top-left cell of this range

### bottomRight()

```ts
bottomRight(): CellVertexId
```

Get a vertex ID representing the bottom-right cell of this range

### visitCells()

```ts
visitCells(callback: CallbackWithStop<CellVertexId>, bounds?: {
    right: number;
    bottom: number;
  }): void
```

Visit a cell vertex ID representing each cell of the range represented by
this vertex ID, not exceeding the given bottom-right bounds.

- `callback`: function to call with each cell vertex ID
- `bounds`: the maximum 0-based x and y coordinates to visit. If not
specified, then all coordinates of this range vertex ID are visited.

### contains()

```ts
contains(other: KnownVertexId): boolean
```

Check whether this range fully contains another vertex ID (meaning all
cells of the other vertex ID are within this one).

False if not the same workbook and sheet.

### overlaps()

```ts
overlaps(otherId: KnownVertexId): boolean
```

Check whether this range overlaps another vertex ID (meaning at least
one cell of the other vertex ID is within this one).

False if not the same workbook and sheet.

### offset()

```ts
offset(rows: number, cols: number): RangeVertexId
```

Get a range vertex ID at the given offset from this one, in the same sheet,
with the same width and height.

- `rows`: the number of rows to offset (negative for upward offset)
- `cols`: the number of columns to offset (negative for leftward offset)

### type KnownVertexId

```ts
type KnownVertexId = CellVertexId | NameVertexId | RangeVertexId
```

Exhaustive type union for the currently-defined vertex ID classes.

## class VertexIdSet

A set specifically meant for vertex IDs. A normal set will not de-duplicate
multiple instances of vertex IDs pointing to the same location. This one does.

### new VertexIdSet()

```ts
constructor(iterable?: Iterable<T>)
```

### size

```ts
get size(): number
```

### add()

```ts
add(vertexId: T): this
```

### has()

```ts
has(vertexId: T): boolean
```

### hasWorkbook()

```ts
hasWorkbook(workbookKey: number): boolean
```

### workbookKeys()

```ts
workbookKeys(): number[]
```

### delete()

```ts
delete(vertexId: T): boolean
```

### clear()

```ts
clear(): void
```

### values()

```ts
values(): IterableIterator<T>
```

### [Symbol.iterator]()

```ts
[Symbol.iterator](): IterableIterator<T>
```

### function vertexIdToCell()

```ts
function vertexIdToCell<V extends NameVertexId | CellVertexId>(modelOrWb: Model | Workbook, vertexId: V, formulaCell?: boolean): V extends NameVertexId ? DefinedName | null : Cell | null
```

Find the cell identified by the given vertex ID, if it exists in the given model or workbook

- `modelOrWb`: a model or workbook to look in
- `vertexId`: the vertex ID to resolve to a cell
- `formulaCell`: true if the desired cell is known to be a formula cell; this may permit a quicker lookup

### function vertexIdToReference()

```ts
function vertexIdToReference(model: Model, vertexId: KnownVertexId, includeWorkbook?: boolean): Reference | null
```

- `model`: the model (for looking up workbook and sheet names)
- `vertexId`: the vertex ID to convert
- `includeWorkbook`: false to omit the workbook prefix; default true

### function referenceToVertexId()

```ts
function referenceToVertexId(model: Model, reference: Reference, allowNewName?: boolean): KnownVertexId
```

Find the dependency-graph vertex that a reference denotes, resolving it exactly as evaluating
the same reference in the same place would.

A vertex is keyed to one workbook, and its sheet index means nothing outside that workbook, so
the workbook has to be settled before the sheet is. Two things can settle it:

- an explicit prefix, which is authoritative: `[w.xlsx]name` and `[w.xlsx]Sheet1!A1` are that
  workbook's, and nothing about where the reference sits alters that. A bare sheet prefix,
  `Sheet1!A1`, names a sheet of the context workbook, except in Grid Sheets mode, where a sheet
  the context workbook does not have is looked for across the model and settles the workbook.
- the reference's context (`reference.ctx`), which is a mere default: the workbook the formula
  sits in, and where an unprefixed reference is looked for first. An unprefixed name may still
  end up in another workbook, but only in Grid Sheets mode and only by not being found in this
  one; a like-named sheet elsewhere in the model never claims it. With no context workbook the
  model's first workbook stands in.

An unprefixed name is offered to the sheet the formula sits on before the workbook's global
scope, and takes that sheet's scope if it owns the name.

- `model`: the model to resolve names in
- `reference`: the reference to convert
- `allowNewName`: true to return a vertex for a name that no workbook defines, rather
than throw; for creating a defined name

