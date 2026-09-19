<!-- GENERATED FILE. Do not edit by hand. Regenerate with `npm run sync`. -->

# Cells, values and references

Generated from `@grid-is/spreadsheet-engine@17.1.0` (`dist/index.d.ts`). Every public symbol listed here exists in that version. If the installed version differs, read `node_modules/@grid-is/spreadsheet-engine/dist/index.d.ts` instead; it is the source of truth.

The shape of a cell as returned by `readCell` and `readCells`, the value types formulas produce, and the helpers for A1 references and coordinates.

## class Cell implements CellInterface

Cell object. Instances of this are stored in the `cell` map of each sheet of each Workbook.

### id

```ts
id: string
```

this cell's address ID in A1 format (unprefixed)

### f

```ts
f: string | null
```

formula, if any

### ft

```ts
ft?: "a" | null
```

Formula type, 'a' for array formula, absent for single-cell formula.

### M

```ts
M: string | null
```

top-left anchor cell-id of merge-area if cell is merge

### dataTable

```ts
dataTable: DataTable | null
```

Data table metadata, set only on the anchor cell of the data table range.

### z

```ts
z: string | null
```

The effective number format of the cell (cached).
Updated automatically when style or value changes.

### new Cell()

```ts
constructor(orgCell: CellData | Cell, id?: string | null, container?: CellContainer)
```

Construct a Cell instance.

- `orgCell`: object to copy attributes from (all optional, this may be empty)
- `id`: unqualified address in A1 format
- `container`

### v

```ts
get v(): CellValue
set v(value: MaybeBoxed<CellValue>)
```

Set the value of the cell. If the value is a boxed value, the number format
will become the cell's formula-assigned number format.

### valueBoxed

```ts
get valueBoxed(): MaybeBoxed<CellValue>
```

The value of the cell. If the cell's value has a formula-assigned number
format, the value will be a boxed value containing that number format.

### rowIndex

```ts
get rowIndex(): number
```

### colIndex

```ts
get colIndex(): number
```

### workbookKey

```ts
get workbookKey(): number
```

### sheetIndex

```ts
get sheetIndex(): number
```

### formulaZ

```ts
get formulaZ(): string | null
```

The cell's formula-assigned number format (read-only accessor).
Returns the number format from the boxed value metadata if present.

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

### style

```ts
get style(): StyleRelaxed | null
set style(newStyle: StyleRelaxed | null)
```

The cell's style object containing formatting properties like fonts, colors, borders, and number formats.

**Migration note**: This property was previously named `s`. Code accessing `cell.s` should
be updated to use `cell.style` instead.

**Related properties**:
- `z` (getter/setter) - Convenience shortcut for `style.numberFormat`
- `zf` - Convenience shortcut for `style.numberFormatFromFormula` (read-only via getter, can be set via constructor)

The setter accepts either:
- A `StyleRelaxed` object (will be deduplicated and stored by index)
- A numeric style index (for efficiency when you already have the index)
- `null` (to clear the style)

```typescript
// Set a style object
cell.style = { color: '#FF0000', bold: true };

// Clear the style
cell.style = null;

// Use the convenience properties
cell.z = '@';  // Sets style.numberFormat
```

### href

```ts
get href(): CellAttrs["href"] | null
set href(href: CellAttrs["href"] | null)
```

### hrefFromFormula

```ts
get hrefFromFormula(): string | null
set hrefFromFormula(url: CellAttrs["hrefFromFormula"] | null)
```

Hyperlink URL derived from HYPERLINK() formula evaluation (ephemeral).

### F

```ts
get F(): string | null
```

### edit() (deprecated)

