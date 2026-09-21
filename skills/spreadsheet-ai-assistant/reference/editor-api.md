<!-- GENERATED FILE. Do not edit by hand. Regenerate with `npm run sync`. -->

# @grid-is/spreadsheet-editor API

Generated from `@grid-is/spreadsheet-editor@0.6.0` (`dist/index.d.ts`). Every public symbol listed here exists in that version. If the installed version differs, read `node_modules/@grid-is/spreadsheet-editor/dist/index.d.ts` instead; it is the source of truth.

### function SpreadsheetEditor()

```ts
function SpreadsheetEditor(props: SpreadsheetEditorProps): import("react").JSX.Element
```

## interface AddSheetEvent

### type

```ts
type: "add-sheet"
```

### sheetName

```ts
sheetName: string
```

### timestamp

```ts
timestamp: number
```

## interface ClearCellsEvent

### type

```ts
type: "clear-cells"
```

### sheetName

```ts
sheetName: string
```

### range

```ts
range: string
```

### timestamp

```ts
timestamp: number
```

## interface DeleteColumnsEvent

### type

```ts
type: "delete-columns"
```

### sheetName

```ts
sheetName: string
```

### startColumn

```ts
startColumn: string
```

### count

```ts
count: number
```

### timestamp

```ts
timestamp: number
```

## interface DeleteRowsEvent

### type

```ts
type: "delete-rows"
```

### sheetName

```ts
sheetName: string
```

### startRow

```ts
startRow: number
```

### count

```ts
count: number
```

### timestamp

```ts
timestamp: number
```

## interface DeleteSheetEvent

### type

```ts
type: "delete-sheet"
```

### sheetName

```ts
sheetName: string
```

### timestamp

```ts
timestamp: number
```

### type EditorEvent

```ts
type EditorEvent = ViewerEvent | WriteCellEvent | PasteEvent | ClearCellsEvent | FormatCellsEvent | FillEvent | InsertRowEvent | InsertColumnEvent | DeleteRowsEvent | DeleteColumnsEvent | DeleteCellsEvent | InsertCellsEvent | MoveRowsEvent | MoveColumnsEvent | MoveCellsEvent | ResizeRowEvent | ResizeColumnEvent | AddSheetEvent | DeleteSheetEvent | RenameSheetEvent
```

Union of all events emitted by the editor via the `onChange` callback.

### type EditorEventType

```ts
type EditorEventType = EditorEvent["type"]
```

Discriminator values for {@link EditorEvent}.

## interface FillEvent

### type

```ts
type: "fill"
```

### sheetName

```ts
sheetName: string
```

### sourceRange

```ts
sourceRange: string
```

### targetRange

```ts
targetRange: string
```

### timestamp

```ts
timestamp: number
```

## interface FontConfig

### baseUrl

```ts
baseUrl?: BaseURL
```

### fontFilter

```ts
fontFilter?: FontFilter
```

## interface FormatCellsEvent

### type

```ts
type: "format-cells"
```

### sheetName

```ts
sheetName: string
```

### range

```ts
range: string
```

### format

```ts
format: Style
```

### timestamp

```ts
timestamp: number
```

## interface InsertColumnEvent

### type

```ts
type: "insert-column"
```

### sheetName

```ts
sheetName: string
```

### column

```ts
column: string
```

### direction

```ts
direction: "left" | "right"
```

### timestamp

```ts
timestamp: number
```

## interface InsertRowEvent

### type

```ts
type: "insert-row"
```

### sheetName

```ts
sheetName: string
```

### row

```ts
row: number
```

### direction

```ts
direction: "top" | "bottom"
```

### timestamp

```ts
timestamp: number
```

## interface MoveCellsEvent

### type

```ts
type: "move-cells"
```

### sheetName

```ts
sheetName: string
```

### fromRange

```ts
fromRange: string
```

### toRange

```ts
toRange: string
```

### timestamp

```ts
timestamp: number
```

## interface MoveColumnsEvent

### type

```ts
type: "move-columns"
```

