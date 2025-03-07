import { Sheet } from "../excel.js";
import { Scroll } from "./scroll.js"; // Assuming Scroll is imported from scroll.ts
import { SparseMatrix, Cell } from "../../dataStructure/sparseMatrix.js";
import { SheetRendrer } from "./sheetrendrer.js";
import {  GridHeaderManager } from "./GridManager.js";
import  {IGridHeaderCell} from "../../dataStructure/interfaces.js"
import { mainCellManager } from "../../feature/mainCellFeature/mainCellManager.js";

export class Helper {
  private scroll: Scroll;
  private sheetRendrer: SheetRendrer;
  public sheet: Sheet;
  private SparseMatrix: SparseMatrix;
  private IGridHeaderCell!: IGridHeaderCell;
  private GridHeaderManager?: GridHeaderManager;
  public canvases: { [key: string]: HTMLCanvasElement };
  public contexts: { [key: string]: CanvasRenderingContext2D };
  public verticalScroll?: {
    scroll: HTMLElement | null;
    bar: HTMLElement | null;
  };
  public horizontalScroll?: {
    scroll: HTMLElement | null;
    bar: HTMLElement | null;
  };
  public resizeObserver?: ResizeObserver;
  public totalRow: number;
  public totalCol: number;
  public zoomIndex: number;
  public minZoom: number = 0.1;
  public maxZoom: number = 5;
  public loadedRows: number = 0;
  public loadedCols: number = 0;
  public mainCellManager!: mainCellManager;

  constructor(Sheet: Sheet) {
    this.sheet = Sheet;
    this.totalRow = 100;
    this.totalCol = 60;
    this.canvases = {};
    this.contexts = {};
    this.zoomIndex = 1;
    this.initCanvases();
    this.SparseMatrix = new SparseMatrix();
    this.GridHeaderManager = new GridHeaderManager(
      this,
      this.canvases.spreadsheet.clientWidth,
      this.canvases.spreadsheet.clientHeight,
      this.zoomIndex,
      this.totalRow,
      this.totalCol
    );
    this.scroll = new Scroll(this);
    this.sheetRendrer = new SheetRendrer(this);
    this.scroll.setRenderer(this.sheetRendrer);
    this.initiatefeature();
  }

  private initiatefeature() {
    // to add helper to feature classes
    this.mainCellManager = new mainCellManager(this);
  }

  private initCanvases() {
    ["spreadsheet", "vertical", "horizontal"].forEach((type) => {
      const canvas = document.getElementById(
        `${type}Canvas_${this.sheet.row}_${this.sheet.col}_${this.sheet.index}`
      ) as HTMLCanvasElement;

      if (!canvas) {
        throw new Error(
          `Canvas not found: ${type}Canvas_${this.sheet.row}_${this.sheet.col}_${this.sheet.index}`
        );
      }
      this.canvases[type] = canvas;
      this.contexts[type] = canvas.getContext("2d")!;
    });

    this.verticalScroll = {
      scroll: document.getElementById(
        `verticalScroll_${this.sheet.row}_${this.sheet.col}_${this.sheet.index}`
      ),
      bar: document.getElementById(
        `verticalBar_${this.sheet.row}_${this.sheet.col}_${this.sheet.index}`
      ),
    };

    this.horizontalScroll = {
      scroll: document.getElementById(
        `horizontalScroll_${this.sheet.row}_${this.sheet.col}_${this.sheet.index}`
      ),
      bar: document.getElementById(
        `horizontalBar_${this.sheet.row}_${this.sheet.col}_${this.sheet.index}`
      ),
    };
  }

  public getCanvases() {
    return this.canvases;
  }

  public getContexts(){
    return this.contexts;
  }

  public loadMoreContent(
    direction: "vertical" | "horizontal"
  ): boolean | undefined {
    return this.GridHeaderManager?.loadMoreContent(direction);
  }

  public getScrollbarRatio(direction: "vertical" | "horizontal") {
    return this.GridHeaderManager?.getScrollbarRatio(direction);
  }

  public numberToColumnName(num: number): string {
    let columnName = "";
    while (num > 0) {
      num--;
      columnName = String.fromCharCode(65 + (num % 26)) + columnName;
      num = Math.floor(num / 26);
    }
    return columnName;
  }

  public letterToNumber(letter: string): number {
    return letter
      .split("")
      .reduce(
        (number, char) =>
          number * 26 + (char.charCodeAt(0) - "A".charCodeAt(0) + 1),
        0
      );
  }

  public getCell(x: number, y: number): Cell | null {
    return this.SparseMatrix.getCell(x, y);
  }

  public getRowColofExcel(): { row: number; col: number; index: number } {
    return {
      row: this.sheet.row,
      col: this.sheet.col,
      index: this.sheet.index,
    };
  }

  public updateZoomIndex(
    viewportWidth: number,
    viewportHeight: number,
    zoomIndex: number
  ): void {
    this.zoomIndex = zoomIndex;
    this.GridHeaderManager?.update(
      viewportWidth,
      viewportHeight,
      this.zoomIndex
    );
  }