```ts
edit(cellData: CellData): void
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

Is part of a spilled range.

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

## interface CellInterface

Common interface for cell-like objects (Cell and DefinedName).
Defines the shared properties and methods between cells in sheets
and defined names.

### id

```ts
id: string
```

this cell's address ID in A1 format (unprefixed), or defined name

### f

```ts
f: string | null
```

formula, if any

### ft

```ts
ft?: "a" | null
```

Formula type, 'a' for array formula, absent for single-cell formula.

### v

```ts
get v(): FormulaValue | CellValue
set v(value: MaybeBoxedFormulaValue)
```

### valueBoxed

```ts
get valueBoxed(): MaybeBoxedFormulaValue
```

The value of the cell. If the cell's value has a formula-assigned number
format, the value will be a boxed value containing that number format.

### workbookKey

```ts
get workbookKey(): number
```

### sheetIndex

```ts
get sheetIndex(): number | null
```

### edit() (deprecated)

```ts
edit(cellData: JSFCellExpanded): void
```

### z

```ts
get z(): string | null
```

The effective number format of the cell.

The effective number format is the user-assigned number format, if present.
Otherwise, it is the formula-assigned number format.

### formulaZ

```ts
get formulaZ(): string | null
```

The cell's formula-assigned number format, if present.

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

### type CellData

```ts
type CellData = JSFCellExpanded & {
  /** User-assigned number format (convenience shortcut for style.numberFormat) */ z?: string | null; /** Formula-assigned number format (convenience shortcut for style.numberFormatFromFormula) */
  zf?: string | null; /** Formula type: `'a'` for array formula */
  ft?: "a" | null;
}
```

Extended cell data type that includes z/zf for backwards compatibility.
These properties are convenience shortcuts specifying number formats directly in cell data.

### type CellItem

```ts
type CellItem = Cell | DefinedName
```

Type alias representing either a Cell or DefinedName.
Most code should migrate to using explicit Cell or DefinedName types,
but this type is useful for functions that can handle both.

### type CellValue

```ts
type CellValue = string | number | boolean | FormulaError | null
```

### type CellValueAtom

```ts
type CellValueAtom = Exclude<CellValue, FormulaError | null>
```

A cell value known not to be an error or blank

### type FormulaValue

```ts
type FormulaValue = ArrayValue | Reference | Matrix
```

A value that can result from a spreadsheet formula, known not to be boxed

### type FormulaArgument

```ts
type FormulaArgument = FormulaValue | undefined
```

Any FormulaValue, or undefined to mean missing

### type NonMatrixFormulaArgument

```ts
type NonMatrixFormulaArgument = Exclude<FormulaArgument, Matrix>
```

any FormulaValue except Matrix, or undefined to mean missing.

### type ArrayValue

```ts
type ArrayValue = CellValue | Lambda
```

Values that can be stored inside arrays

## class ValueBox

### new ValueBox()

```ts
constructor(value: T, metadata: ValueBoxMetadata | null | undefined)
```

### value

```ts
get value(): T
```

### metadata

```ts
get metadata(): ValueBoxMetadata
```

### map()

```ts
map<U extends ArrayValue, R extends U | Reference | Matrix | undefined>(transformFunc: (value: T) => R): R extends U ? MaybeBoxed<U> : MaybeBoxed<U> | Reference | Matrix | undefined
```

### toString()

```ts
toString(): string
```

### ValueBox.fromValue()

```ts
static fromValue<U extends ArrayValue, V extends MaybeBoxed<U> | Reference | Matrix | undefined>(value: V, metadata?: ValueBoxMetadata): V extends MaybeBoxed<U> ? ValueBox<U> : ValueBox<U> | Reference | Matrix | undefined
```

### type MaybeBoxed

```ts
type MaybeBoxed<T extends ArrayValue> = ValueBox<T> | T
```

### type MaybeBoxedFormulaValue

```ts
type MaybeBoxedFormulaValue = MaybeBoxed<ArrayValue> | Reference | Matrix
```

A value that can result from a spreadsheet formula, possibly boxed

### type MaybeBoxedFormulaArgument

```ts
type MaybeBoxedFormulaArgument = MaybeBoxedFormulaValue | undefined
```

Any MaybeBoxedFormulaValue, or undefined to mean missing

### function isBoxed()

```ts
function isBoxed<T extends ArrayValue>(value: MaybeBoxed<T> | unknown): value is ValueBox<T>
```

### function unbox()

```ts
function unbox<U extends ArrayValue, T extends MaybeBoxed<U> | unknown>(value: UnboxArg<T>): Unbox<T>
```

### function isCellValue()

```ts
function isCellValue(d: any): d is MaybeBoxed<CellValue>
```

### function isMatrix()

```ts
function isMatrix(d: any): d is Matrix
```

## class Matrix

Representation of a rectangle of (maybe boxed) cell values.
For the purposes of compact representation of a common redundancy structure,
the rectangle should be thought of as consisting of four quadrants whose
contents are specified as follows:
- the top-left quadrant is arbitrary data, specified with a dense array of
  dense arrays of `MaybeBoxed<ArrayValue>`, each array representing one row of
  that quadrant, all arrays having the same length.
- the bottom-right quadrant has the same value in all its elements
- the top-right quadrant either has the same value as the bottom-right
  quadrant in all its elements (if `_defaultColumn` is empty), or else
  consists of constant-value rows, i.e. each row has a single value repeating
  in all its elements (but this value can differ between rows)
- the bottom-left quadrant likewise either has the same value as the
  bottom-right quadrant in all its elements (if `_defaultRow` is empty), or
  else consists of constant-value columns, i.e. each column has a single
  value repeating in all its elements (but this value can differ between
  columns)

The `populatedHeight` and `populatedWidth` properties specify the dimensions
of the top left quadrant, and `width` and `height` then specify the remaining
quadrants, so if `populatedHeight === height`, then the bottom quadrants
are empty, and if `populatedWidth === width`, then the rightmost quadrants
are empty.

### shrink()

```ts
shrink(): void
```

Shrink the _data property (populated top-left quadrant) if possible, by
pruning away bottommost rows and rightmost columns in which all elements
are exactly equal to _defaultValue. If the matrix starts out fully
populated (i.e. has only a top-left quadrant, no defaulted quadrants),
then first check whether the bottom row (if tall) or rightmost column (if
wide) is all the same value, and if so, set _defaultValue to that.

### new Matrix()

```ts
constructor(width?: number, height?: number, defaultValue?: MaybeBoxed<ArrayValue>)
```

Construct a new `Matrix` with a given width and height and default value,
and `populatedHeight` and `populatedWidth` of 0.
The default value applies at any coordinates to the right of, and/or
downwards of, the largest X and Y coordinates for which a value has been
set, with `.set` or `.setData`. Within the range (0,0) to
(populatedWidth, populatedHeight), any coordinates at which a value has
not been set is blank (the value is `null`).

### height

```ts
get height(): number
set height(newHeight: number)
```

### width

```ts
get width(): number
set width(newWidth: number)
```

### populatedHeight

```ts
get populatedHeight(): number
```

### populatedWidth

```ts
get populatedWidth(): number
```

### Matrix.of()

```ts
static of(value: MaybeBoxed<ArrayValue> | ((MaybeBoxed<ArrayValue> | undefined)[] | undefined | null)[]): Matrix
```

### Matrix.new()

```ts
static new<T extends MatrixNewData>(data: T & RequireDimensionsForDefaultQuadrants<T>): Matrix
```

### Matrix.ofTransposed()

```ts
static ofTransposed(value: MaybeBoxed<ArrayValue> | MaybeBoxed<ArrayValue>[][] | Matrix): Matrix
```

### Matrix.createColumn()

```ts
static createColumn(columnValues: MaybeBoxed<ArrayValue>[]): Matrix
```

### Matrix.createRow()

```ts
static createRow(rowValues: MaybeBoxed<ArrayValue>[]): Matrix
```

### size

```ts
get size(): number
```

### valid

```ts
get valid(): boolean
```

### clone()

```ts
clone(): Matrix
```

### is1D()

```ts
is1D(): boolean
```

### toString()

```ts
toString(): string
```

### setData()

```ts
setData(data: AreaValueArray | AreaBoxedValueArray | MaybeBoxed<ArrayValue>[][]): this
```

Populate this matrix with the given data array.
The rows in `data` will be referenced, not copied, so `data` should be
considered to belong to this matrix henceforth, i.e. not mutated elsewhere.

### set()

```ts
set(x: number, y: number, value: MaybeBoxed<ArrayValue>): void
```

### get()

```ts
get(x: number, y: number, strict?: boolean): ArrayValue
```

### getBoxed()

```ts
getBoxed(x: number, y: number): MaybeBoxed<ArrayValue>
```

### getByIndex()

```ts
getByIndex(i: number): ArrayValue
```

Get the i'th element of this `Matrix` in by-rows iteration order.

### getColumnBoxed()

```ts
getColumnBoxed(c: number, includeDefaulted?: boolean): MaybeBoxed<ArrayValue>[]
```

Get the (possibly boxed) values of column c as a simple (not area) array.

### getRowBoxed()

```ts
getRowBoxed(r: number, includeDefaulted?: boolean): MaybeBoxed<ArrayValue>[]
```

Get the (possibly boxed) values of row r as a simple (not area) array.

### resolveCell()

```ts
resolveCell(): CellItem
```

### resolveSingle()

```ts
resolveSingle(): ArrayValue
```

### resolveSingleBoxed()

```ts
resolveSingleBoxed(): MaybeBoxed<ArrayValue>
```

### resolveAreaCells()

```ts
resolveAreaCells(cropTo?: "any-cell-information" | "cells-with-non-blank-values"): AreaCellArray
```

### resolveAreaValues()

```ts
resolveAreaValues(): AreaValueArray
```

### resolveAreaBoxed()

```ts
resolveAreaBoxed(): AreaBoxedValueArray
```

### uniqueValues()

```ts
uniqueValues(): Set<ArrayValue>
```

### resolveRange()

```ts
resolveRange<Boxed extends boolean = false>(opts?: IterationOptions<Boxed>): Array<Boxed extends false ? ArrayValue : MaybeBoxed<ArrayValue>>
```

### collapseToRow()

```ts
collapseToRow(r?: number): Matrix | FormulaError
```

### collapseToColumn()

```ts
collapseToColumn(c?: number): Matrix | FormulaError
```

### collapseToCell()

```ts
collapseToCell(r?: number, c?: number): Matrix | FormulaError
```

### collapseToNthCell()

```ts
collapseToNthCell(n?: number): Matrix | FormulaError
```

Return a matrix of the zero-based nth element in a left-to-right-then-top-down traversal of this matrix.
Note that bounds checking is not performed; this can yield a cell outside this range.
The returned instance is guaranteed to be new, even if it is identical to `this`.

- `n`: zero-based index of the value to return

Returns: matrix containing the single value specified, or error if n out of bounds

### hstack()

```ts
hstack(other: Matrix): Matrix
```

Stack matrices in a sequence horizontally (column wise).
See e.g. https://numpy.org/doc/stable/reference/generated/numpy.hstack.html

Invariant: `this.height === other.height`

- `other`: Other matrix. Must have the same height as `this`.

Returns: Horizontally stacked matrix

### vstack()

```ts
vstack(other: Matrix): Matrix
```

Stack matrices in a sequence vertically (row wise).
See e.g. https://numpy.org/doc/stable/reference/generated/numpy.vstack.html

Invariant: `this.width === other.width`

- `other`: Other matrix. Must have the same width as `this`.

Returns: Vertically stacked matrix

### expand()

```ts
expand(paddingValue: MaybeBoxed<ArrayValue>, toRows: number, toCols: number): Matrix
```

Expand matrix to the given dimensions, using `fillWith` as a padding value.
If either dimension of the matrix is already the given size or larger, it
is not changed.

- `paddingValue`: Value to use for padding the expanded matrix
- `toRows`: Desired number of rows in the expanded matrix.
- `toCols`: Desired number of columns in the expanded matrix.

### toMatrix()

```ts
toMatrix(): Matrix
```

### iterPopulated()

```ts
iterPopulated<Boxed extends boolean = false>(opts?: IterationOptions<Boxed>): IterableIterator<{
    x: number;
    y: number;
    value: Boxed extends false ? ArrayValue : MaybeBoxed<ArrayValue>;
  }>
