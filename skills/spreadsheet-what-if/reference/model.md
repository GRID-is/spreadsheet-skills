<!-- GENERATED FILE. Do not edit by hand. Regenerate with `npm run sync`. -->

# Model: loading, reading, writing, recalculation

Generated from `@grid-is/spreadsheet-engine@17.1.0` (`dist/index.d.ts`). Every public symbol listed here exists in that version. If the installed version differs, read `node_modules/@grid-is/spreadsheet-engine/dist/index.d.ts` instead; it is the source of truth.

`Model` is the entry point. It holds one or more workbooks and the shared dependency graph. Value writes recalculate automatically; formula edits go through `Workbook.editCell` and need `model.recalculate(ALL_FORMULA_CELLS)`.

## class Model extends emitter implements EvaluationContext

Central interface for managing and manipulating spreadsheet data in memory.

The Model class represents a collection of workbooks and provides a unified API for reading,
writing, and calculating cell values across all workbooks. It manages workbook dependency graphs
to ensure accurate recalculation when values change, and handles formula evaluation with
support for cross-workbook references.

#### Basic usage

```typescript
// Wait for formula parser to load before using models
await Model.preconditions;

// Create a model from JSF (recommended)
const parsedJSF = JSON.parse(jsf);
const model = Model.fromJSF(parsedJSF);

// Alternatively, create from CSF (for backward compatibility)
const parsedCSF = JSON.parse(csf);
const model = Model.fromCsf(parsedCSF);

// Write primitive values to cells
model.write('A1', "Hello, World!");
model.write('A2', 42);
model.write('A3', true);

// Read cell values
model.readValue("=A1");
model.readValue("=Sheet1!A1");  // Read from a specific sheet
model.readValue("=[budget.xlsx]Sheet1!A1");  // Read from a specific workbook

// Work with multiple workbooks
model.addWorkbook(anotherWorkbook);
model.write('Sheet1!A1', 100); // Write to specific sheet
model.write('[another_workbook.xlsx]Sheet1!A1', 200); // Write to specific workbook
```

#### Performance considerations

- **Lazy recalculation:** only changed cells and their dependents are recalculated
- **Batch writes:** Use `writeMultiple()` for better performance when writing many cells
- **Functions may be volatile:** functions like NOW() and RAND() recalculate every time

### Model.preconditions

```ts
static preconditions: Promise<{
    parse: (formula: string) => ASTNode;
    replaceRefsOnMove: ReplaceRefsOnMoveFn;
    replaceRefsOnDelete: ReplaceRefsOnDeleteFn;
    replaceRefsOnInsert: ReplaceRefsOnInsertFn;
    replaceSheetReferences: ReplaceSheetReferencesFn;
    replaceSheetWithRefError: ReplaceSheetWithRefErrorFn;
    replaceWorkbookReferences: ReplaceWorkbookReferencesFn;
    replaceTableReferences: ReplaceTableReferencesFn;
    replaceNameWithError: ReplaceNameWithErrorFn;
  }>
```

Promise that should be awaited before calling certain methods of `Model`
(noted with a precondition in the documentation of those methods).

### coerceNullToZero

```ts
coerceNullToZero: CoercionMode
```

### mode

```ts
mode: ModeBit
```

### getWorkbook()

```ts
getWorkbook(this: Model, name?: string | null): Workbook | undefined
```

### resolveWorkbook()

```ts
resolveWorkbook(this: Model, name?: string | null): Workbook | undefined
```

### resolveSheet()

```ts
resolveSheet(this: Model, sheetName?: string | null, workbookName?: string | null): WorkSheet | null
```

### getGlobal()

```ts
getGlobal(this: Model, name: string, workbookName?: string | null): DefinedName | FormulaError
```

### resolveName()

```ts
resolveName(this: Model, name: string, sheetName?: string | null): DefinedName | FormulaError
```

### getTable()

```ts
getTable(this: Model, name: string, workbookName: string | null | undefined): Table | null
```

### resolveTable()

```ts
resolveTable(this: Model, name: string, workbookName: string | null | undefined): Table | null
```

### getEntities()

```ts
getEntities(this: Model): ModelEntity[]
```

### deferDataTables

```ts
get deferDataTables(): boolean
set deferDataTables(value: boolean)
```

When true, data table anchor cells are deferred --- they are not
recalculated until `recalculate({ includeDeferred: true })` or
`recalculate(ALL_FORMULA_CELLS)` is called.

Setting to `true` scans all attached workbooks and adds their data-table
anchor cells to `cellsToDefer`. Setting to `false` removes all
data-table anchor cells from `cellsToDefer`.

**Persistence**: this flag is one-directional --- attaching a workbook
with `calcMode: "autoNoTable"` sets it to `true`, but removing that
workbook does *not* reset it. Consumers who want to restore automatic
recalculation of data tables must explicitly set `deferDataTables = false`.

Note: `cellsToDefer` can also be modified independently of this property,
so the boolean may not reflect the exact contents of that set.

### calcMode

```ts
get calcMode(): CalcMode
```

The effective calculation mode. When a workbook with
`calcMode: "autoNoTable"` is attached, `deferDataTables` is set to `true`
automatically. The calcMode value is preserved on individual workbooks for
round-tripping through JSF.

With multiple workbooks, the first workbook (in insertion order) whose
calcMode is not `"auto"` determines the result. This is adequate for
the primary single-workbook use case; multi-workbook conflict resolution
is not currently defined beyond this first-wins behavior.

### env

```ts
env: Map<"username" | "isMobile" | "isPrint", MaybeBoxedFormulaArgument>
```

Information about outside environment relevant to the model and functions.
Writable from the outside, but functions get only read access to it.

### evaluateAST

```ts
evaluateAST: (ast: ASTNode, options: EvaluationContext) => MaybeBoxedFormulaValue
```

Evaluate a formula in the form of an AST, in a given evaluation context.
This wraps the `evaluateAST` function as a `Model` method, just to enable
calling it via evaluation context to dodge circular imports.

### evaluateASTNode

```ts
evaluateASTNode: FnEvaluateASTNode
```

Evaluate an AST node.
This wraps the `evaluateASTNodeUnbound` function as a `Model` method, just
to enable calling it via evaluation context to dodge circular imports.