  public updateCells(): void {
    this.GridHeaderManager?.generateNewCells();
  }

  public getRowheader(): { [key: number]: Cell | undefined } {
    return this.SparseMatrix.rowHeaders;
  }
  public setValue(rows: string[][]): void {
    rows.forEach((row, rowIndex) => {
      row.forEach((cellValue, colIndex) => {
        if (cellValue !== null && cellValue !== undefined && cellValue !== "") {
          // Ensure the row and column exist in SparseMatrix
          this.SparseMatrix.addRowInBetween(rowIndex);
          this.SparseMatrix.addColumnInBetween(colIndex);

          // Get the cell at rowIndex
          let existingCell = this.SparseMatrix.rowHeaders[rowIndex];

          // If no cell exists in the row, create it
          if (!existingCell) {
            existingCell = new Cell(rowIndex, colIndex, cellValue);
            this.SparseMatrix.rowHeaders[rowIndex] = existingCell;
          }

          // Check if the cell exists in the current row for this column
          let currentCell: Cell | undefined = existingCell;
          while (currentCell) {
            if (currentCell.colValue === colIndex) {
              // If the cell exists, update its value
              currentCell.value = cellValue;
              break;
            }
            currentCell = currentCell.nextCol; // Move to the next column in the row
          }

          // If the column does not exist, add a new cell for the column in this row
          if (!currentCell) {
            const newCell = new Cell(rowIndex, colIndex, cellValue);
            this.SparseMatrix.addColumnInBetween(rowIndex);
            this.SparseMatrix.addRowInBetween(colIndex);
          }
        }
      });
    });

  }

  public updateDrawForFeatures(): void {
    this.mainCellManager.updatepositions();
  }

  public getScrollRatio(direction: "horizontal" | "vertical"): number {
    // Determine the ID of the scroll element based on the direction
    const scrollElementId =
      direction === "horizontal"
        ? `horizontalScroll_${this.sheet.row}_${this.sheet.col}_${this.sheet.index}`
        : `verticalScroll_${this.sheet.row}_${this.sheet.col}_${this.sheet.index}`;

    // Get the scroll element by its ID
    const scrollElement = document.getElementById(scrollElementId);

    // Check if the element exists
    if (!scrollElement) {
      throw new Error(`${direction} scroll element not found.`);
    }

    // Ensure the element is of type HTMLElement
    if (!(scrollElement instanceof HTMLElement)) {
      throw new Error(
        `${direction} scroll element is not a valid HTMLElement.`
      );
    }

    // Determine maxScroll based on the direction
    const maxScroll =
      direction === "horizontal"
        ? this.scroll.maxScrollX
        : this.scroll.maxScrollY;
      
    // Get the relevant dimension based on direction
    const clientSize =
    direction === "horizontal"
        ? scrollElement.clientWidth
        : scrollElement.clientHeight;

    // Calculate and return the scroll ratio
    return clientSize / (clientSize + maxScroll);
  }

  public getScroll(): { x: number; y: number } {
    return this.scroll.getScroll();
  }

  // Customize scroll

  public Scroll(x: number, y: number): void {
    this.scroll.scroll(x, y);
  }

  // update the max scroll by getting new width and height from grid header manager
  updateMaxScroll() {
    const totalWidth = this.GridHeaderManager!.getTotalContainerWidth();
    const totalHeight = this.GridHeaderManager!.getTotalContainerHeight();
    const visibleWidth = this.canvases.spreadsheet.clientWidth;
    const visibleHeight = this.canvases.spreadsheet.clientHeight;
    this.scroll.updateMaxScroll(
      totalWidth,
      totalHeight,
      visibleWidth,
      visibleHeight
    );
  }

  getTotalWidth(): number {
    return this.GridHeaderManager!.getTotalContainerWidth();
  }

  getTotalHeight(): number {
    return this.GridHeaderManager!.getTotalContainerHeight();
  }

  //Get Horizontal header cells
  getHorizontalHeaderCells(scrollX: number): IGridHeaderCell[] {
    return this.GridHeaderManager!.getHeaderCellsHorizontal(scrollX);
  }

  // Get Vertical header cells
  getVerticalHeaderCells(scrollY: number): IGridHeaderCell[] {
    return this.GridHeaderManager!.getHeaderCellsVertical(scrollY);
  }

  draw() {
    this.sheetRendrer.draw();
  }

  public binarySearch(
    cells: IGridHeaderCell[],
    value: number,
    property: string
  ) {
    let low = 0;
    let high = cells.length - 1;

    while (low <= high) {
      const mid = Math.floor((low + high) / 2);
      const cell = cells[mid];
      const x = property === "x" ? cell.x : cell.y;

      if (
        x <= value &&
        value < x + (property === "x" ? cell.width : cell.height)
      ) {
        return mid;
      } else if (x > value) {
        high = mid - 1;
      } else {
        low = mid + 1;
      }
    }

    return low;
  }

  public setCell(rowNumber:number, columnNumber:number, value:string | null){
    this.SparseMatrix.setCell(rowNumber, columnNumber, value)
  }
}