```

### iterAll()

```ts
iterAll<Boxed extends boolean = false>(opts?: IterationOptions<Boxed>): IterableIterator<{
    x: number;
    y: number;
    value: Boxed extends false ? ArrayValue : MaybeBoxed<ArrayValue>;
  }>
```

Yield all values in rows-first order, including default values for
unpopulated areas (unless they are blank and `skipBlanks` is not `'none'`).

### iterAllWithCount()

```ts
iterAllWithCount(): IterableIterator<{
    value: ArrayValue;
    count: number;
  }>
```

Yield all values, including default values for unpopulated areas (but only
once, with a count for how many times they are repeated), in unspecified
order. The same value may be yielded multiple times, so the count each time
is not necessarily the total number of occurrences of that value in the
matrix; this is just run-length encoding to cut down on repetition.

### visitAllWithCount()

```ts
visitAllWithCount(visitor: (x: number, y: number, value: ArrayValue, count: number, regionWidth: number, regionHeight: number) => boolean | void, minVisitWidth?: number, minVisitHeight?: number): boolean
```

Visit all cells with count-based run-length encoding.
Unlike iterAllWithCount (which yields a flat iterator of { value, count }
without coordinates), this method calls the visitor with x,y coordinates
for each visited region.

Optional `minVisitWidth` and `minVisitHeight` parameters extend the individual-visit
region beyond this matrix's populated dimensions. This is useful when other
matrices (e.g., criteria matrices) have larger populated regions - we need to
visit each coordinate individually where ANY matrix has non-default values.

The visitor receives (x, y, value, count, regionWidth, regionHeight):
- x, y: top-left coordinates of the region
- value: the value at (x, y), which applies to all cells in the region
- count: total number of cells in the region (= regionWidth * regionHeight)
- regionWidth, regionHeight: dimensions of the region (useful for dependency tracking)

The visitor may return `true` to stop iteration early.

Calls visitor for:
1. Each cell in the individual-visit region (count: 1, regionWidth: 1, regionHeight: 1)
2. Each row's remaining column region (count: width - visitWidth, regionHeight: 1)
3. Each column's remaining row region (count: height - visitHeight, regionWidth: 1)
4. The remaining corner region (count: remainingWidth * remainingHeight)

Returns: true if visitor returned true (early termination), false otherwise

### iterAllColumnWise()

```ts
iterAllColumnWise(leaveBoxed?: boolean): IterableIterator<{
    x: number;
    y: number;
    value: MaybeBoxed<ArrayValue>;
  }>