### Model.fromCsf()

```ts
static fromCsf(csf: WorkbookCSF, options?: AddWorkbookOptions): Model
```

Make a {@link Model} instance and populate it with a workbook from the given CSF.

{@link https} (Common Spreadsheet Format) is a JSON
representation of a workbook. This method is typically used when loading data that has been
previously processed from XLSX to JSON. Packages to do that include
{@link https} or
{@link https}.

- `csf`: The workbook data in CSF format
- `options`: Configuration options for workbook initialisation

Returns: A new {@link Model} instance containing the loaded workbook

```typescript
// Ensure parser is ready
await Model.preconditions;

// Create model from JSF data
const model = Model.fromJSF(jsf, {
  // When a workbook is read-only, work required to support writes is skipped in order to load
  // the workbook faster. In particular, formulas will not be parsed and the workbook will not
  // be added to the dependency graph. No initial recalculation occurs, which may lead to
  // inaccuracies in workbooks that depend on it.
  readOnly: true
});

// Access the loaded data
const cellValue = model.readValue('=A1');
```

### Model.fromJSF()

```ts
static fromJSF(jsf: JSF, options?: AddWorkbookOptions & {
    externals?: boolean;
  }): Model
```

Make a {@link Model} instance and populate it with a workbook from the given JSF.

JSF (JSON Spreadsheet Format) is a JSON representation of a workbook produced by the
{@link https} library. This method
is typically used when loading data that has been previously processed from XLSX to JSON.

- `jsf`: A JSF object representing a workbook
- `options`: Configuration options for workbook initialization
- `options.externals`: Should external workbook definitions in the JSF be constructed as
workbooks in the model. This is true by default.

Returns: A new {@link Model} instance containing the loaded workbook

```typescript
// Load Excel file using xlsx-convert
import xlsxConvert from "@borgar/xlsx-convert";

await Model.preconditions;

const wb = await xlsxConvert("budget.xlsx");
const model = Model.fromJSF(wb);
const totalSpent = model.runFormula("=SUM(D:D)");
```

### Model.fromXLSXFile()

```ts
static fromXLSXFile(path: string, options?: AddWorkbookOptions & {
    externals?: boolean;
  }): Promise<Model>
```

Load a Model from an XLSX file path.

This is a convenience method that wraps `@borgar/xlsx-convert` to load XLSX files
directly into a Model without requiring users to manually import the conversion library.

- `path`: - Path to the XLSX file (Node.js only - uses fs)
- `options`: - Options for workbook loading

Returns: A Promise resolving to a new {@link Model} instance

```typescript
const model = await Model.fromXLSXFile('budget.xlsx');
const totalSpent = model.runFormula("=SUM(D:D)");
```

### Model.fromXlsxFile() (deprecated)

```ts
static fromXlsxFile(path: string, options?: AddWorkbookOptions & {
    externals?: boolean;
  }): Promise<Model>
```

### Model.fromXLSX()

```ts
static fromXLSX(data: Buffer | ArrayBuffer | Uint8Array, filename: string, options?: AddWorkbookOptions & {
    externals?: boolean;
  }): Promise<Model>
```

Load a Model from XLSX binary data.

This is a convenience method that wraps `@borgar/xlsx-convert` to load XLSX data
directly into a Model without requiring users to manually import the conversion library.

- `data`: - Binary XLSX data (works in browsers and Node.js)
- `filename`: - Filename to associate with the workbook
- `options`: - Options for workbook loading

Returns: A Promise resolving to a new {@link Model} instance

```typescript
const response = await fetch('https://example.com/budget.xlsx');
const data = await response.arrayBuffer();
const model = await Model.fromXLSX(data, 'budget.xlsx');
```

### Model.fromXlsx() (deprecated)

```ts
static fromXlsx(data: Buffer | ArrayBuffer | Uint8Array, filename: string, options?: AddWorkbookOptions & {
    externals?: boolean;
  }): Promise<Model>
```

### Model.empty()

```ts
static empty(filename?: string): Model
```

Create an empty {@link Model} instance with a single blank workbook and worksheet.

This is a convenience method for creating a new Model from scratch without needing to
provide CSF data. The resulting model contains one workbook with one empty worksheet
named "Sheet1".

- `filename`: The name to assign to the empty workbook

Returns: A new {@link Model} instance containing an empty workbook

### new Model()

```ts
constructor()
```

### ready

```ts
get ready(): boolean
```

### defect

```ts
get defect(): string | null | undefined
```

### volatiles

```ts
get volatiles(): ReadonlyArray<CellVertexId | NameVertexId>
```

### staleDeferredCells

```ts
get staleDeferredCells(): ReadonlySet<CellItem>
```

Cells that were encountered as dependents during recalculation but were
deferred (skipped) because they were configured for deferral. These
cells have stale values and need `recalculate({ includeDeferred: true })`
or `recalculate(ALL_FORMULA_CELLS)` to be recalculated.

Note: non-deferred cells that transitively depend on deferred cells may
also have stale values, since dependency propagation stops at deferred
cells.

### cellsToDefer

```ts
get cellsToDefer(): ReadonlySet<CellItem>
```

Cells configured to be skipped during normal recalculation.
Use `recalculate({ includeDeferred: true })` or
`recalculate(ALL_FORMULA_CELLS)` to include them.

### getWorkbooks()

```ts
getWorkbooks(): Workbook[]
```

### getWorkbookById()

```ts
getWorkbookById(id: string): Workbook | undefined
```

Get the workbook with the given ID, or null if no such workbook is in the model.

### addWorkbook()

```ts
addWorkbook(data: JSF, options?: AddWorkbookOptions): Workbook
```

Construct a workbook from the given JSF and then attach it to this model.

This is just a convenience wrapper calling {@link Workbook.fromJSF} and {@link attachWorkbook}.

If your workbook source is in CSF format, consider using {@link Model.fromCsf} instead,
or if you have multiple CSF workbooks, use {@link Workbook.fromCsf} and {@link attachWorkbook}.

- `data`: The workbook data in JSF format
- `options`: Configuration options for the new workbook

Returns: The newly created {@link Workbook} instance that was added to the model