### sheetName

```ts
sheetName: string
```

### fromRange

```ts
fromRange: string
```

### toRange

```ts
toRange: string
```

### timestamp

```ts
timestamp: number
```

## interface MoveRowsEvent

### type

```ts
type: "move-rows"
```

### sheetName

```ts
sheetName: string
```

### fromRange

```ts
fromRange: string
```

### toRange

```ts
toRange: string
```

### timestamp

```ts
timestamp: number
```

### type OnChange

```ts
type OnChange = (event: EditorEvent) => void
```

- `event`: - The event describing what changed.

## interface PasteEvent

### type

```ts
type: "paste"
```

### sheetName

```ts
sheetName: string
```

### range

```ts
range: string
```

### timestamp

```ts
timestamp: number
```

## interface RenameSheetEvent

### type

```ts
type: "rename-sheet"
```

### oldName

```ts
oldName: string
```

### newName

```ts
newName: string
```

### timestamp

```ts
timestamp: number
```

## interface ResizeColumnEvent

### type

```ts
type: "resize-column"
```

### sheetName

```ts
sheetName: string
```

### column

```ts
column: string
```

### width

```ts
width: number
```

### timestamp

```ts
timestamp: number
```

## interface ResizeRowEvent

### type

```ts
type: "resize-row"
```

### sheetName

```ts
sheetName: string
```

### row

```ts
row: number
```

### height

```ts
height: number
```

### timestamp

```ts
timestamp: number
```

## interface SelectionChangeEvent

Fired when the active cell selection changes.

### type

```ts
type: "selection-change"
```

### selection

```ts
selection: string
```

The new selection in A1 notation (e.g. `"B2"` or `"A1:C3"`).

### timestamp

```ts
timestamp: number
```

Unix-epoch millisecond timestamp of when the change occurred.

## interface SheetChangeEvent

Fired when the user switches to a different sheet.

### type

```ts
type: "sheet-change"
```

### sheetName

```ts
sheetName: string
```

Name of the sheet that is now active.

### previousSheetName

```ts
previousSheetName: string
```

Name of the sheet that was previously active.

### timestamp

```ts
timestamp: number
```

Unix-epoch millisecond timestamp of when the change occurred.

## interface SpreadsheetEditorController

### focus

```ts
focus: (ref?: string) => void
```

### highlightRefs

```ts
highlightRefs: (refs: string[], timeInMs?: number) => void
```

### selectCells

```ts
selectCells: (ref: string) => void
```

### selectSheet

```ts
selectSheet: (sheetName: string) => void
```

### type SpreadsheetModel

```ts
type SpreadsheetModel = {
  getWorkbook: (name?: string | null) => SpreadsheetWorkbook | undefined | null;
}
```

## interface SpreadsheetSize

Size constraints for the spreadsheet grid.

Values are 0-based indices representing the last navigable row or column.
For example, `maxRows: 99` allows rows 0–99 (100 rows total).

Defaults to Apiary maximums (follows Excel conventions).
Values exceeding these are silently capped.
To remove a constraint, omit the property.

### maxRows

```ts
maxRows?: number
```

0-based index of the last navigable row (e.g. 99 means 100 rows).

### maxCols

```ts
maxCols?: number
```

0-based index of the last navigable column (e.g. 99 means 100 columns).

### type SpreadsheetWorkbook

```ts
type SpreadsheetWorkbook = Workbook & {
  getSheets: () => WorkSheet[];
}
```

### type ViewerEvent

```ts
type ViewerEvent = SelectionChangeEvent | SheetChangeEvent
```

Union of navigation events emitted by the viewer via the `onChange` callback.

### type ViewerEventType

```ts
type ViewerEventType = ViewerEvent["type"]
```

Discriminator values for {@link ViewerEvent}.

## interface WriteCellEvent

### type

```ts
type: "write-cell"
```

### sheetName

```ts
sheetName: string
```

### cellId

```ts
cellId: string
```

### value

```ts
value: string
```

### timestamp

```ts
timestamp: number
```

