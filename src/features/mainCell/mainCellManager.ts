import {
  DEFAULT_CANVAS_TEXT_ALIGN,
  DEFAULT_CELL_BG_COLOR,
  DEFAULT_CELL_FONT_COLOR,
  DEFAULT_CELL_WIDTH,
  DEFAULT_FONT_FAMILY,
  DEFAULT_FONT_SIZE,
  DEFAULT_MIN_PADDING_IN_CELL,
} from "../../data/constants.js";
import { ETextBaseLine } from "../../data/enums.js";
import { ICell, IGridHeaderCell } from "../../data/interfaces.js";
import { Helper } from "../../excel/helper/helper.js";
import { Selection } from "./selection/selection.js";
import { MergeCell } from './mergeCells/mergeCells.js';
import { ISelectedCell } from '../../data/interfaces';

export class MainCellManager {
  public helper: Helper;
  public input!: HTMLElement | null;
  private selectionCell!: Selection;
  private mergeCell!: MergeCell
  private canvases: { [key: string]: HTMLCanvasElement; };

  constructor(helper: Helper) {
    this.helper = helper;
    this.canvases = this.helper.getCanvases();
    this.initiateFeature();
    this.setupInputEventListener();
  }

  private setupInputEventListener() {
    const { row, col, index } = this.helper.sheetMaker;
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
    const element = event.target as HTMLElement;
    if (this.selectionCell.selectedCells) {
      const value = element.innerText;
      this.updateCellValue(value)
    } else {
      console.warn("No cell is currently selected.");
    }

    if (element.scrollHeight > element.offsetHeight) {
      let currentWidth = parseInt(element.style.width) || element.offsetWidth;
      element.style.width = `${currentWidth + DEFAULT_CELL_WIDTH}px`;
    }
  }

  private handleKeyDown(event: Event) {
    if ((event as KeyboardEvent).key === "Enter") {
      // conosle.log(event);
      // this.updateCellValue(event.value);
      // this.cellFunctionality.selectedCell = null;
      // this.sheetRenderer.draw();
    }
  }

  private handleInputBlur(event: Event) {
    this.updateCellValue((event!.target as HTMLElement).innerText);
  }

  public updateCellValue(value: string | null) {
    if (this.selectionCell.selectedCells[0]) {
      const { row, column } = this.selectionCell.selectedCells[0];

      let rowNumber = row!.row;
      let columnNumber = column!.col;
      // For merged cell
      if (this.selectionCell.selectedCells[0].cell?.mergedTo){
        const cell = this.selectionCell.selectedCells[0].cell?.mergedTo;
        rowNumber = cell.rowValue
        columnNumber = cell.colValue
      }

      // Update SparseMatrix with new value
      this.helper.setCell(rowNumber, columnNumber, value);
      this.selectionCell.selectedCells[0].cell = this.helper.getCell(rowNumber, columnNumber)
    }
  }

  public updateCellsValueForMerging() {
    if (this.selectionCell.selectedCells[0]) {
      const { row, column } = this.selectionCell.selectedCells[0];
      const rowNumber = row!.row;
      const columnNumber = column!.col;
      this.helper.updateCellsForSparse(this.selectionCell.selectedCells);
    }
  }

  private initiateFeature() {
    // For adding new feature call here
    this.selectionCell = new Selection(this);
    this.mergeCell = new MergeCell(this)
  }

  public getCanvasCoordinates(event: PointerEvent) {
    const rect = this.canvases.spreadsheet.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const { x: scrollX, y: scrollY } = this.helper.getScroll();

    // Adjust for scaling and scrolling
    return {
      x: x + scrollX * this.helper.zoomIndex,
      y: y + scrollY * this.helper.zoomIndex,
    };
  }

  public setScroll(x: number, y: number) {
    this.helper.setScroll(x, y);
  }

  public getScroll() {
    return this.helper.getScroll();
  }

  public draw(): void {
    this.helper.draw();
  }

  public getCanvases() {
    return this.canvases;
  }

  public getContexts() {
    return this.helper.getContexts();
  }

  public getCellFromCoordinates(
    x: number,
    y: number
  ): { column: IGridHeaderCell; row: IGridHeaderCell; cell:ICell } | null {
    const horizontalHeaderCells = this.helper.getHorizontalHeaderCells(x);
    const verticalHeaderCells = this.helper.getVerticalHeaderCells(y);

    const column = horizontalHeaderCells.find(
      (cell) => x >= cell.x && x < cell.x + cell.width
    );
    const row = verticalHeaderCells.find(
      (cell) => y >= cell.y && y < cell.y + cell.height
    );
    const cell = this.helper.getCell(row?.row!,column?.col!)!
    return column && row ? { column, row , cell } : null;
  }