```typescript
// Add multiple related workbooks
const model = new Model();
model.addWorkbook(budget2024jsf);  // From e.g. budget2024.xlsx
model.addWorkbook(budget2025jsf);  // From e.g. budget2025.xlsx
```

### addWorkbookFromXLSXFile()

```ts
addWorkbookFromXLSXFile(path: string, options?: AddWorkbookOptions & {
    externals?: boolean;
  }): Promise<Workbook>
```

Add a workbook from an XLSX file path.

This is a convenience method that wraps `@borgar/xlsx-convert` to load XLSX files
directly into the model. External references in the XLSX are also added to the model.

- `path`: - Path to the XLSX file (Node.js only - uses fs)
- `options`: - Options for workbook loading

Returns: A Promise resolving to the main Workbook instance

```typescript
await Model.preconditions;
const model = new Model();
const budget2024 = await model.addWorkbookFromXLSXFile('budget2024.xlsx');
const budget2025 = await model.addWorkbookFromXLSXFile('budget2025.xlsx');
```

### addWorkbookFromXlsxFile() (deprecated)

```ts
addWorkbookFromXlsxFile(path: string, options?: AddWorkbookOptions & {
    externals?: boolean;
  }): Promise<Workbook>
```

### addWorkbookFromXLSX()

```ts
addWorkbookFromXLSX(data: Buffer | ArrayBuffer | Uint8Array, filename: string, options?: AddWorkbookOptions & {
    externals?: boolean;
  }): Promise<Workbook>
```

Add a workbook from XLSX binary data.

This is a convenience method that wraps `@borgar/xlsx-convert` to load XLSX data
directly into the model. External references in the XLSX are also added to the model.

- `data`: - Binary XLSX data (works in browsers and Node.js)
- `filename`: - Filename to associate with the workbook
- `options`: - Options for workbook loading

Returns: A Promise resolving to the main Workbook instance

### addWorkbookFromXlsx() (deprecated)

```ts
addWorkbookFromXlsx(data: Buffer | ArrayBuffer | Uint8Array, filename: string, options?: AddWorkbookOptions & {
    externals?: boolean;
  }): Promise<Workbook>
```

### attachWorkbook()

```ts
attachWorkbook(wb: Workbook, options?: AddWorkbookOptions): void
```

Add an additional workbook to this model.

This method allows you to combine multiple spreadsheet workbooks into a single model, enabling
cross-workbook formula references. Each workbook must have a name unique (case-insensitively)
within the model, unless an existing workbook with the same name is an external reference stub
(marked with `isExternal: true`), in which case it will be replaced by the new workbook.

- `wb`: The workbook to add
- `options`: Configuration options for which optimization and recalculation work to do

```typescript
// Add multiple related workbooks
const model = new Model();
model.attachWorkbook(Workbook.fromJSF(budget2024jsf));
model.attachWorkbook(Workbook.fromJSF(budget2025jsf));
```

### removeWorkbook()

```ts
removeWorkbook(id: string): boolean
```

Remove a workbook from this model and clean up all related dependencies.

When a workbook is removed, all cells that depend on formulas in that workbook will be
recalculated. Any cross-workbook references to the removed workbook will result in #REF!
errors in dependent cells.

- `id`: The unique identifier of the workbook to remove

Returns: `true` if the workbook was found and removed, `false` otherwise

```typescript
const jsf = ...;  // Load workbook as JSF
jsf.id = '1234';
const model = Model.fromJSF(jsf);
const removed = model.removeWorkbook('1234');
```

### getCell()

```ts
getCell(cellId: string, sheetName?: string | null, workbookName?: string | null): Cell | null
```

### isGlobal()

```ts
isGlobal(cellRef: string, workbookName?: string): boolean
```

- `workbookName`: name of a workbook to look in, if `cellRef` does not have a workbook prefix

### on()

```ts
on<T extends ModelEventType>(event: T, listener: ModelEventListener<T>): ReturnType<typeof emitter>
```

### off()

```ts
off<T extends ModelEventType>(event: T, listener: ModelEventListener<T>): ReturnType<typeof emitter>
off(event: string): ReturnType<typeof emitter>
off(): ReturnType<typeof emitter>
```

### write()

```ts
write(cellRef: string | A1Reference, value: CellValue, opts?: WriteOptions): void
```

Write `value` to the cell at `cellRef` (an A1 address). Recalculates unless `opts.skipRecalc`
is set.

Writes are persistent edits, equivalent to {@link Workbook.editCell} with `{ v: value }`.
They cannot be undone by any method on the model; capture a {@link ValueSnapshot} beforehand
and `snapshot.applyTo()` to revert.

### writeMultiple()

```ts
writeMultiple(writes: Array<readonly [
    string | A1Reference,
    CellValue
  ]>, opts?: WriteOptions): void
```

Write each `[ref, value]` pair, then recalculate once at the end (unless `opts.skipRecalc` is
set). Equivalent to a batched series of {@link Model.write} calls.

### clearCells()

```ts
clearCells(ref: string | Reference): void
```

- `ref`: A reference to the cell, or range of cells, to clear. Defined names are not supported.

### recalculate()

```ts
recalculate(options?: WhichCellsToRecalculate | RecalculateOptions): {
    nativeWorkbooksChanged: Set<Workbook>;
  }
```

Recalculates formula cells in the model and updates their values.

This method triggers the recalculation engine to evaluate formulas based on the dependency
graph. It emits a 'beforerecalc' event before starting, handles any errors during calculation,
and triggers an update event when complete.

If any sheets have GSDV cells (which should only happen if this is the initial recalculation),
then `Cells.clearGsdv` is called and if any cells are deleted as a result, a second initial
recalculation is performed (with CHANGED_ONLY, so not updating volatiles again) to update
formulas depending on them.

- `options`: - Controls which cells to recalculate. Can be a
`WhichCellsToRecalculate` symbol or a {@link RecalculateOptions} object:
- `CHANGED_OR_VOLATILE` (default): recalculates cells that have changed or are marked
volatile
- `CHANGED_ONLY`: recalculates only cells that have changed
- `ALL_FORMULA_CELLS`: forces recalculation of all formula cells
- `{ which?, includeDeferred? }`: options object; `includeDeferred: true` includes deferred cells in this
recalculation while preserving the set of cells to defer for future recalculations.
Note: `includeDeferred` is redundant with `ALL_FORMULA_CELLS` which
already ignores deferral.