```

### map()

```ts
map(fn: (element: MaybeBoxed<ArrayValue>, coords: {
    x: number;
    y: number;
  }) => MaybeBoxed<ArrayValue>): Matrix
```

### iterRowsBoxed()

```ts
iterRowsBoxed(): IterableIterator<{
    y: number;
    row: MaybeBoxed<ArrayValue>[];
  }>
```

### iterColumnsBoxed()

```ts
iterColumnsBoxed(): IterableIterator<{
    x: number;
    column: MaybeBoxed<ArrayValue>[];
  }>
```

### isPartiallyPopulated

```ts
get isPartiallyPopulated(): boolean
```

Indicates whether or not this matrix is partially populated

### every()

```ts
every(predicate: (value: MaybeBoxed<ArrayValue>) => boolean): boolean
```

### permuteRows()

```ts
permuteRows(permutation: number[]): Matrix
```

When providing the permutations for a matrix where `height` is
greater than `populatedHeight`, the length of `permutation` should
be `populatedHeight + 1`. Given a Matrix like so:

   Matrix { populatedHeight: 3, height: 1000 }

`permutation` should should be of length 4, where

   - indices 0, 1, 2 represent the indices of the populated
     rows, and
   - index 3 represents all of the indices in the default
     quadrant.

Providing `permutation = [ 0, 2, 1, 3 ]` would create a matrix
of `height` 1000 with a `populatedHeight` of 3.

However, providing `permutation = [ 0, 3, 1, 2 ]` would create
a matrix of `height` 1000 where the `populatedHeight` is 1000
as well. `permutation = [0, 3, 1, 2]` is equivalent to:

   permutation = [ 0, 3, 3, 3, (...994 more 3's), 1, 2 ]

### permuteColumns()

```ts
permuteColumns(permutation: number[]): Matrix
```

When providing the permutations for a matrix where `width` is
greater than `populatedWidth`, the length of `permutation` should
be `populatedWidth + 1`. Given a Matrix like so:

   Matrix { populatedWidth: 3, width: 1000 }

`permutation` should should be of length 4, where

   - indices 0, 1, 2 represent the indices of the populated
     rows, and
   - index 3 represents all of the indices in the default
     quadrant.

Providing `permutation = [ 0, 2, 1, 3 ]` would create a matrix
of `width` 1000 with a `populatedWidth` of 3.

However, providing `permutation = [ 0, 3, 1, 2 ]` would create
a matrix of `width` 1000 where the `populatedWidth` is 1000
as well. `permutation = [0, 3, 1, 2]` is equivalent to:

   permutation = [ 0, 3, 3, 3, (...994 more 3's), 1, 2 ]

### trimBottom()

```ts
trimBottom(): void
```

### hasDefaultValueFulfilling()

```ts
hasDefaultValueFulfilling(predicate: (value: MaybeBoxed<ArrayValue>) => boolean): boolean
```

Does this Matrix have a default value which fulfills the given predicate?

### applyTrim()

```ts
applyTrim(trim: number): Matrix | typeof ERROR_CALC
```

### take()

```ts
take(startRow: number, startCol: number, numRows: number, numCols: number): Matrix | typeof ERROR_CALC
```

## class Lambda

### parameterNames

```ts
readonly parameterNames: string[]
```

### parameterSymbols

```ts
readonly parameterSymbols: Map<string, LambdaParameterSymbol>
```

### expression

```ts
readonly expression: ASTRootNode
```

### boundArgs

```ts
readonly boundArgs: undefined | Map<LambdaParameterSymbol, LambdaArg>
```

### ownParameterSymbols

```ts
readonly ownParameterSymbols: DefaultMap<string, LambdaParameterSymbol>
```

### new Lambda()

```ts
constructor(parameterNames: string[], expression: ASTRootNode, outer?: LambdaBindings, parameterSymbols?: Map<string, LambdaParameterSymbol>)
```

### call()

```ts
call(ctx: EvaluationContext, args: MaybeBoxedFormulaArgument[]): MaybeBoxedFormulaArgument
```

### callWithAST()

```ts
callWithAST(ctx: EvaluationContext, args: ASTNode[]): MaybeBoxedFormulaArgument
```

### Lambda.fromAST()

```ts
static fromAST(ast: ASTLambdaNode, outer?: LambdaBindings): Lambda
```

### withBoundArgs()

```ts
withBoundArgs(outer: LambdaBindings): Lambda
```

### toString()

```ts
toString(): string
```

### numParams

```ts
get numParams(): number
```

### type AreaArray

```ts
type AreaArray<T extends Cell | CellValue | MaybeBoxed<CellValue> | ArrayValue | MaybeBoxed<ArrayValue>> = (T | null)[][] & AreaArrayAttributes<T>
```

Array of arrays of `Cell` objects or their values, with some bounds attributes, sheet name and workbook name.
Intended to represent the contents of a specified area of a sheet in a workbook.

- `top`, `left`, `bottom`, `right` (non-negative integers) are the inclusive
  zero-based bounds of the area that this represents.
- The nested array holds only the densely-populated part: its length is
  `dataBottom - top + 1` and each row is `dataRight - left + 1` wide. These
  equal `bottom - top + 1` and `right - left + 1` only when nothing was
  cropped or compacted away; otherwise the region between the populated data
  and `bottom`/`right` is described compactly by `defaultRow`,
  `defaultColumn` and `defaultValue`.
- `sheetName` - name identifying a sheet in a workbook (possibly differing in
  case from the actual sheet name)
- `workbookName` - name identifying a workbook (possibly differing in case
  from the actual workbook name)

### type AreaValueArray

```ts
type AreaValueArray = AreaArray<CellValue>
```

### type AreaCellArray

```ts
type AreaCellArray = AreaArray<Cell | null>
```

### type AreaBoxedValueArray

```ts
type AreaBoxedValueArray = AreaArray<MaybeBoxed<CellValue>>
```

## class Reference

Reference to a single cell or range of cells.

### conditional

```ts
readonly conditional: boolean
```

True if the referenced cell(s) are not certain to be required up-to-date
before the depending cell is evaluated.

For instance, IF(A1, B1, C1) will reference B1 and C1 conditionally (and
may need _neither_ of them, if A1 resolves to an error value), so we need
not, and must not, require B1 and C1 to be up-to-date before evaluating the
IF.

Likewise `HLOOKUP(A1, my_range, 2)` will reference the first row of
`my_range` unconditionally but the remainder conditionally, and in the end
at most one cell out of `my_range` will _actually_ be required up-to-date.

So conditionally-referenced cells will be checked for up-to-dateness when
the referencing formula is evaluated, and if they are not up-to-date, the
evaluation will throw EvaluationOrderException to force queue reordering.

### dynamic

```ts
readonly dynamic: boolean
```

True if this reference originates from a reference function whose result
cannot be determined at dependency graph construction time, because it
depends on the runtime arguments or spill state. These are `INDIRECT(...)`
and `OFFSET(...)` and `ANCHORARRAY`.

Such a reference is not represented in the dependency graph when initially
constructed, and thus is not determined until the formula is evaluated in
recalculation. It is then recorded as a dynamic dependency, so that
subsequent recalculations (or the same one upon redo-propagation to the
same formula cell) can account for the dependency in queue ordering and
propagation.

### nonValue

```ts
readonly nonValue: boolean
```

If true, this reference will not be used to read cell values. This is
for use by dependencies such as that of `FORMULATEXT(A1)`, which depends
on the formula of cell A1 but not on its value, so should not require A1
to be up-to-date before the depending cell is evaluated.

### workbookName

```ts
readonly workbookName: string
```

### sheetName

```ts
readonly sheetName: string
```

### sheetNameEnd

```ts
readonly sheetNameEnd: string
```

Last sheet of a sheet-range (3-D) reference such as `Sheet1:Sheet3!A1`, where `sheetName` names
the first one. Empty for an ordinary single-sheet reference.

### range

```ts
readonly range: Range | null
```

### name

```ts
readonly name: string | null
```

### trim

```ts
readonly trim: NumericTrim
```

### ctx

```ts
readonly ctx: EvaluationContext | undefined
```

### parse()

```ts
parse(refStr?: string): Readonly<ParsedReference> | null
```

This returns an object with a breakdown of the reference or a null if the reference wasn't valid.

- `refStr`: The reference to parse

### Reference.from

```ts
static readonly from: <Arg extends string | A1Reference | NameReference | Reference | Range>(cellRef: Arg, options?: ConstructorParameters<typeof Reference>[1], silent?: boolean) => Arg extends Range ? A1Reference : Arg extends Reference ? Arg : Reference | null
```

### new Reference()

```ts
constructor(ref: string | Reference | Range, { sheetName, sheetNameEnd, workbookName, dynamic, nonValue, conditional, trim, ctx }?: ReferenceOptions)
```

- `ref`: a cell address or name, or another `Reference` (copy) or `Range`.
- `options`
- `options.sheetName`: sheet name to use if none is found in `ref`
- `options.sheetNameEnd`: end sheet name of a sheet span, if none is found in `ref`
- `options.workbookName`: workbook name to use if none is found in `ref`
- `options.dynamic`
- `options.nonValue`
- `options.conditional`
- `options.trim`
- `options.ctx`

### width

```ts
get width(): number | undefined
```

### height

```ts
get height(): number | undefined
```

### offset()

```ts
offset(rows: number, cols: number, height: number, width: number): A1Reference
```

Return a cloned instance with the range shifted and/or changed in size.

Only call this for an address reference, it will throw on a name reference.

### size

```ts
get size(): number | undefined
```

The number of cells the range contains, or `undefined` for a name reference.

A 3-D (sheet-range) reference is refused rather than answered for, having two such counts with
nothing in the call to say which was meant: the cells of the rectangle, or those cells times
the number of sheets covered. The edges and the two extents are not ambiguous that way (the
rectangle is the same on each covered sheet), so they answer for a span as they do for any
other reference.

### is1D()

```ts
is1D(): boolean
```

### isAddress

```ts
get isAddress(): boolean
```

True if this is a reference to a cell (A1) or a cell range (A1:B2), false if this is a reference to a name.

### toString()

```ts
toString(abs?: boolean): string
```

### [Symbol.iterator]()

```ts
[Symbol.iterator](): IterableIterator<A1Reference>
```

Iterate over all cells of this range, yielding a single-cell address reference for each cell.
The Reference instance yielded from this generator is reused, so the consumer must not hold on to it, only use it
during each yield.

### collapse()

```ts
collapse(): A1Reference
```

Return a cloned instance with range set to the top-left corner of this
reference's range.

Only call this for an address reference, it will throw on a name reference.

### collapseToRow()

```ts
collapseToRow(r?: number): A1Reference
```

Return a new Reference that refers to row r (zero-based) of this range.
This must be an address reference (having a .range and not a .name).
Note that bounds checking is not performed; this can yield cells outside this range.

- `r`: which row to get (0 for first row, 1 for second, etc.)

Returns: a reference like this one but narrowed to that row. The returned instance
is guaranteed to be new, even if it is identical to `this`.

### collapseToColumn()

```ts
collapseToColumn(c?: number): A1Reference
```

Return a cloned instance that refers to column c (zero-based) of this range.
This must be an address reference (having a .range and not a .name).
Note that bounds checking is not performed; this can yield cells outside this range.

- `c`: which column to get (0 for first, 1 for second, etc.)

Returns: a reference like this one but narrowed to that column. The returned instance
is guaranteed to be new, even if it is identical to `this`.

### collapseToCell()

```ts
collapseToCell(r?: number, c?: number): this extends A1Reference ? A1Reference : never
```

Return a cloned instance that refers to the cell at row r, column c (zero-based) of this range.
This must be an address reference (having a .range and not a .name).
Note that bounds checking is not performed; this can yield a cell outside this range. The returned instance
  is guaranteed to be new, even if it is identical to `this`.

- `r`: which row to get (0 for first, 1 for second, etc.)
- `c`: which column to get (0 for first, 1 for second, etc.)

Returns: a reference like this one but narrowed to that cell.

### collapseToNthCell()

```ts
collapseToNthCell(n?: number): this extends A1Reference ? A1Reference : never
```

Return a reference to the zero-based nth cell in a left-to-right-then-top-down traversal of this range.
This must be an address reference (having a .range and not a .name).
Note that bounds checking is not performed; this can yield a cell outside this range.
The returned instance is guaranteed to be new, even if it is identical to `this`.

- `n`: zero-based index of the cell to return

Returns: reference like this one except narrowed to the single cell specified.

### getRefId()

```ts
getRefId(cellID?: string | null): string
```

Get fully-qualified cell ID. This is either a global name or a cell address prefixed with sheet name ('Sheet1!A1')
and (if present) a workbook pathname. The sheet name (or global name) is cased as in this reference (or in `cellID`)
which may be arbitrary. If you need consistent casing, use `getCanonicalCellId`.

- `cellID`: optional, cell ID to qualify. If null (the default), use the (top-left) cell ID of this reference.

Returns: the cell ID prefixed with sheet name and with workbook pathname if present

### getCellId()

```ts
getCellId(): string
```

Get this reference's name if this is a name reference, else the unprefixed A1 address of the top-left corner cell.

### withRange()

```ts
withRange(range: Range | ConstructorParameters<typeof Range>[0]): A1Reference
```

Return a cloned instance with the given range.

### withTrim()

```ts
withTrim(trim: Trim): A1Reference
```

### withContext()

```ts
withContext(ctx: EvaluationContext | undefined): Reference
```

Return a cloned instance with the given evaluation context.
Used to be called `resolver` in many places.

### applyTrim()

```ts
applyTrim(): (this extends A1Reference ? A1Reference : Reference) | typeof ERROR_REF
```

### resolveSingle()

```ts
resolveSingle(): ArrayValue
```

### resolveSingleBoxed()

```ts
resolveSingleBoxed(): MaybeBoxed<ArrayValue>
```

### resolveWorkbookAndSheet()

```ts
resolveWorkbookAndSheet(resolver?: EvaluationContext | null, requireSheet?: boolean): {
    workbook: Workbook;
    sheet: WorkSheet | null;
  } | FormulaError
