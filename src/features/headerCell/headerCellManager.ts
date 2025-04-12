import { IGridHeaderCell } from "../../data/interfaces.js";
import { Helper } from "../../excel/helper/helper.js";
import { HeaderResizeFunctionality } from "./resizing/Resizing.js";

export class HeaderCellManager{
    public helper: Helper;
    public input!: HTMLInputElement | null;
    private canvases: { [key: string]: HTMLCanvasElement; };

    constructor(helper:Helper){
        this.helper = helper;
        this.canvases = this.helper.getCanvases();
        this.initiateFeature();
        this.setupInputEventListener();
    }

    setCustomCellSize(type : 'horizontal' | 'vertical', index: number , size: number): void {
      this.helper.setCustomCellSize(type,index,size);
    }
    public getCellSize(type: 'horizontal' | 'vertical', index: number): number| undefined {
      return this.helper?.getCellSize(type,index)
    }

    updateCellPositions(type: 'horizontal' | 'vertical') {
      const cells = type === 'horizontal' ? this.getHorizontalHeaderCells(0) : this.getVerticalHeaderCells(0);
      let position = 0;
  
      cells.forEach((cell, index) => {
        if (type === 'horizontal') {
          cell.width =  50 ;
          cell.x = position;
          position += cell.width;
        } else {
          cell.height = 10;
          cell.y = position;
          position += cell.height;
        }
      });
    }

    private initiateFeature(){
        new HeaderResizeFunctionality(this)
    }

    private setupInputEventListener() {
      const { row, col, index } = this.helper.sheetMaker;
      const input = document.getElementById(`input_${row}_${col}_${index}`);
    }

    private handleKeyDown(event:Event) {
      if ((event as KeyboardEvent).key === 'Enter') {
        // conosle.log(event)
          // this.updateCellValue(event.value);
          // this.cellFunctionality.selectedCell = null;
          // this.sheetRenderer.draw();
      }
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
        this.helper.setScroll(x, y);
    }

    public getCellFromCoordinates(x:number, y:number):{column:IGridHeaderCell, row:IGridHeaderCell} |null {
        const horizontalHeaderCells = this.helper.getHorizontalHeaderCells(x);
        const verticalHeaderCells = this.helper.getVerticalHeaderCells(y);
    
        const column = horizontalHeaderCells.find(cell => x >= cell.x && x < cell.x + cell.width);
        const row = verticalHeaderCells.find(cell => y >= cell.y && y < cell.y + cell.height);
    
        return column && row ? { column, row } : null;
    }

    getHorizontalHeaderCells(scrollX: number): IGridHeaderCell[] {
      return this.helper!.getHorizontalHeaderCells(scrollX);
    }

    getVerticalHeaderCells(scrollY: number): IGridHeaderCell[] {
      return this.helper!.getVerticalHeaderCells(scrollY);
    }

    public getCellsFromRect(startPoint: { x: number; y: number }, endPoint: { x: number; y: number }) {
        const horizontalHeaderCells = this.helper.getAllHorizontalHeaderCells();
        const verticalHeaderCells = this.helper.getAllVerticalHeaderCells(); 

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

    public updateInputElement(cell:{column:IGridHeaderCell, row:IGridHeaderCell} |null) {
        this.input = document.getElementById(
          `input_${this.helper.sheetMaker.row}_${this.helper.sheetMaker.col}_${this.helper.sheetMaker.index}`
        ) as HTMLInputElement;
        this.input!.addEventListener('blur', function() {
          this.style.display = 'none';
        });
    
        // Recalculate input box position
        const { x: scrollX, y: scrollY } =
          this.helper.getScroll();
        const zoomIndex = this.helper.zoomIndex;
        const inputchange = 2;
        const node = this.helper.getCell(cell!.row.row,
          cell!.column.col);
        const fontSize = node? node.styles.fontSize ?? 14 : 14;
        
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
        this.input.value = cellValue !== null ? cellValue : ""; // Set the input value
    }

    hideInputElement() {
        const input =document.getElementById(
          `input_${this.helper.sheetMaker.row}_${this.helper.sheetMaker.col}_${this.helper.sheetMaker.index}`
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

}