Returns: An object with a `nativeWorkbooksChanged` property containing any GRID-native
workbooks that needed recalculation.

### iterativeCalculationSettings()

```ts
iterativeCalculationSettings(): IterativeCalculationOptions
```

### goalSeek()

```ts
goalSeek(controlCell: string | Reference, targetCell: string | Reference, targetValue: number): number | FormulaError
```

### runFormula()

```ts
runFormula(formula: string, extraContext?: Partial<EvaluationContext> | null): FormulaValue
```

Evaluate a spreadsheet formula and return the computed result.

Results are automatically cached based on the formula text and will be reused if
the same formula is evaluated multiple times with unchanged dependencies.

- `formula`: The Excel formula to evaluate, with or without leading '=' (e.g., 'SUM(A1:A10)'
or '=SUM(A1:A10)')
- `extraContext`: extra options or properties to pass through to the formula runner. These
will be available to each spreadsheet function as attributes on `this`

Returns: Result of the formula

```typescript
import xlsxConvert from "@borgar/xlsx-convert";
import { Model } from '@grid-is/apiary';

await Model.preconditions;

const wb = await xlsxConvert("budget.xlsx");
const model = Model.fromJSF(wb);
const totalSpent = model.runFormula("=SUM(D:D)");
```

### readValue()

```ts
readValue(expression: string, fallBack?: CellValue): CellValue
```

Evaluate expression and return the resulting value.

See `evaluateExpression`.

- `expression`: the expression to evaluate. Treated as a formula if it begins with `=` and isn't just that.
- `fallBack`: value to return if expr is empty or null or just `=`.

Returns: the resulting `Cell` instance, or `fallBack`, or a `Cell` instance with a `FormulaError` as its value.

### readCell()

```ts
readCell(expression: string, fallBack?: Cell): Cell
```

Evaluate expression and return the resulting `Cell`.

See `evaluateExpression`.

- `expression`: the expression to evaluate. Treated as a formula if it begins with `=` and isn't just that.
- `fallBack`: value to return if expr is empty or null or just `=`, or failed to resolve to a cell.

Returns: the resulting `Cell` instance, or `fallBack`, or a `Cell` instance with a `FormulaError` as its value.

### readCellOrDefinedName()

```ts
readCellOrDefinedName(expression: string, fallBack?: CellItem): CellItem
```

Evaluate expression, resolving any name reference result and recursing to
that formula, until a result that _isn't_ a name reference is obtained.
Return a single `Cell` which is:
* if the result is a reference to a range of sheet cells, the top-left cell
  cell of that range
* else if the result is that of a defined-name formula (not the original
  `expression`), return that last defined-name `Cell` object
* else the result itself (or its top-left element if it is a `Matrix`),
  wrapped in a `Cell` with no `id`.

- `expression`: the expression to evaluate. Treated as a formula if it begins with `=` and isn't just that.
- `fallBack`: value to return if expr is empty or null or just `=`, or failed to resolve to a cell.

Returns: the resulting `Cell` instance, or `fallBack`, or a `Cell` instance with a `FormulaError` as its value.

### readCells()

```ts
readCells(expression: string, options?: {
    cropTo?: "any-cell-information" | "cells-with-non-blank-values";
  }): AreaCellArray
```

Evaluate expression and return the resulting 2-D array of cells.

See `evaluateExpression`.

The result is an `AreaCellArray`. Note that a redundant trailing region of a
spill (e.g. the repeated default of a whole-column spill) is not
materialized cell-by-cell; it is represented compactly by the
`defaultRow`/`defaultColumn`/`defaultValue` attributes, so the nested array
can be shorter/narrower than `bottom - top + 1` by `right - left + 1`. See
{@link AreaArrayAttributes}.

- `expression`: the expression to evaluate. Treated as a formula if it begins with `=` and isn't just that.

Returns: the resulting 2-D array of cells, or an error or fallback wrapped into the same structure.

### evaluateExpression()

```ts
evaluateExpression<Values extends boolean = boolean, Single extends boolean = boolean, Fallback = unknown>(expression: string, { fallBack, definedName, values, single, extraContext, cropTo }: EvaluateExpressionOptions<Values, Single, Fallback>): EvaluateExpressionReturnType<Values, Single, Fallback>
```

Evaluate expression and return the resulting value, or cell, or 2-D array of values or of cells.

A 2-D array is the type returned by `Reference.resolveArea`: an Array of Arrays of values or Cell instances,
plus the attributes `top`, `left`, `bottom`, `right`, `sheetName`.

`expr` may be a literal value or a formula, or nullish or empty-string or the string `'='`. In the
latter three cases, `fallBack` is returned.

