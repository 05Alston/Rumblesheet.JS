import { Helper } from "../../excel/component/helper.js";
import { selectionCell } from "./selection/selection.js";
import { IGridHeaderCell } from "../../dataStructure/interfaces.js";
export class mainCellManager{
    public helper: Helper;
    public input!: HTMLInputElement | null;
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
          const value = (event.target! as HTMLInputElement).value;

          const rowNumber = row!.row;
          const columnNumber = column!.col;
          // Update SparseMatrix with new value
          this.helper.setCell(rowNumber, columnNumber, value);
      } else {
          console.warn('No cell is currently selected.');
      }
      }

    private handleKeyDown(event:Event) {
      if ((event as KeyboardEvent).key === 'Enter') {
        console.log(event)
          // this.updateCellValue(event.value);
          // this.cellFunctionality.selectedCell = null;
          this.helper.draw();
      }
    }

    private handleInputBlur(event:Event) {
      this.updateCellValue((event!.target as HTMLInputElement).value);
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

    public updateInputElement(cell: { column: IGridHeaderCell; row: IGridHeaderCell } | null) {
      if (!cell || !cell.column || !cell.row) {
          return;
      }
  
      this.input = document.getElementById(
          `input_${this.helper.sheet.row}_${this.helper.sheet.col}_${this.helper.sheet.index}`
      ) as HTMLInputElement;
  
      if (!this.input) {
          console.warn("updateInputElement: input element not found");
          return;
      }
  
      this.input.addEventListener("blur", function () {
          this.style.display = "none";
      });
  
      // Recalculate input box position
      const { x: scrollX, y: scrollY } = this.helper.getScroll();
      const zoomIndex = this.helper.zoomIndex;
      const inputchange = 2;
      
      const node = this.helper.getCell(cell.row.row, cell.column.col);
      const fontSize = node?.styles?.fontSize ?? 14;
  
      // Ensure input element exists before modifying styles
      Object.assign(this.input.style, {
          position: "absolute",
          left: `${cell.column.x - scrollX + inputchange}px`,
          top: `${cell.row.y - scrollY + inputchange}px`,
          width: `${cell.column.width - inputchange * inputchange}px`,
          height: `${cell.row.height - inputchange * inputchange}px`,
          fontSize: `${fontSize * zoomIndex}px`,
          textAlign: "center",
          display: "block",
      });
  
      this.input.focus();
  
      // Get the cell value from the sparse matrix and set it in the input box
      this.input.value = node?.value ?? "";
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
        this.helper.draw();
    }

    public getCurrSelectedCells(){
      return this.selectionCell.selectedCells;
    }

}

