import { Helper } from "../../excel/component/helper.js";
import { selectionCell } from "./selection/selection.js";
import {
  IGridHeaderCell,
} from "../../dataStructure/interfaces.js";
import {
  DEFAULT_CANVAS_TEXT_ALIGN,
  DEFAULT_CELL_BG_COLOR,
  DEFAULT_CELL_FONT_COLOR,
  DEFAULT_CELL_WIDTH,
  DEFAULT_FONT_SIZE,
  DEFAULT_MIN_PADDING_IN_CELL,
} from "../../dataStructure/constants.js";
import { ETextBaseLine } from "../../dataStructure/enums.js";
export class mainCellManager {
  public helper: Helper;
  public input!: HTMLElement | null;
  private selectionCell!: selectionCell;
    private canvases: { [key: string]: HTMLCanvasElement; };

    constructor(helper:Helper){
    this.helper = helper;
    this.canvases = this.helper.getCanvases();
    this.initiateFeature();
    this.setupInputEventListener();
  }

  private setupInputEventListener() {
    const { row, col, index } = this.helper.sheet;
    const input = document.getElementById(`input_${row}_${col}_${index}`);

    if (input) {
        input.addEventListener("input", (event: Event) => {this.handleInputChange(event)});
        input.addEventListener('keydown', (event: Event) => {this.handleKeyDown(event)});
          input.addEventListener('blur', (event: Event) => {this.handleInputBlur(event)});
    } else {
          console.error('Input element not found');
    }
  }

    private handleInputChange(event:Event) {
    if (this.selectionCell.selectedCells) {
      const { row, column } = this.selectionCell.selectedCells[0];
      const value = (event.target! as HTMLElement).innerText;

      const rowNumber = row!.row;
      const columnNumber = column!.col;

      // Update SparseMatrix with new value
      this.helper.setCell(rowNumber, columnNumber, value);
    } else {
          console.warn('No cell is currently selected.');
    }
    const element = (event.target) as HTMLElement;

    if (element.scrollHeight > element.offsetHeight) {
      let currentWidth = parseInt(element.style.width) || element.offsetWidth;
      element.style.width = `${currentWidth + DEFAULT_CELL_WIDTH}px`;
  }
  }

    private handleKeyDown(event:Event) {
      if ((event as KeyboardEvent).key === 'Enter') {
        console.log(event)
      // this.updateCellValue(event.value);
      // this.cellFunctionality.selectedCell = null;
      // this.sheetRenderer.draw();
    }
  }

  private handleInputBlur(event: Event) {
    this.updateCellValue((event!.target as HTMLElement).innerText);
    this.selectionCell.selectedCells[0].cell = null;
  }

    public updateCellValue(value:string | null) {
      if ( this.selectionCell.selectedCells[0]) {
          const { row, column } =  this.selectionCell.selectedCells[0];
      const rowNumber = row!.row;
      const columnNumber = column!.col;
      this.helper.setCell(rowNumber, columnNumber, value);
    }
  }

    private initiateFeature(){
    // For adding new feature call here
        this.selectionCell = new selectionCell(this)
  }

    public getCanvases(){
    return this.canvases;
  }

    public getContexts(){
    return this.helper.getContexts();
  }

    public getCanvasCoordinates(event:PointerEvent) {
    const rect = this.canvases.spreadsheet.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const { x: scrollX, y: scrollY } = this.helper.getScroll();

    // Adjust for scaling and scrolling
    return {
      x: x + scrollX * this.helper.zoomIndex,
          y: y + scrollY * this.helper.zoomIndex
    };
  }

    public scroll(x: number, y: number){
    this.helper.Scroll(x, y);
  }

    public getCellFromCoordinates(x:number, y:number):{column:IGridHeaderCell, row:IGridHeaderCell} |null {
    const horizontalHeaderCells = this.helper.getHorizontalHeaderCells(x);
    const verticalHeaderCells = this.helper.getVerticalHeaderCells(y);

        const column = horizontalHeaderCells.find(cell => x >= cell.x && x < cell.x + cell.width);
        const row = verticalHeaderCells.find(cell => y >= cell.y && y < cell.y + cell.height);
    
    return column && row ? { column, row } : null;
  }