Also, if `single` is true, then `fallBack` is returned if the cell could not be resolved (and, when
`values` is also true, when the resolved cell's value is null).

- `expression`: what to evaluate. Treated as a formula if it begins with `=` and isn't just that.

Returns: the evaluated value, directly, or wrapped in a Cell instance or area array.
If `single` is false and `values` is false, this returns an `AreaCellArray`.
If `single` is false and `values` is true, this returns an `AreaValueArray`.
If `single` is true and `values` is false, this returns a `Cell`.
If `single` is true and `values` is true, this returns a `CellValue`.

### analyzeFormula() (deprecated)

```ts
analyzeFormula(formula: string, options?: {
    sheetName?: string;
    workbookName?: string | null;
  }): AnalyzeFormulaResult
```

### analyzeAndFixFormula()

```ts
analyzeAndFixFormula(formula: string, options?: {
    sheetName?: string;
    workbookName?: string | null;
  }): AnalyzeFormulaResult
```

### rewriteFormulaAfterMove()

```ts
rewriteFormulaAfterMove(formula: string, from: string | A1Reference, to: string | A1Reference): string
```

- `formula`: formula to update.
- `from`: reference containing a workbook and sheet prefix
- `to`: reference containing a workbook and sheet prefix

Returns: the updated formula.

### errors

```ts
get errors(): ModelError[]
```

### meta

```ts
get meta(): ModelMeta
```

## interface AddWorkbookOptions extends WorkbookOptions

### recalcVolatiles

```ts
recalcVolatiles?: boolean
```

Whether to recalculate volatile cells on init. Assumed true if not specified.

### recalcErrors

```ts
recalcErrors?: boolean
```

Whether to recalculate cells with error values on init. Assumed true if not specified.

### recalcAll

```ts
recalcAll?: boolean
```

Whether to recalculate every formula cell on init.

If unset, defaults to `true` when the workbook's `calculationProperties.fullCalcOnLoad` is
`true` and its `calcMode` is not `"manual"`, mirroring the OOXML
`<calcPr fullCalcOnLoad="1"/>` semantics of ECMA-376 §18.2.2. Setting it explicitly
overrides what the file says, in either direction.

When effective, this runs an `ALL_FORMULA_CELLS` recalc over every workbook in the model,
not just the one being attached --- stronger than {@link recalcVolatiles} or
{@link recalcErrors}. Such a recalc evaluates even deferred data-table cells, so a workbook
with both `calcMode: "autoNoTable"` and `fullCalcOnLoad` has its data tables evaluated once
at load, as in Excel; {@link Model.deferDataTables} still applies to later recalculations.

### extractExpressions

```ts
extractExpressions?: boolean
```

Try to extract repeated expressions; default true

## interface WriteOptions

Options for {@link Model.write} and {@link Model.writeMultiple}.

Writes are persistent edits (equivalent to {@link Workbook.editCell}); they have no transient
mode that can be reverted. Capture a {@link ValueSnapshot} beforehand if you need to undo them.

### forceRecalc

```ts
forceRecalc?: boolean
```

Recalculate every workbook even if no write occurred.

### skipRecalc

```ts
skipRecalc?: boolean
```

Skip the automatic post-write recalculation.

### skipVolatiles

```ts
skipVolatiles?: boolean
```

Recalc with `CHANGED_ONLY` instead of `CHANGED_OR_VOLATILE`, leaving volatile cells alone.

### type RecalculateOptions

```ts
type RecalculateOptions = {
  which?: WhichCellsToRecalculate;
  /** When true, deferred cells are included in this recalculation (but the
   * set of cells to defer is preserved for future recalculations). */
  includeDeferred?: boolean;
}
```

### type RecalcEvent

```ts
type RecalcEvent = RecalcTriggerEvent | RecalcRootEvent | RecalcMarkDirtyEvent | RecalcEnqueueMaybeEvent | RecalcPropagateEvent | RecalcEvaluateEvent | RecalcUnreachedEvent | RecalcReorderEvent | RecalcCycleEvent
```

### type IterationOptions

```ts
type IterationOptions<Boxed extends boolean> = {
  leaveBoxed?: Boxed;
  skipBlanks?: "none" | "unpopulated" | "all";
  collapseRuns?: boolean;
}
```

### const ALL_FORMULA_CELLS

```ts
const ALL_FORMULA_CELLS: unique symbol
```

Recalculate all formula cells unconditionally. This ignores
`RecalcState.deferral.cellsToDefer` --- deferred cells are recalculated like
any other.

### const CHANGED_ONLY

```ts
const CHANGED_ONLY: unique symbol
```

### const CHANGED_OR_VOLATILE

```ts
const CHANGED_OR_VOLATILE: unique symbol
```

## interface ModelMeta

### sources

```ts
sources: {
    id: string;
    name: string;
    update_time: string | undefined;
    cellCount: number;
    volatileCount: number;
  }[]
```

### cellCount

```ts
cellCount: number
```

### volatileCount

```ts
volatileCount: number
```

### graphNodes

```ts
graphNodes: number
```

### graphEdges

```ts
graphEdges: number
```

### type ModelEntity

```ts
type ModelEntity = {
  type: "workbook";
  name: string;
  workbookName: string;
} | {
  type: "sheet";
  name: string;
  workbookName: string;
  sheetName: string;
} | {
  type: "name";
  name: string;
  workbookName: string;
  resolvesTo: string;
} | {
  type: "formula";
  name: string;
  workbookName: string;
} | {
  type: "table";
  name: string;
  workbookName: string;
  sheetName: string;
  resolvesTo: string;
  totals: number;
  headers: number;
}
```

### type ModelEventType

```ts
type ModelEventType = keyof ModelEventArgs
```

Names of all events that {@link Model.on} can subscribe to.

### type ModelEventArgs

```ts
type ModelEventArgs = {
  /**
   * External workbook update from the host environment (e.g. GRID native),
   * announcing that the named workbook should be considered modified at
   * `lastWrite`. Apiary itself does not emit this event; it is forwarded by
   * the host so consumers can invalidate caches.
   */
  "native-update": {
    workbookName: string | undefined;
    workbookId: string | undefined;
    lastWrite: number;
    action: string;
  };
  /**
   * Per-cell recalculation event emitted during {@link Model.recalculate}
   * (one event per recalculated cell, plus phase markers). Subscribe to
   * trace recalculation; see {@link RecalcEvent} for the full payload shape.
   */
  recalcEvent: RecalcEvent;
  /**
   * A {@link ModelError} was raised during a model operation. `seenBefore`
   * is `true` when the same error fingerprint has been emitted previously
   * in this model's lifetime, so consumers can deduplicate repeated errors.
   */
  error: {
    type: string;
    workbookId: string | undefined;
    workbookName: string | undefined;
    error: ModelError;
    seenBefore: boolean;
  }; /** A workbook was attached to the model ({@link Model.addWorkbook} / {@link Model.attachWorkbook}). */
  attach: {
    workbookName: string;
  }; /** A workbook was detached from the model ({@link Model.removeWorkbook}). */
  detach: {
    workbookName: string;
  };
  /**
   * A sheet was added to one of the model's workbooks. Re-emitted from the
   * underlying `Workbook`; subscribing on the model auto-installs the
   * forwarder on every workbook in the model, including those attached
   * after subscription.
   */
  addsheet: {
    workbookName: string;
    sheetName: string;
    index: number;
  }; /** Emitted at the start of {@link Model.recalculate}, before any cell is recalculated. Payload is the model. */
  beforerecalc: Model; /** Emitted at the end of {@link Model.recalculate}. Payload is the model. */
  recalc: Model;
  /**
   * Function-call timing sample (one event per evaluated function or
   * operator) emitted by a workbook during cell evaluation. The model
   * re-emits a workbook's `metrics` events when there are listeners on the
   * model; the wiring is installed on every workbook in the model, including
   * those attached after subscription.
   */
  metrics: MetricsEvent;
}
```

Map from event name to payload shape, indexing the events that
{@link Model.on} can subscribe to. Each entry below documents the trigger
and payload semantics for one event.

```ts
model.on('error', ({ workbookName, error }) => {
  console.warn(`Error in ${workbookName}: ${error.message}`);
});
model.on('recalc', m => console.log('recalc finished', m.id));
```

### type ModelEventListener

```ts
type ModelEventListener<T extends ModelEventType> = (event: ModelEventArgs[T]) => void
```

Type of a listener for a given {@link ModelEventType}. The listener
receives the payload shape declared for that event in
{@link ModelEventArgs}.

## interface EvaluationContext

Context object for formula evaluation. Historically often called `options`
or `opts` when passed to spreadsheet functions and other evaluation-related
functions.

### mode

```ts
mode: ModeBit
```

### rawOutput

```ts
rawOutput?: boolean
```

false (the default) if the result of AST evaluation should be postprocessed (reference resolved, number rounded
to 15 decimal places) before returning it; true to return it as-is.

### coerceNullToZero

```ts
coerceNullToZero: CoercionMode
```

### allowMatrices

```ts
allowMatrices?: boolean
```

false (the default) if a Matrix result should be mapped to a `#VALUE!` error, true to return it as-is.

### allowBoxed

```ts
allowBoxed?: boolean
```

Allow ValueBox values to be returned without unboxing first

### env

```ts
env?: ReadonlyMap<string, MaybeBoxedFormulaArgument>
```

### resolveName

```ts
resolveName: (name: string, sheetName?: string | null, workbookName?: string | null) => DefinedName | FormulaError
```

Get the cell object for the given defined name (matched case-insensitively)
in the indicated scope or in this context. If `sheetName` is given, then
only sheet-scoped defined names will be considered, not workbook-scoped
defined names. If this context permits cross-workbook name resolution, then
a match in the current workbook will be preferred but if no match is found
there, then the first match across all workbooks in model order will be
returned. Passing `workbookName` confines the search to that workbook, as a
reference naming a workbook asks for a name in it and nowhere else. If no
match is found, #NAME? is returned.

### resolveTable

```ts
resolveTable: (name: string, workbookName?: string | null) => Table | null
```

Get the table with the given name (matched case-insensitively) in the
context workbook, or if not found there, then in the first workbook in the
model that contains a table by this name.

### resolveSheet

```ts
resolveSheet: (sheetName?: string | null, workbookName?: string | null) => WorkSheet | null
```

Get the sheet with the given name (matched case-insensitively), or the
first sheet of the context workbook if no name is given. The context
workbook is the default (first) workbook of the model if not evaluating in
the context of a specific workbook.

### resolveWorkbook

```ts
resolveWorkbook: (name?: string | null) => Workbook | undefined
```

Get the workbook with the given case-insensitive `name`, or if no name is
given, the context workbook, or the default (first) workbook of the model
if not evaluating in the context of a specific workbook.

### lambdaBindings

```ts
lambdaBindings?: LambdaBindings
```

Bindings of lambda parameter names to unique symbols, and symbols to the
arguments for those parameters and their evaluation contexts. The layer of
indirection (as opposed to just mapping names directly to arguments) is to
ensure the scoping of lambda parameters: they should be visible in nested
lambda contexts only if _lexically_ in scope, i.e.
`LAMBDA(x, LAMBDA(y, x + y))`, and not e.g. in `LAMBDA(x, OtherLambda(x))`
where `OtherLambda` is defined as `LAMBDA(y, x + y)` ... because in the
latter case, the `x` in `OtherLambda` refers to the _defined name_ `x`, not
the lambda parameter `x` of the calling lambda.

### resolveLambdaArgumentAST

```ts
resolveLambdaArgumentAST?: (param: LambdaParameterSymbol) => ASTNode | undefined
```

Look up an argument expression AST of a lambda call by parameter symbol.
This exists in the context of finding references in a specific lambda call.

### collectReferencesFromLambdaDefinitions

```ts
collectReferencesFromLambdaDefinitions?: boolean
```

True if static references should be collected inside lambda definitions.
Normally that is not done because the act of _defining_ a lambda does not
depend on any values of cells referenced by the lambda (those values will
be looked up only when the defined lambda is _called_). However, when the
static dependencies of a lambda call are too tricky to determine because of
lambdas returning lambdas, we fall back on recording all references, in the
lambda definition and in all arguments of the call to it, and marking them
all conditional. That's done in a sub-context with this property set to
true, to tell the reference analysis to descend into lambda definitions.

### recurseIntoContextDependentNames

```ts
recurseIntoContextDependentNames?: boolean
```

True if reference analysis should recurse into context-dependent defined
names to discover their context-specific dependencies. When a cell references
a defined name whose formula is context-dependent (like `=INDIRECT("B2")`),
the actual dependencies depend on the calling context's sheet. Setting this
to true causes reference analysis to recurse into such names and yield their
context-specific references, in addition to a nonvalue reference to the name
itself.

### visitedContextDependentNames

```ts
visitedContextDependentNames?: Set<string>
```

Set of defined name identifiers that have already been visited during
context-dependent name recursion. Used to prevent infinite recursion when
context-dependent names reference each other (e.g., name1 = ROW() + name2,
name2 = ROW() + name1).

### getWorkbookByKey

```ts
getWorkbookByKey: (key: number) => Workbook | undefined
```

Get the workbook with the given dependency-graph key (based uniquely on the
workbook name in a case-insensitive way by the `wbNameToKey` function).

### isDirtyFormulaCell

```ts
isDirtyFormulaCell?: (cell: CellItem | null) => boolean
```

Check whether the given cell is in a state considered dirty in the current
evaluation context.

### evaluateAST

```ts
evaluateAST: (ast: ASTRootNode, options: EvaluationContext) => MaybeBoxedFormulaValue
```

Evaluate a whole formula, expressed as an AST, in this context.
NOTE: this must be a function, not arrow function, and be invoked on an
evaluation context, so that it captures the correct `this` context.

### evaluateASTNode

```ts
evaluateASTNode: FnEvaluateASTNode
```

Evaluate an expression, expressed as an AST node, in this context.
NOTE: this must be a function, not arrow function, and be invoked on an
evaluation context, so that it captures the correct `this` context.

### evaluateStaticReference

```ts
evaluateStaticReference?: FnEvaluateStaticReferenceASTNode
```

Resolve an AST node to a static reference if possible. Present only on cell-evaluation
contexts. Wraps `evaluateStaticReferenceASTNodeUnbound` so that a function handler can reach it
without importing `evaluate.ts` (forming a runtime import cycle through the function-handler
registry). Named differently from the dependency-analysis `evaluateStaticReferenceASTNode`
resolver even though both wrap the same unbound function: that one is not a field on this
interface, but is bound per dependency-graph traversal and attached to derived contexts through
`{ ...ctx }` spreads, so reusing its name for this field would leak this runtime handle into
dependency analysis and corrupt it. Like the other context functions, must be a function (not
arrow) invoked on the context.

### checkAllReferences

```ts
checkAllReferences?: boolean
```

### singleCell

```ts
singleCell?: boolean
```

True if formulas should be evaluated in single-cell (non-array) mode.
Default false.

### supportedFunctionNames

```ts
supportedFunctionNames?: Set<string>
```

Set of function names supported in GRID (irrespective of mode). Exposed via
the evaluation context to dodge a circular import because the CELL function
needs this set but is imported by the module that populates and exports it.

### workbookName

```ts
workbookName: string | null
```

Name of the workbook containing the reference or formula, null for a GRID
element formula

### sheetName

```ts
sheetName?: string | null
```

Name of the sheet containing the reference or formula, null for references
in workbook-scoped defined-names, and for formulas in GRID elements

### cellId

```ts
cellId?: string | null
```

Unprefixed ID (name or A1 address) of the cell containing the formula being evaluated, null if not evaluating a
cell formula.

### cell

```ts
cell?: CellItem | null
```

Cell object whose formula is being evaluated, or null

### getContextTable

```ts
getContextTable?: () => Table | null
```

Used to resolve the context table for unprefixed structured references (e.g. `=[[#This row], [Column]]`).

### upToDateState

```ts
upToDateState?: number
```

The up-to-date state of the context workbook after the latest completed recalculation, a non-negative integer.
* Cells with `state > upToDateState` and `state < upToDateState + NUM_STATES` are dirty.
* Cells _can_ have `state === upToDateState + NUM_STATES` during recalculation, as that is the new up-to-date state,
 to which the workbook's `upToDateState` attribute will be raised when recalculation completes.
* Cells cannot have `state > upToDateState + NUM_STATES`.

### metricsCallback

```ts
metricsCallback?: null | ((event: MetricsEvent) => void)
```

Callback to report metrics

### recordDependencyUse

```ts
recordDependencyUse?: (ref: Reference) => void
```

Callback to report the use of a dependency in evaluating a formula

### profile

```ts
profile?: Profile | null
```

Profiling information

## interface EvaluateExpressionOptions

### fallBack

```ts
fallBack: Fallback
```

Value to return if expression is null or empty or `=`, or if
`options.single` is true and the expression does not resolve to a single
cell/value.

### definedName

```ts
definedName?: Values extends false ? (Single extends true ? boolean : never) : never
```

True if a single cell is to be returned, and it should be a defined-name
cell if that defined name evaluates to a cell value or array (i.e. not a
reference). If this is true, then `values` is ignored and assumed false,
and `single` is ignored and assumed true.

### values

```ts
values: Values
```

True if bare values are to be returned, false for Cell objects.

### single

```ts
single: Single
```

True if a single cell or value is to be returned; false for a 2-D array of cells or values.

### extraContext

```ts
extraContext?: Partial<EvaluationContext> | null
```

Extra context to pass to `Model.runFormula()`, which is then passed through to the formula runner.

### cropTo

```ts
cropTo?: "any-cell-information" | "cells-with-non-blank-values"
```

How to size the returned area when `single` is false.

- `'any-cell-information'` (the default): return the full populated rectangle, keeping cells
  that carry any data --- values, formulas, or style-only metadata.

- `'cells-with-non-blank-values'`: trim trailing rows and columns whose cells are all
  blank-valued. Cells with no value, empty-string values, or `#N/A` errors all count as blank;
  a blank cell in a merged region (`Cell.M` set) is still treated as data and prevents that
  column or row from being trimmed.

## class ValueSnapshot

A snapshot of every cell's value (and every spill range) in a {@link Model} at the moment
{@link ValueSnapshot.capture} was called. See `capture` and `applyTo` for ownership and reuse
semantics.

#### Scope

Captures and restores cell values (boxed, so number formats are preserved), spill-anchor
matrices, and defined-name values. Cell and defined-name **formulas** are captured as a
fingerprint only - apply uses them to detect a formula change since capture but does NOT
restore them. Styles, the dependency graph, row/column metadata, and sheet structure are
untouched. Structural edits (row/column inserts/deletes, sheet adds/removes/renames,
`moveCells`) are out of scope; for those, use `serializeModel` + `deserializeModel`.

#### Handling of edits between capture and apply

- **Same formula at apply time** (cell or name): captured value is restored directly,
  without re-evaluating. For a spill anchor the captured matrix is swapped in if the live
  spill's extent and mask still match, otherwise a fresh spill node is built and reattached.
  One exception: a cell whose formula produced a scalar at capture but anchors a spill at
  apply time is pushed for the trailing recalc instead; re-evaluation against the restored
  inputs collapses the live spill.
- **Formula state differs** (added, edited, or removed; cell or name): the captured value
  is NOT restored. The cell/name is pushed onto `changedSinceRecalc` so the trailing recalc
  re-evaluates it against the live state, and after all sheets and names are processed, one
  WARNING-level `ModelError` with `type: 'snapshot_formula_mismatch'` is emitted per
  workbook, listing every affected cell/name.
- **Value cells added after capture**: cleared. If `cell.style == null` the Cell is deleted
  outright; if it carries style (user-assigned format, style index, or propagated formula
  format) the Cell is kept with `v = null` so the style survives.
- **Defined names removed after capture** are not recreated. Like other formula-state
  changes the removal records a mismatch (so the WARNING lists the name); since deleting a
  name also removed its graph vertex and edges, apply pushes the name's capture-time direct
  dependents for the trailing recalc instead of walking the live graph.

After processing every entry, apply also pushes the *direct dependents* of every mismatched
vertex so that any matched-formula cell reading from a mismatched cell gets re-evaluated
against the live state. The recalc engine's normal value-change cascade then handles
transitive dependents.

#### Best-effort mismatch detection, not full invariant enforcement

The formula-state check is per-cell: captured `f` vs live `f` at the same position. A
`moveCells` or other structural edit that rearranges cells across positions can leave
applyTo with a *partial revert* - the value-cell halves of the move silently restore /
delete with no WARNING, only the formula-cell halves warn. A matched-formula cell reading
from a mismatched one can also lose its captured value silently: the dependents-of-mismatches
push re-evaluates it against the live state, and it carries no WARNING of its own.
Treat the WARNINGs as a signal that *something* is wrong, not as a complete inventory;
for guaranteed-correct reverts across structural edits, serialise the model.

### ValueSnapshot.capture()

```ts
static capture(model: Model): ValueSnapshot
```

Capture a snapshot of `model`'s current cell values (boxed, so number formats are
preserved), spill matrices, and defined-name values. Cell and defined-name formulas are
captured as a fingerprint only (used by `applyTo` to detect formula changes since
capture). The returned snapshot owns a copy of the data; the model does not retain a
reference, and subsequent edits do not flow into the snapshot.

