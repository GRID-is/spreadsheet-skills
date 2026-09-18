<!-- GENERATED FILE. Do not edit by hand. Regenerate with `npm run sync`. -->

# @grid-is/spreadsheet-viewer API

Generated from `@grid-is/spreadsheet-viewer@3.0.5` (`dist/index.d.ts`). Every public symbol listed here exists in that version. If the installed version differs, read `node_modules/@grid-is/spreadsheet-viewer/dist/index.d.ts` instead; it is the source of truth.

### function SpreadsheetViewer()

```ts
function SpreadsheetViewer({ model, fontConfig, theme, showErrorTooltips, initialSelection, onChange, showFormulaReferencesOnCellSelection, }: SpreadsheetViewerProps): JSX.Element
```

## class A1Ref

Represents an A1-style cell or range reference with optional workbook and sheet context

### range

```ts
range: Range
```

The range coordinates

### workbookName

```ts
workbookName: string
```

Name of the workbook containing this reference

### sheetName

```ts
sheetName: string
```

Name of the sheet containing this reference

### new A1Ref()

```ts
constructor(range: string | Range | A1Ref, context?: RefContext)
```

Creates a new A1Ref instance

- `range`: - A string reference (e.g., "A1", "Sheet1!A1:B2"), Range object, or existing A1Ref to clone
- `context`: - Optional context providing workbook and sheet names

### left

```ts
get left(): number
```

Gets the left column index

### right

```ts
get right(): number
```

Gets the right column index

### top

```ts
get top(): number
```

Gets the top row index

### bottom

```ts
get bottom(): number
```

Gets the bottom row index

### height

```ts
get height(): number
```

Gets the height of the range (number of rows)

### width

```ts
get width(): number
```

Gets the width of the range (number of columns)

### toString()

```ts
toString(): string
```

Converts the reference to its A1 string representation

Returns: The A1-style string representation (e.g., "Sheet1!A1:B2")

### type Model

```ts
type Model = SpreadsheetEditorBaseProps["model"]
```

### type ViewerEvent

```ts
type ViewerEvent = SelectionChangeEvent | SheetChangeEvent
```

### type ViewerEventType

```ts
type ViewerEventType = "selection-change" | "sheet-change"
```

### function createSelectionChangeEvent()

```ts
function createSelectionChangeEvent(range: Range, sheetName: string): SelectionChangeEvent
```

### function createSheetChangeEvent()

```ts
function createSheetChangeEvent(sheetName: string, previousSheetName: string): SheetChangeEvent
```