```

- `requireSheet`: set to false to return a null sheet rather than throw an error

Returns: error if workbook fails to resolve, or if sheet fails to resolve and `requireSheet` is true

### resolveSheetSpan()

```ts
resolveSheetSpan(resolver?: EvaluationContext | null): {
    workbook: Workbook;
    sheets: WorkSheet[];
  } | FormulaError
```

Resolve the sheet span of a sheet-range (3-D) reference to the sheets it covers, in tab order.
Membership is positional, so the span covers every sheet sitting between its two endpoints
whatever their names, and endpoints written back to front (`Sheet3:Sheet1!A1`) cover the same
sheets as the forward spelling.

- `resolver`: the evaluation context to resolve in; defaults to this reference's own

Returns: the workbook and the sheets the span covers, or a `FormulaError` if the workbook is
not found or either endpoint names no sheet in it

### expandSheetSpan()

```ts
expandSheetSpan(resolver?: EvaluationContext | null): A1Reference[] | FormulaError
```

Expand a sheet-range (3-D) reference into one ordinary single-sheet reference per sheet it
covers, in tab order. Each of those behaves like any other reference, so a span needs no
handling of its own once expanded. Membership is positional, so a hidden sheet between the
endpoints is covered like any other, matching Excel (excel-test/three-d-references/findings.md,
section C: hiding a covered sheet, or making it very hidden, leaves `SUM` and `COUNT`
unchanged).

- `resolver`: the evaluation context to resolve in; defaults to this reference's own

Returns: one reference per covered sheet, or a `FormulaError` if the workbook is not found or
either endpoint names no sheet in it

### resolveAreaCells()

```ts
resolveAreaCells(cropTo?: "any-cell-information" | "cells-with-non-blank-values"): AreaCellArray
```

### resolveAreaValues()

```ts
resolveAreaValues(): AreaValueArray
```

### resolveAreaBoxed()

```ts
resolveAreaBoxed(): AreaBoxedValueArray
```

### toMatrix()

```ts
toMatrix(expandError?: boolean): Matrix | FormulaError
```

Produce a `Matrix` populated with the cell values from the range of this reference.

### resolveRange()

```ts
resolveRange<Boxed extends boolean = false>(opts?: IterationOptions<Boxed>): Array<Boxed extends false ? ArrayValue : MaybeBoxed<ArrayValue>> | FormulaError
```

Return the cell values of the given range, optionally skipping blank cells.
Default is to skip _unpopulated_ blanks, i.e. blank values in unpopulated
areas.

- `opts`

Returns: the specified cell values, or error if this is
a name reference that cannot be resolved, or whose formula resolves to an error or a non-range-reference value.

### cropToSheet()

```ts
cropToSheet(sheet: WorkSheet): this | A1Reference
```

### any()

```ts
any(predicate: (arg0: CellItem | null) => boolean): boolean | FormulaError
```

Return true if any of the referenced cells satisfy the given predicate, else false.

:::caution
NOTE THIS GOTCHA: if the reference fails to resolve, then this currently
returns a `FormulaError` ... which is truthy. So logic that uses the return
value in a boolean context may mistake a failure to resolve for the answer
that “yes, one of the referenced cells satisfies the given predicate” which
is _not_ what is meant by an error return value. This is likely to lead to
unintended behavior. So callers should explicitly compare the return value
with `true` if that is the meaning being looked for.
:::

- `predicate`: a function returning true/false for a given cell

Returns: true if the predicate returns true for one of the referenced cells. Error if:
* this is a name reference and the name is not found, or resolves to a string or number or error, or
encounters a circular dependency via defined names referencing one another
* this reference is workbook-qualified
* this reference has no resolver

### resolveCell()

```ts
resolveCell(): CellItem | null
```

### resolveCellOrDefinedName()

```ts
resolveCellOrDefinedName(): CellItem | null
```

Resolve a single cell from this reference. This differs from `resolveCell`
and `resolveAreaValues` and `resolveAreaCells` in that:
* if a defined-name formula evaluates to a non-reference, this returns the
  defined-name cell object itself (where `resolveCell` would return a blank
  cell object, and `resolveAreaValues` and `resolveAreaCells` would return
  an error, wrapped in a cell object in the latter case)
* if this (or the result of the last defined-name that does not evaluate to
  a name reference) is a range reference, this returns the top left cell of
  the referenced range, but `resolveCell` returns an artificial blank cell.

The reference must have a context, else this will throw.

### resolveName()

```ts
resolveName(opts?: EvaluationContext): {
    resolved: MaybeBoxedFormulaValue;
    nameCell?: DefinedName;
  }