Capture cost is roughly proportional to the number of cells that have their own `Cell`
instance, plus the populated region of each spill matrix. Cells in the defaulted region of a
whole-column / whole-row spill (e.g. `Sheet1!A:XFD+1`) are intentionally not enumerated.

```ts
const snap = ValueSnapshot.capture(model);
workbook.editCell('A1', { v: 99 });
model.recalculate();
// ... inspect, then revert:
snap.applyTo(model);
```

### applyTo()

```ts
applyTo(model: Model, options?: {
    skipRecalc?: boolean;
    includeDeferred?: boolean;
  }): void
```

Restore `model`'s cell values (and spill ranges) to the snapshot's state, then trigger a
recalculation. See the class docstring for how cases like a formula change at a spill anchor
are handled.

Throws if `model` is not the same instance the snapshot was captured from; workbook keys
are model-scoped, so applying to a different model would silently no-op on every mismatch.

Apply also discards cached-formula defined names (auto-created via
`Workbook.getCachedFormulaCell`) and tears down any dynamic-dependency edges built since
capture, so revert semantics are consistent across the model.

The snapshot is unchanged after the call and can be applied again.

- `options.skipRecalc`: skip the trailing `model.recalculate()`. The caller is then
expected to flush `changedSinceRecalc` itself.
- `options.includeDeferred`: passed through to the trailing `model.recalculate()`. Defaults
to `true` so the post-apply model is fully consistent.