    public getCellsFromRect(startPoint: { x: number; y: number }, endPoint: { x: number; y: number }) {
        const horizontalHeaderCells = this.helper.getHorizontalHeaderCells(0);
        const verticalHeaderCells = this.helper.getVerticalHeaderCells(0); 

    const left = Math.min(startPoint.x, endPoint.x);
    const right = Math.max(startPoint.x, endPoint.x);
    const top = Math.min(startPoint.y, endPoint.y);
    const bottom = Math.max(startPoint.y, endPoint.y);

        const startColIndex = this.helper.binarySearch(horizontalHeaderCells, left, 'x');
        const endColIndex = this.helper.binarySearch(horizontalHeaderCells, right, 'x');
        const startRowIndex = this.helper.binarySearch(verticalHeaderCells, top, 'y');
        const endRowIndex = this.helper.binarySearch(verticalHeaderCells, bottom, 'y');

    const cells = [];
    console.log(startColIndex,endColIndex)
    console.log(startRowIndex,endRowIndex)
    for (let i = startColIndex; i <= endColIndex; i++) {
      for (let j = startRowIndex; j <= endRowIndex; j++) {
        if(this.helper.getCell(
          verticalHeaderCells[j].row,
          horizontalHeaderCells[i].col
        )){
          console.log(console.log( this.helper.getCell(
            verticalHeaderCells[j].row,
            horizontalHeaderCells[i].col
          ),))
        }
        cells.push({
          column: horizontalHeaderCells[i],
          row: verticalHeaderCells[j],
          cell: this.helper.getCell(
            verticalHeaderCells[j].row,
            horizontalHeaderCells[i].col
          ),
        });
      }
    }

    return cells;
  }

  public updatepositions(): void {
        this.selectionCell.updatePosForScrolling()
  }

  public updateInputElement(
    cell: { column: IGridHeaderCell; row: IGridHeaderCell } | null
  ) {
    if (!cell || !cell.column || !cell.row) {
      return;
    } 
  
    //getting the input element
    this.input = document.getElementById(
      `input_${this.helper.sheet.row}_${this.helper.sheet.col}_${this.helper.sheet.index}`
    ) as HTMLElement;

    // Recalculate input box position
    const { x: scrollX, y: scrollY } = this.helper.getScroll();
    const zoomIndex = this.helper.zoomIndex;
    const inputChange = 2;
    const node = this.helper.getCell(cell.row.row, cell.column.col);
    const fontSize = node?.styles.fontSize ?? DEFAULT_FONT_SIZE;
    const textAlign = node?.styles.textAlign ?? DEFAULT_CANVAS_TEXT_ALIGN;
    const alignContent = node?.styles.textBaseline === ETextBaseLine.middle
    ? "center"
    : node?.styles.textBaseline || "center"
    const bold = node?.styles.bold ? 'bold' : 'normal';
    const italic = node?.styles.italic ? 'italic' : 'normal';
    const color = node?.styles.color ? node?.styles.color  : DEFAULT_CELL_FONT_COLOR
    const bgColor = node?.styles.fill ? node.styles.fill : DEFAULT_CELL_BG_COLOR

    Object.assign(this.input.style, {
      position: "absolute",
      left: `${cell!.column.x - scrollX + inputChange}px`,
      top: `${cell!.row.y - scrollY + inputChange}px`,
      width: `${cell!.column.width - inputChange * inputChange}px`,
      height: `${cell!.row.height - inputChange * inputChange}px`,
      fontSize: `${fontSize * zoomIndex}px`, // Adjust font size based on scale
      textAlign: textAlign,
      lineHeight: `${fontSize * zoomIndex}px`,
      alignContent: alignContent,
      padding: `0px ${DEFAULT_MIN_PADDING_IN_CELL - 1}px`,// shiv don't know why is this -1 to be used
      display: "block",
      fontWeight : bold,
      fontStyle : italic,
      color : color,
      backgroundColor : bgColor
    });
    this.input.innerText = node?.value ?? ""; // Set the input value
    this.input.focus()
  }

  hideInputElement() {
    const input = document.getElementById(
      `input_${this.helper.sheet.row}_${this.helper.sheet.col}_${this.helper.sheet.index}`
    );
    if (input) {
      input.style.display = "none";
    }
  }

    public getScroll(){
    return this.helper.getScroll();
  }

  public draw(): void {
    this.helper.draw();
  }

    public getCurrSelectedCells(){
    return this.selectionCell.selectedCells;
  }
}