```

Resolve name reference if that's what this is, returning what its formula resolves to.
If this is already an address range reference, it is just returned.
If it is a name reference, the `rawOutput` result of that name's formula is returned. That may be:
* another reference (if the formula is e.g. `=Sheet1!A1`)
* a number, string, boolean or `FormulaError` (for e.g. `=A1+B2`, `=A1&B2`, `=A1=B2`, or `=IDONTEXIST()`)

If the defined name has no last-computed value, or it is stale, or the
formula is context-dependent, then the formula must be evaluated in this
call. If this happens, the result is just returned but is _not_ assigned as
the last-computed value (`.v`) of the defined-name object. This is because
the change of .v here would not propagate to dependents (because it is not
occurring in the recalculation algorithm) --- and then when recalculation
happens, it may evaluate this defined-name formula again and get the same
value, and thus consider it up-to-date and not propagate recalculation to
dependents ... so recalculation may incorrectly fail to update those
dependent cells.

- `opts`: the evaluation context, if not this.ctx

Returns: resolved: the result of evaluating the named formula (`#NAME?` if
the name is not found), and nameCell: the defined-name cell object to
which the name was resolved

### resolveToNonName()

```ts
resolveToNonName(opts?: EvaluationContext): MaybeBoxed<ArrayValue> | A1Reference | Matrix
```