### function serializeModel()

```ts
function serializeModel(model: Model): Buffer<ArrayBufferLike>
```

### function deserializeModel()

```ts
function deserializeModel(data: Buffer): Model
```

## class ModelError extends Error

### ModelError.ERROR

```ts
static readonly ERROR = 3
```

### ModelError.WARNING

```ts
static readonly WARNING = 2
```

### ModelError.NOTICE

```ts
static readonly NOTICE = 1
```

### ModelError.NONE

```ts
static readonly NONE = 0
```

### ModelError.UNKNOWN

```ts
static readonly UNKNOWN = -1
```

### name

```ts
name: string
```

### workbook

```ts
workbook: Workbook | null
```

### origException

```ts
origException: (Error & {
    formula?: string;
    ast?: ASTNode;
  }) | null
```

### type

```ts
type: string
```

### level

```ts
level: Level
```

### vertexIds

```ts
vertexIds: VertexIdSet<CellVertexId | NameVertexId>
```

### new ModelError()

```ts
constructor(message: string, level?: Level, cells?: ConvertibleToVertexIDs, type?: string, origException?: Error | null)
```

- `cells`: indications of cell(s) or defined name(s) associated with the error
- `type`: error type identifier
- `origException`: original exception, included for troubleshooting errors whose reason is unknown

