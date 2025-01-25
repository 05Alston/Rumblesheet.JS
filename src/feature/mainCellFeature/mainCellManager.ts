import { Helper } from "../../excel/component/helper.js";
import { selectionCell } from "./selection/selection.js";
import { GridHeaderCell, GridHeaderManager } from '../../excel/component/GridManager.js';
export class mainCellManager{
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
          input.addEventListener('input', this.handleInputChange.bind(this));
          input.addEventListener('keydown', this.handleKeyDown.bind(this));
          input.addEventListener('blur', this.handleInputBlur.bind(this));
      } else {
          console.error('Input element not found');
      }
    }

    private handleInputChange(event:Event) {
      if (this.selectionCell.selectedCells) {
      //     const { row, column } = this.selectionCell.selectedCells;
      //     const value = event.target!.data;

      //     const rowNumber = parseInt(row.value, 10);
      //     const columnNumber = this.letterToNumber(column.value);

      //     // Update SparseMatrix with new value
      //     this.helper.setCell(rowNumber, columnNumber, value);
      // } else {
      //     console.warn('No cell is currently selected.');
      // }
      }
    }

    private handleKeyDown(event:Event) {
      return 
      // if (event.key === 'Enter') {
      //     this.updateCellValue(event.target!.value);
      //     this.cellFunctionality.selectedCell = null;
      //     this.sheetRenderer.draw();
      // }
    }

    private handleInputBlur(event:Event) {
      // this.updateCellValue(event.target!.value);
      // this.cellFunctionality.selectedCell = null;
    }

    public updateCellValue() {
      // if (this.cellFunctionality?.selectedCell) {
      //     const { row, column } = this.cellFunctionality.selectedCell;
      //     const rowNumber = parseInt(row.value, 10);
      //     const columnNumber = this.letterToNumber(column.value);
      //     this.sparseMatrix.setCell(rowNumber, columnNumber, value);
      // }
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

    public getCellFromCoordinates(x:number, y:number):{column:GridHeaderCell, row:GridHeaderCell} |null {
        const horizontalHeaderCells = this.helper.getHorizontalHeaderCells(x);
        const verticalHeaderCells = this.helper.getVerticalHeaderCells(y);
    
        const column = horizontalHeaderCells.find(cell => x >= cell.x && x < cell.x + cell.width);
        const row = verticalHeaderCells.find(cell => y >= cell.y && y < cell.y + cell.height);
    
        return column && row ? { column, row } : null;
    }

    public getCellsFromRect(startPoint: { x: number; y: number }, endPoint: { x: number; y: number }) {
        const horizontalHeaderCells = this.helper.getHorizontalHeaderCells(startPoint.x);
        const verticalHeaderCells = this.helper.getVerticalHeaderCells(startPoint.y); 

        const left = Math.min(startPoint.x, endPoint.x);
        const right = Math.max(startPoint.x, endPoint.x);
        const top = Math.min(startPoint.y, endPoint.y);
        const bottom = Math.max(startPoint.y, endPoint.y);
    
        const startColIndex = this.helper.binarySearch(horizontalHeaderCells, left, 'x');
        const endColIndex = this.helper.binarySearch(horizontalHeaderCells, right, 'x');
        const startRowIndex = this.helper.binarySearch(verticalHeaderCells, top, 'y');
        const endRowIndex = this.helper.binarySearch(verticalHeaderCells, bottom, 'y');
    
        const cells = [];
        for (let i = startColIndex; i <= endColIndex; i++) {
          for (let j = startRowIndex; j <= endRowIndex; j++) {
            cells.push({
              column: horizontalHeaderCells[i],
              row: verticalHeaderCells[j],
              cell: this.helper.getCell(
                verticalHeaderCells[j].row,
                horizontalHeaderCells[i].col
              )
            });
          }
        }
    
        return cells;
    }

    public updatepositions(): void {
        this.selectionCell.updatePosForScrolling()
    }

    public updateInputElement(cell:{column:GridHeaderCell, row:GridHeaderCell} |null) {
        this.input = document.getElementById(
          `input_${this.helper.sheet.row}_${this.helper.sheet.col}_${this.helper.sheet.index}`
        );
        this.input!.addEventListener('blur', function() {
          this.style.display = 'none';
        });
        console.log(this.input)
    
        console.log(cell)
        // Recalculate input box position
        const { x: scrollX, y: scrollY } =
          this.helper.getScroll();
        const zoomIndex = this.helper.zoomIndex;
        const inputchange = 2;
        const node = this.helper.getCell(cell!.row.row,
          cell!.column.col);
          console.log(node)
        const fontSize = node? node.fontSize : 14;
        
        this.input!.style.position = "absolute";
        this.input!.style.left = `${cell!.column.x - scrollX +  inputchange}px`;
        this.input!.style.top = `${cell!.row.y - scrollY +  inputchange}px`;
        this.input!.style.width = `${cell!.column.width -  inputchange*inputchange}px`;
        this.input!.style.height = `${cell!.row.height -  inputchange*inputchange}px`;
        this.input!.style.fontSize = `${fontSize * zoomIndex}px`; // Adjust font size based on scale
        this.input!.style.textAlign = "center";
        // input.style.zIndex = 10;
        this.input!.style.display = "block";
        this.input!.focus(); // Optionally focus the input
    
        // Get the cell value from the sparse matrix and set it in the input box
        const cellValue = node ? node.value : ""
        this.input = cellValue !== null ? cellValue : ""; // Set the input value
    }

    hideInputElement() {
        const input =document.getElementById(
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
        console.log("calling draw from main cell manager")
        this.helper.draw();
    }
  
}

export { GridHeaderCell };
