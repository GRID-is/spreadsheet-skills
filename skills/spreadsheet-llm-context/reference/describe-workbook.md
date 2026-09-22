<!-- GENERATED FILE. Do not edit by hand. Regenerate with `npm run sync`. -->

# describeWorkbook: labelled inputs, outputs and data regions

Generated from `@grid-is/spreadsheet-engine@17.1.1` (`dist/index.d.ts`). Every public symbol listed here exists in that version. If the installed version differs, read `node_modules/@grid-is/spreadsheet-engine/dist/index.d.ts` instead; it is the source of truth.

`describeWorkbook(workbook)` analyses a workbook and returns labelled parameters (inputs), calculated cells (outputs) and data islands with detected headers. `toString()` gives a plain-text description suitable for a prompt.

### function describeWorkbook()

```ts
function describeWorkbook(wb: Workbook, options?: Partial<DescriptionOptions>): WorkbookDescription
```

## class WorkbookDescription

### workbook

```ts
workbook: Workbook
```

### totalFormulas

```ts
totalFormulas: number
```

### sheets

```ts
sheets: SheetDescription[]
```

### names

```ts
names: DefinedNameDescription[]
```

### calculated

```ts
calculated: ChunkNode[]
```

### parameters

```ts
parameters: Parameter[]
```

### summary

```ts
summary: ReturnType<WorkbookDescription["setSummary"]>
```

### chunkedGraph

```ts
chunkedGraph: DependencyGraph<ChunkNode, KnownVertexId>
```

### cellR1C1formula

```ts
cellR1C1formula: DefaultMap<CellItem, string | null>
```

### labels

```ts
labels: Array<Label>
```

### options

```ts
options: DescriptionOptions
```

### formulaRangeRTrees

```ts
formulaRangeRTrees: DefaultMap<number, RTree<RangeFormulaNode>>
```

### new WorkbookDescription()

```ts
constructor(wb: Workbook, options?: Partial<DescriptionOptions>)
```

### toString()

```ts
toString(): string
```

### setSummary()

```ts
setSummary(): {
    description: string;
    parameters: {
      labels: string[];
      reference: string;
      referenceLabel: string;
      value: string | null;
      type: string;
    }[];
    calculated: {
      labels: string[];
      referenceLabel: string;
      reference: string;
      type: string;
    }[];
    wbId: string;
  } | null
```

### extractAllText()

```ts
extractAllText(): Set<string>
```

### describeValues()

```ts
describeValues(lab: Labeled): string | undefined
```

### isParameter()

```ts
isParameter(vertexId: CellVertexId, sheetIndex: number): boolean
```

### likelyLabels()

```ts
likelyLabels(vertexId: KnownVertexId): ReadonlyArray<Label>
```

### cellReference()

```ts
cellReference(vertexId: CellVertexId | NameVertexId): Reference | undefined
```

### getCellLabel()

```ts
getCellLabel(cellOrRef: CellItem | Reference): string
```

### getParameter()

```ts
getParameter(cellOrRef: CellItem | Reference): Parameter | undefined
```

### getCalculated()

```ts
getCalculated(cellOrRef: CellItem | Reference): ChunkNode | undefined
```

### labelString

```ts
labelString: (label: Label) => string
```

### type Parameter

```ts
type Parameter = Labeled & {
  /** The cell may be null if the cell address is depended on but is not populated in the workbook */ cell: Cell | null; /** More specific type than in `Labeled`, as parameters are sheet cells */
  vertexId: CellVertexId;
}
```

A single non-formula cell that is depended on by some formula and does not
appear to be part of a data range, so likely makes sense to apply a value to.