### references

```ts
get references(): Set<string>
```

Returns: set of cell IDs (e.g. `Sheet1!A1`), defined names, and column names for structured sheets

### ModelError.fromCircularDependencyWith()

```ts
static fromCircularDependencyWith(vertexIds: ConvertibleToVertexIDs): ModelError
```

Create a circular dependency error involving the given cells.

- `vertexIds`: vertex IDs of cells (defined names or sheet cells) known to be involved in a dependency cycle

### ModelError.fromUnsupported()

```ts
static fromUnsupported(what: string, neverSupport: boolean, cell: CellItem | NameVertexId | CellVertexId, isOrAre?: "is" | "are", type?: string | null): ModelError
```

Create an error representing something unsupported (a spreadsheet function or other functionality) in a formula

- `what`: the function name or a concise description of the functionality
- `neverSupport`: true if we intend never to support the thing, false if we think we maybe will
- `cell`: the sheet-prefixed cell address or defined name whose formula contains the unsupported thing
- `isOrAre`: whichever verb form makes sense after `what`
- `type`: optional override of the `ModelError` type; the default type is `fn-unsup` if
`neverSupport` is true, else `fn`

### ModelError.fromInvalidCellValueAt()

```ts
static fromInvalidCellValueAt(vertexIds: ConvertibleToVertexIDs): ModelError
```

Create an error about invalid cell values in workbook input in the given cells.

- `vertexIds`: vertex IDs of cells (defined names or sheet cells) in which invalid cell
values were found and replaced with #VALUE!

### valueOf()

```ts
valueOf(): string
```

### toString()

```ts
toString(): string
```

### toJSON()

```ts
toJSON(): object
```

Produce a representation of this error for JSON serialization.
Adds the non-enumerable properties `message` and `origException` (the latter only if set),
and makes `cells` an array.
Despite the name, this does not return a JSON string, it returns an object to stringify instead of this one, see
[MDN `JSON.stringify` `toJSON` behavior][1].

[1]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify#tojson_behavior

Returns: an object that will JSON.stringify more usefully than this instance.