  public getCellsFromRect(
    startPoint: { x: number; y: number },
    endPoint: { x: number; y: number }
  ):ISelectedCell[] {
    const horizontalHeaderCells = this.helper.getAllHorizontalHeaderCells();
    const verticalHeaderCells = this.helper.getAllVerticalHeaderCells();

    const left = Math.min(startPoint.x, endPoint.x);
    const right = Math.max(startPoint.x, endPoint.x);
    const top = Math.min(startPoint.y, endPoint.y);
    const bottom = Math.max(startPoint.y, endPoint.y);

    const startColIndex = this.helper.binarySearch(
      horizontalHeaderCells,
      left,
      "x"
    );
    const endColIndex = this.helper.binarySearch(
      horizontalHeaderCells,
      right,
      "x"
    );
    const startRowIndex = this.helper.binarySearch(
      verticalHeaderCells,
      top,
      "y"
    );
    const endRowIndex = this.helper.binarySearch(
      verticalHeaderCells,
      bottom,
      "y"
    );

    let cells:ISelectedCell[] = [];
    for (let i = startColIndex; i <= endColIndex; i++) {
      for (let j = startRowIndex; j <= endRowIndex; j++) {
        const cell = this.helper.getCell(
          verticalHeaderCells[j].row, 
          horizontalHeaderCells[i].col
        );
        
        console.log("About to push cell:", cell);
        
        const cellObject = {
          column: horizontalHeaderCells[i],
          row: verticalHeaderCells[j],
          cell: cell
        };
        
        console.log("Created cell object:", cellObject);
        cells.push(cellObject);
        console.log("After push, last item:", cells[cells.length-1]);
      }}
    console.log(cells)
    return cells;
  }

  // This function is used to update the drawing with features when scrolling
  public updateDrawForScrolling(): void {
    this.selectionCell.updateDrawForScrolling();
  }

  public updateInputElementWithoutCell(){
    // conosle.log('see')
    this.updateInputElement(this.selectionCell.clickedCell_headercells)
    // this.selectionCell.drawHighlight()
  }
  public updateInputElement(cell : ISelectedCell) {
    if (!cell || !cell.column || !cell.row) {
      return;
    }

    //getting the input element
    this.input = document.getElementById(
      `input_${this.helper.sheetMaker.row}_${this.helper.sheetMaker.col}_${this.helper.sheetMaker.index}`
    ) as HTMLElement;

    // Recalculate input box position
    const { x: scrollX, y: scrollY } = this.getScroll();
    const zoomIndex = this.helper.zoomIndex;
    const inputChange = 2;
    let node = this.helper.getCell(cell.row.row, cell.column.col);
    let left,top,width,height;
    const fontSize = node?.styles.fontSize ?? DEFAULT_FONT_SIZE;
    const textAlign = node?.styles.textAlign ?? DEFAULT_CANVAS_TEXT_ALIGN;
    if (node?.mergedTo){
      node = node.mergedTo;
      left = `${node.firstColumnHeaderCell!.x - scrollX + inputChange}px`
      top = `${node.firstRowHeaderCell!.y - scrollY + inputChange}px`
      width = `${(node.lastColumnHeaderCell!.x - node.firstColumnHeaderCell!.x + node.lastColumnHeaderCell!.width) - inputChange * inputChange}px`
      height = `${(node.lastRowHeaderCell!.y - node.firstRowHeaderCell!.y + node.lastRowHeaderCell!.height)- inputChange * inputChange}px`
    }
    const alignContent = node?.styles.textBaseline === ETextBaseLine.Middle
    ? "center"
    : node?.styles.textBaseline || "center"
    const bold = node?.styles.bold ? 'bold' : 'normal';
    const italic = node?.styles.italic ? 'italic' : 'normal';
    const color = node?.styles.color ? node?.styles.color  : DEFAULT_CELL_FONT_COLOR
    const bgColor = node?.styles.fill ? node.styles.fill : DEFAULT_CELL_BG_COLOR

    Object.assign(this.input.style, {
      position: "absolute",
      left: left? left :`${cell!.column.x - scrollX + inputChange}px`,
      top: top? top : `${cell!.row.y - scrollY + inputChange}px`,
      width: width? width : `${cell!.column.width - inputChange * inputChange}px`,
      height: height? height: `${cell!.row.height - inputChange * inputChange}px`,
      fontSize: `${fontSize * zoomIndex}px`, // Adjust font size based on scale
      fontFamily : `${node?.styles.fontFamily ?? DEFAULT_FONT_FAMILY}`,
      textAlign: textAlign,
      lineHeight: `${fontSize * zoomIndex}px`,
      alignContent: alignContent,
      padding: `0px ${DEFAULT_MIN_PADDING_IN_CELL - 1}px`, // shiv don't know why is this -1 to be used
      display: "block",
      fontWeight: bold,
      fontStyle: italic,
      color: color,
      backgroundColor: bgColor,
    });
    this.input.innerText = node?.value ?? ""; // Set the input value
    this.input.focus();
  }

  hideInputElement() {
    const input = document.getElementById(
      `input_${this.helper.sheetMaker.row}_${this.helper.sheetMaker.col}_${this.helper.sheetMaker.index}`
    );
    if (input) {
      input.style.display = "none";
    }
  }

  public getCurrSelectedCells() {
    return this.selectionCell.selectedCells;
  }
}