Resolve this name reference (if that's what this is) and evaluate its formula, and if that yields a name reference,
recurse until something other than a name reference is obtained, or a loop is detected. If a loop is detected,
return `ERROR_NAME` with a circular dependency detail message. Else return the first non-name-reference result. If
this reference is already not a name reference, just return `this`.

- `opts`: the evaluation context, if not this.ctx

Returns: this reference if it is not a name reference, else the first defined-name formula result
that isn't a name reference, else `ERROR_NAME` if defined-name formula results form a loop of name references
leading back to this reference. Guaranteed not to return a name reference.

### prefix()

```ts
prefix(): string
```

Generate a prefix according to the workbook name and directory and the sheet name of this reference.
The prefix may be empty, but if it is not, it ends with '!' so that the reference range expression can be
concatenated directly onto it.

Returns: the prefix for this reference

### withPrefix()

```ts
withPrefix(p: {
    sheetName?: string;
    sheetNameEnd?: string;
    workbookName?: string;
  }): Reference
```

Return a cloned instance with the given changes made to prefix properties.
Any that are null or absent are not set (but you can pass '' to reset them).

### contains()

```ts
contains(other: Reference): boolean
```

### visitFormulaCells()

```ts
visitFormulaCells(callback: CallbackWithStop<CellItem>): void
```

Visit the formula cell(s) pointed to by this reference. If `this` is
a name reference, visit that single defined name cell.
Precondition: Resolver (`this._`) must be set.

### isResolvable()

```ts
isResolvable(): boolean
```

### top

```ts
get top(): number
```

### left

```ts
get left(): number
```

### bottom

```ts
get bottom(): number
```

### right

```ts
get right(): number
```

### type A1Reference

```ts
type A1Reference = Reference & {
  range: Range;
  size: number;
  width: number;
  height: number;
}
```

### type NameReference

```ts
type NameReference = Reference & {
  name: string;
  size: undefined;
  width: undefined;
  height: undefined;
}
```

### type SlimRange

```ts
type SlimRange = {
  top: number;
  left: number;
  bottom: number;
  right: number;
}
```

### type SlimRangeOrCoords

```ts
type SlimRangeOrCoords = {
  top: number;
  left: number;
  bottom?: number;
  right?: number;
}
```

### function parseReference()

```ts
function parseReference(refStr?: string): Readonly<ParsedReference> | null
```

This returns an object with a breakdown of the reference or a null if the reference wasn't valid.

- `refStr`: The reference to parse

### function a1ToRowColumn()

```ts
function a1ToRowColumn(a1Address: string): [
  row: number,
  column: number
]
```

Convert an A1 cell address into zero-based row and column indices

- `a1Address`: a cell address in A1 format

Returns: an array with zero-based cell coordinates: [row, column]

### function a1ToRowColumnOrNull()

```ts
function a1ToRowColumnOrNull(a1Address: string): [
  row: number,
  column: number
] | null
```

Convert an A1 cell address into zero-based row and column indices, if possible.
Like `a1ToRowColumn` but returns `null` instead of throwing an error, if `a1Address` is not an A1 cell address.

- `a1Address`: a cell address in A1 format

Returns: zero-based row and column indices, or `null` if `a1Address` is not
a cell address in A1 format.

### function checkA1()

```ts
function checkA1(ref: Reference): A1Reference
```

Check that the given reference is an A1 reference and return it as such.

### function isA1Ref()

```ts
function isA1Ref(d: any): d is A1Reference
```

### function isRef()

```ts
function isRef(d: any): d is Reference
```

### function isNameRef()

```ts
function isNameRef(d: any): d is NameReference
```

### function isCellOrDefinedName()

```ts
function isCellOrDefinedName(value: unknown): value is CellItem
```

Type guard to check if a value is either a Cell or a DefinedName.

### function constructCellID()

```ts
function constructCellID(row: number, col: number): string
```

### function colFromOffs()

```ts
function colFromOffs(col: number): string
```

Convert a numeric column index (zero-based) to an upper-case column name. 0 to A, 1 to B, 26 to AA, and so on.

- `col`: a zero-based column index

Returns: the corresponding column name in upper case.

### function offsFromCol()

```ts
function offsFromCol(colstr: string): number
```

### const MAX_COL

```ts
const MAX_COL: number
```

### const MAX_ROW

```ts
const MAX_ROW: number
```

## class Range

A Range specifies an area in cell coordinate space that is enclosed by the Range's upper-left point (top,left)
and its lower-right point (bottom,right), both inclusive.

### top

```ts
top: number
```

### bottom

```ts
bottom: number
```

### left

```ts
left: number
```

### right

```ts
right: number
```

### $top

```ts
$top: boolean
```

### $bottom

```ts
$bottom: boolean
```

### $left

```ts
$left: boolean
```

### $right

```ts
$right: boolean
```

### unbounded

```ts
unbounded: Unbounded
```

### Range.withinBounds()

```ts
static withinBounds(col: number, row: number): boolean
```

### Range.MAX_ROW

```ts
static MAX_ROW: number
```

### Range.MAX_COL

```ts
static MAX_COL: number
```

### new Range()

```ts
constructor({ top, left, bottom, right, $top, $left, $bottom, $right, unbounded }: {
    top: number;
    left: number;
    bottom?: number;
    right?: number;
    $top?: boolean;
    $left?: boolean;
    $bottom?: boolean;
    $right?: boolean;
    unbounded?: number;
  })
```

- `src`: zero-based coordinates of the bounds of a range, and optionally
the "lockedness" of any of those bounds. The bottom and right bounds
default to top and left, respectively.

### Range.createColumnRange()

```ts
static createColumnRange(left: number, right?: number): Range
```

- `right`: defaults to `left`

### Range.createRowRange()

```ts
static createRowRange(top: number, bottom?: number): Range
```

- `bottom`: defaults to `top`

### toString()

```ts
toString(abs?: boolean): string
```

### isCollapsed

```ts
get isCollapsed(): boolean
```

Returns true if this is 1x1, a single-cell range.

### collapse()

```ts
collapse(toTopLeft?: boolean): Range
```

Returns a new Range collapsed to a single point at to one of the boundary points of this range.

- `toTopLeft`: `true` collapses the Range to its top/left corner, `false` to its bottom/right.

### collapseToTopLeft()

```ts
collapseToTopLeft(): Range
```

Returns a new Range collapsed to a single point at the top-left corner of this range.
Does not copy lock attributes ($top etc.).

### collapseToBottomRight()

```ts
collapseToBottomRight(): Range
```

Returns a new Range collapsed to a single point at the bottom-right corner of this range.
Does not copy lock attributes ($top etc.).

### collapseToRow()

```ts
collapseToRow(r?: number): Range
```

Returns a new Range collapsed to the given row of this range (default top row)
Does not copy lock attributes ($top etc.).
Does not check bounds, so result will be outside this range if r >= height.

- `r`: zero-based index of the row to collapse to.

### collapseToColumn()

```ts
collapseToColumn(c?: number): Range
```

Returns a new Range collapsed to the given column of this range (default leftmost column).
Does not copy lock attributes ($top etc.).
Does not check bounds, so result will be outside this range if c >= width.

- `c`: zero-based index of the column to collapse to.

### extendToLength()

```ts
extendToLength(newLength: number): Range
```

Returns a new Range with the same shorter dimension as this one, but the longer dimension set to `newLength`.
(This will make the longer dimension the shorter one, if `newLength` < the shorter dimension. The intended
use case of this is to extend rather than contract, in which case the longer dimension remains longer, so this
will need changing if the opposite use case becomes relevant.)
Does not copy lock attributes ($top etc.).

- `newLength`: the length of the longer dimension (width or height) of the new range

Returns: a range like this one but with its longer dimension changed to `newLength`.

### width

```ts
get width(): number
```

### height

```ts
get height(): number
```

### size

```ts
get size(): number
```

### equals()

```ts
equals(range: SlimRange | null): boolean
```

Compares this range to another range to test if their defined rectangles are equal.
This only tests the values of top, left, bottom, right; ignoring any locks.

- `range`: the reference range with which to compare.

### strictEquals()

```ts
strictEquals(range: (SlimRange & Pick<Range, "$top" | "$left" | "$bottom" | "$right">) | null): boolean
```

Compares this range to another range to test if their defined rectangles are equal.
This tests both the rectangles as well as the status of locks on the dimensions.

- `range`: the reference range with which to compare.

### contains()

```ts
contains(rangeOrCoords: SlimRangeOrCoords): boolean
```

Checks whether the specified range is fully covered by this range.

- `rangeOrCoords`: the reference range with which to compare.

### except()

```ts
except(range: SlimRange): IterableIterator<Range>
```

Subtract the supplied range from the current one. Yields up to 4 ranges, depending on how the ranges overlap.

### intersects()

```ts
intersects(range: SlimRange): boolean
```

### getIntersection()

```ts
getIntersection(other: SlimRange): Range | null
```

### iterCoordinates()

```ts
iterCoordinates(): IterableIterator<{
    row: number;
    column: number;
  }>
```

### moveBy()

```ts
moveBy(deltaX: number, deltaY: number): Range
```

Returns: a new range that has been shifted by X and Y.

### extendSide()

```ts
extendSide(side: Side, position: number): Range
```

### toBoundingBox() (deprecated)

```ts
toBoundingBox(): {
    minY: number;
    minX: number;
    maxY: number;
    maxX: number;
  }
```

## class Sheet extends emitter

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

### new Sheet()

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

