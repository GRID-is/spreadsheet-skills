<!-- GENERATED FILE. Do not edit by hand. Regenerate with `npm run sync`. -->

# Formula parsing, function catalogue and modes

Generated from `@grid-is/spreadsheet-engine@17.1.0` (`dist/index.d.ts`). Every public symbol listed here exists in that version. If the installed version differs, read `node_modules/@grid-is/spreadsheet-engine/dist/index.d.ts` instead; it is the source of truth.

Introspection over the formula language: the catalogue of supported worksheet functions, the parser, volatile functions, the Excel and Google Sheets modes, and the reference-rewriting helpers.

### function functionSignatures()

```ts
function functionSignatures(mode?: ModeType): PublicFunctionSignatures
```

Return details on supported worksheet functions.

This converts terse internal signatures into a data structure for public (external) consumption.
The function signatures are filtered so they only include functions supported by Apiary.

- `mode`: Filter returned functions to only include those available in
the given mode(s). Default is no filter.

### const parseFormula

```ts
let parseFormula: FnParseFormula | null
```

Formula parser function, if formula parser has finished (asynchronously) importing, else null.
This can be called from synchronous code which itself is guaranteed to be executed only after the formula parser
has finished importing. The caller is then responsible for enforcing that guarantee, and/or documenting that _its_
callers must enforce it, and/or guarding against this being `null` with appropriate error handling.

### const formulaParserReady

