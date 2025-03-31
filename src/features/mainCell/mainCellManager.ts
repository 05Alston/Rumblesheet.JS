import {
  DEFAULT_CANVAS_TEXT_ALIGN,
  DEFAULT_CELL_BG_COLOR,
  DEFAULT_CELL_WIDTH,
  DEFAULT_FONT_SIZE,
  DEFAULT_MIN_PADDING_IN_CELL,
} from "../../data/constants.js";
import { ETextBaseLine } from "../../data/enums.js";
import { IGridHeaderCell } from "../../data/interfaces.js";
import { Helper } from "../../excel/helper/helper.js";
import { SheetMaker } from "../../excel/controllers/sheetMaker.js";
import { Selection } from "./selection/selection.js";

export class MainCellManager extends Helper {
  public input!: HTMLElement | null;
  private selectionCell!: Selection;

  constructor(sheet: SheetMaker) {
    super(sheet);
    this.initiateFeature();
    this.setupInputEventListener();
  }

  private setupInputEventListener() {
    const { row, col, index } = this.sheet;
    const input = document.getElementById(`input_${row}_${col}_${index}`);

    if (input) {
      input.addEventListener("input", (event: Event) => {
        this.handleInputChange(event);
      });
      input.addEventListener("keydown", (event: Event) => {
        this.handleKeyDown(event);
      });
      input.addEventListener("blur", (event: Event) => {
        this.handleInputBlur(event);
      });
    } else {
      console.error("Input element not found");
    }
  }

  private handleInputChange(event: Event) {
    if (this.selectionCell.selectedCells) {
      const { row, column } = this.selectionCell.selectedCells[0];
      const value = (event.target! as HTMLElement).innerText;

      const rowNumber = row!.row;
      const columnNumber = column!.col;

      // Update SparseMatrix with new value
      this.setCell(rowNumber, columnNumber, value);
    } else {
      console.warn("No cell is currently selected.");
    }
    const element = event.target as HTMLElement;

    if (element.scrollHeight > element.offsetHeight) {
      let currentWidth = parseInt(element.style.width) || element.offsetWidth;
      element.style.width = `${currentWidth + DEFAULT_CELL_WIDTH}px`;
    }
  }

  private handleKeyDown(event: Event) {
    if ((event as KeyboardEvent).key === "Enter") {
      console.log(event);
      // this.updateCellValue(event.value);
      // this.cellFunctionality.selectedCell = null;
      // this.sheetRenderer.draw();
    }
  }

  private handleInputBlur(event: Event) {
    this.updateCellValue((event!.target as HTMLElement).innerText);
    this.selectionCell.selectedCells[0].cell = null;
  }

  public updateCellValue(value: string | null) {
    if (this.selectionCell.selectedCells[0]) {
      const { row, column } = this.selectionCell.selectedCells[0];
      const rowNumber = row!.row;
      const columnNumber = column!.col;
      this.setCell(rowNumber, columnNumber, value);
    }
  }

  private initiateFeature() {
    // For adding new feature call here
    this.selectionCell = new Selection(this);
  }

  public getCanvasCoordinates(event: PointerEvent) {
    const rect = this.canvases.spreadsheet.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const { x: scrollX, y: scrollY } = this.getScroll();

    // Adjust for scaling and scrolling
    return {
      x: x + scrollX * this.zoomIndex,
      y: y + scrollY * this.zoomIndex,
    };
  }

  public getCellFromCoordinates(
    x: number,
    y: number
  ): { column: IGridHeaderCell; row: IGridHeaderCell } | null {
    const horizontalHeaderCells = this.getHorizontalHeaderCells(x);
    const verticalHeaderCells = this.getVerticalHeaderCells(y);

    const column = horizontalHeaderCells.find(
      (cell) => x >= cell.x && x < cell.x + cell.width
    );
    const row = verticalHeaderCells.find(
      (cell) => y >= cell.y && y < cell.y + cell.height
    );

    return column && row ? { column, row } : null;
  }

  public getCellsFromRect(
    startPoint: { x: number; y: number },
    endPoint: { x: number; y: number }
  ) {
    const horizontalHeaderCells = this.getHorizontalHeaderCells(0);
    const verticalHeaderCells = this.getVerticalHeaderCells(0);

    const left = Math.min(startPoint.x, endPoint.x);
    const right = Math.max(startPoint.x, endPoint.x);
    const top = Math.min(startPoint.y, endPoint.y);
    const bottom = Math.max(startPoint.y, endPoint.y);

    const startColIndex = this.binarySearch(horizontalHeaderCells, left, "x");
    const endColIndex = this.binarySearch(horizontalHeaderCells, right, "x");
    const startRowIndex = this.binarySearch(verticalHeaderCells, top, "y");
    const endRowIndex = this.binarySearch(verticalHeaderCells, bottom, "y");

    const cells = [];
    for (let i = startColIndex; i <= endColIndex; i++) {
      for (let j = startRowIndex; j <= endRowIndex; j++) {
        cells.push({
          column: horizontalHeaderCells[i],
          row: verticalHeaderCells[j],
          cell: this.getCell(
            verticalHeaderCells[j].row,
            horizontalHeaderCells[i].col
          ),
        });
      }
    }

    return cells;
  }

  // This function is used to update the drawing with features when scrolling
  public updateDrawForScrolling(): void {
    this.selectionCell.updateDrawForScrolling();
  }

  public updateInputElement(
    cell: { column: IGridHeaderCell; row: IGridHeaderCell } | null
  ) {
    if (!cell || !cell.column || !cell.row) {
      return;
    }

    //getting the input element
    this.input = document.getElementById(
      `input_${this.sheet.row}_${this.sheet.col}_${this.sheet.index}`
    ) as HTMLElement;

    // Recalculate input box position
    const { x: scrollX, y: scrollY } = this.getScroll();
    const zoomIndex = this.zoomIndex;
    const inputChange = 2;
    const node = this.getCell(cell.row.row, cell.column.col);
    const fontSize = node?.styles.fontSize ?? DEFAULT_FONT_SIZE;
    const textAlign = node?.styles.textAlign ?? DEFAULT_CANVAS_TEXT_ALIGN;
    const alignContent =
      node?.styles.textBaseline === ETextBaseLine.middle
        ? "center"
        : node?.styles.textBaseline || "center";

    Object.assign(this.input.style, {
      position: "absolute",
      left: `${cell!.column.x - scrollX + inputChange}px`,
      top: `${cell!.row.y - scrollY + inputChange}px`,
      width: `${cell!.column.width - inputChange * inputChange}px`,
      height: `${cell!.row.height - inputChange * inputChange}px`,
      fontSize: `${fontSize * zoomIndex}px`, // Adjust font size based on scale
      textAlign: textAlign,
      lineHeight: `${fontSize * zoomIndex}px`,
      backgroundColor: DEFAULT_CELL_BG_COLOR,
      alignContent: alignContent,
      padding: `0px ${DEFAULT_MIN_PADDING_IN_CELL - 1}px`, // shiv don't know why is this -1 to be used
      display: "block",
    });
    this.input.innerText = node?.value ?? ""; // Set the input value
    this.input.focus();
  }

  hideInputElement() {
    const input = document.getElementById(
      `input_${this.sheet.row}_${this.sheet.col}_${this.sheet.index}`
    );
    if (input) {
      input.style.display = "none";
    }
  }

  public getCurrSelectedCells() {
    return this.selectionCell.selectedCells;
  }
}