```ts
const formulaParserReady: Promise<{
  parse: FnParseFormula;
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

Promise which can be awaited in asynchronous code to ensure that the formula parser has finished importing.

### const functions

```ts
const functions: Handlers
```

### const VOLATILES

```ts
const VOLATILES: Set<string>
```

### const MODE_EXCEL

```ts
const MODE_EXCEL: WorkbookMode
```

### const MODE_GOOGLE

```ts
const MODE_GOOGLE: WorkbookMode
```

### const MODE_GRID_SHEET

```ts
const MODE_GRID_SHEET: WorkbookMode
```

### const MODE_CANVAS

```ts
const MODE_CANVAS: ModeBit
```

### const MODE_ALL

```ts
const MODE_ALL: ModeType
```

### const TYPE_ALL

```ts
const TYPE_ALL: number
```

### const TYPE_ARRAY

```ts
const TYPE_ARRAY = 128
```

### const TYPE_BLANK

```ts
const TYPE_BLANK = 2
```

### const TYPE_BOOL

```ts
const TYPE_BOOL = 16
```

### const TYPE_ERROR

```ts
const TYPE_ERROR = 1
```

### const TYPE_LAMBDA

```ts
const TYPE_LAMBDA = 256
```

### const TYPE_MISSING

```ts
const TYPE_MISSING = 4
```

### const TYPE_NONE

```ts
const TYPE_NONE = 0
```

### const TYPE_NUM

```ts
const TYPE_NUM = 8
```

### const TYPE_RANGE

```ts
const TYPE_RANGE = 64
```

### const TYPE_STRING

```ts
const TYPE_STRING = 32
```

### const getReplaceSheetReferencesFn

```ts
const getReplaceSheetReferencesFn: () => Promise<ReplaceSheetReferencesFn>
```

Make a function that replaces sheet names in formulas in a syntactically
sound way. That means:
(a) it will only affect occurrences of the previous name in reference
    prefixes (not e.g. in string literals), and only in those reference
    prefixes that have the given workbook name, or (if `includeNoWb` is true)
    have no workbook name.
(b) it takes quoting into account, including changing references to/from
    quoted form as appropriate.
(c) it matches sheet names and workbook names case-insensitively.

This is an async factory for such a function because we need to dynamically
import the waspiary module which is the actual implementation. The returned
function is synchronous.

The returned function throws `FormulaSyntaxError` if the given `formula` is
not parseable to begin with.

### const getReplaceTableReferencesFn

```ts
const getReplaceTableReferencesFn: () => Promise<ReplaceTableReferencesFn>
```

Make a function that replaces table names in structured references in
formulas in a syntactically sound way. That means:
(a) it will only affect occurrences of the previous table name in structured
    references, and only in those structured references which have the given
    workbook name, or (if `includeNoWb` is true) have no workbook name.
(c) it matches workbook names and table names case-insensitively.

This is an async factory for such a function because we need to dynamically
import the waspiary module which is the actual implementation. The returned
function is synchronous.

The returned function throws `FormulaSyntaxError` if the given `formula` is
not parseable to begin with.

### const getReplaceWorkbookFn

```ts
const getReplaceWorkbookFn: () => Promise<ReplaceWorkbookReferencesFn>
```

Make a function that replaces workbook names in formulas in a syntactically
sound way. That means:
(a) it will only affect occurrences of the previous name in reference
    prefixes (not e.g. in string literals)
(b) it takes quoting into account, including changing references to/from
    quoted form as appropriate.
(c) it matches workbook names case-insensitively.

This is an async factory for such a function because we need to dynamically
import the waspiary module which is the actual implementation. The returned
function is synchronous.

The returned function throws `FormulaSyntaxError` if the given `formula` is
not parseable to begin with.

### type ReplaceSheetReferencesFn

```ts
type ReplaceSheetReferencesFn = (formula: string, fromName: string, toName: string, workbookName: string, includeNoWb?: boolean) => string
```

Rewrite the given formula, replacing references to a given sheet with a new
sheet name.

- `formula`: formula to rewrite
- `fromName`: existing sheet name to match (case-insensitive)
- `toName`: new sheet name to replace `fromName` with
- `workbookName`: workbook name (case-insensitive) in which to replace
sheet references; reference prefixes with a different workbook name will be
left unchanged
- `includeNoWb`: true to replace sheet name in reference prefixes
that do not specify a workbook name

### type ReplaceTableReferencesFn

```ts
type ReplaceTableReferencesFn = (formula: string, fromName: string, toName: string, workbookName: string, includeNoWb?: boolean) => string
```

Rewrite the given formula, replacing a given table name in structured
references with a new table name.

- `formula`: formula to rewrite
- `fromName`: existing table name to match (case-insensitive)
- `toName`: new table name to replace `fromName` with
- `workbookName`: workbook name (case-insensitive) in which to replace
table references; reference prefixes with a different workbook name will be
left unchanged
- `includeNoWb`: true to replace table name in structured references
that do not specify a workbook name

### type ReplaceWorkbookReferencesFn

```ts
type ReplaceWorkbookReferencesFn = (formula: string, fromWorkbookName: string, toWorkbookName: string) => string
```

Rewrite the given formula, replacing references to a given workbook with a
new workbook name.

- `formula`: formula to rewrite
- `fromWorkbookName`: existing workbook name to match (case-insensitive)
- `toWorkbookName`: new workbook name to replace `fromWorkbookName` with

## class FormulaSyntaxError extends Error

Error thrown when formula parsing fails because of incorrect or unsupported
syntax in the formula.

### name

```ts
name: string
```

### valueOf()

```ts
valueOf(): string
```

### toString()

```ts
toString(): string
```

### toFormulaError()

```ts
toFormulaError(): ReturnType<typeof ERROR_NAME.detailed>
```

## class EvaluationError extends Error

Low-level error in formula evaluation. The contents should be assumed to be
inappropriate to show to end users, should be adorned with the formula and
full parsed AST when bubbling up the stack, and should be reported to us for
troubleshooting.

### name

```ts
name: string
```

### ast

```ts
ast: ASTNode | undefined
```

### formula

```ts
formula: string | undefined
```

### mode

```ts
mode: ModeBit | undefined
```

### new EvaluationError()

```ts
constructor(message: string | undefined, ast?: ASTNode, formula?: string, mode?: ModeBit)
```

