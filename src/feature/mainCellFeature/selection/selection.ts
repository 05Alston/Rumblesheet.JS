import {  mainCellManager } from "../mainCellManager.js";
import { Cell } from "../../../dataStructure/sparseMatrix.js";
import { IGridHeaderCell } from "../../../dataStructure/interfaces.js";
import { DEFAULT_HIGHLIGHT_FILL_COLOR, DEFAULT_HIGHLIGHT_BORDER_COLOR, DEFAULT_HIGHLIGHT_LINE_WIDTH, DEFAULT_HIGHLIGHT_HEADER_FILL_COLOR, DEFAULT_HIGHLIGHT_HEADER_LINE_WIDTH,  DEFAULT_HIGHLIGHT_HEADER_BORDER_COLOR } from "../../../dataStructure/constants.js";

export class selectionCell{
    private maincellManager! : mainCellManager;
    private canvases: { [key: string]: HTMLCanvasElement; };
    private isDragging: boolean;
    private isScrolling: boolean;
    private startPoint!: { x: number; y: number };
    private endPoint!: { x: number; y: number };
    private clickedCell_headercells!: {column:IGridHeaderCell, row:IGridHeaderCell} |null;
    public selectedCells!: { column: IGridHeaderCell | undefined; row: IGridHeaderCell | undefined; cell: Cell |null }[];

    constructor(maincellManager:mainCellManager){
        this.maincellManager = maincellManager;
        this.canvases = this.maincellManager.getCanvases();
        this.selectedCells = []
        this.isDragging = false; 
        this.isScrolling = false; 
        this.setupEventListeners();
    }

    setupEventListeners():void {
        const canvas = this.canvases.spreadsheet;
        canvas.addEventListener("pointerdown", this.handlePointerDown.bind(this));
        document.addEventListener("pointerup", this.handlePointerUp.bind(this));
        document.addEventListener("pointermove", this.handlePointerMove.bind(this));
    }

    private handlePointerDown(event: PointerEvent) {
        event.preventDefault();
        this.startPoint = this.maincellManager.getCanvasCoordinates(event);
        this.handleCellClick(event);
    
        if (!this.isDragging) {
            this.selectedCells = [];
            this.isDragging = true;
            this.isScrolling = true; 
            this.updateSelectedCells(this.startPoint);
        }
    }
    

    private handlePointerUp(){
        this.isScrolling = false;
        this.removeEventListeners();
        if (this.isDragging) {
        this.isDragging = false;
        
        }
    }

    private handlePointerMove(event:PointerEvent){
        if (this.isDragging) {
            const currentPoint = this.maincellManager.getCanvasCoordinates(event);
            this.updateSelectedCells(currentPoint);
            this.handleScrolling(event);
          }
    }

    handleScrolling(event : PointerEvent) {
        const { x, y } = this.maincellManager.getCanvasCoordinates(event);
        const { x: scrollX, y: scrollY } =
          this.maincellManager.getScroll();
    
        // Check if the pointer is near the edges to trigger scrolling
        const edgeDistance = 30; // Distance from edge to start scrolling
        const canvas = this.canvases.spreadsheet;
    
        if (x - scrollX < 0 && event.movementX < 0) {
          this.maincellManager.scroll(-10, 0);
        } else if (
          x - scrollX > canvas.clientWidth - edgeDistance &&
          event.movementX > 0
        ) {
          this.maincellManager.scroll(10, 0);
        }
    
        if (y - scrollY < 0 && event.movementY < 0) {
          this.maincellManager.scroll(0, -10); // Scroll up
        } else if (
          y - scrollY > canvas.clientHeight - edgeDistance &&
          event.movementY > 0
        ) {
          this.maincellManager.scroll(0, 10); // Scroll down
        }
    
        this.maincellManager.updateInputElement(this.clickedCell_headercells)
      }


    private handleCellClick(event: PointerEvent) {
        if (this.isDragging) return; // Prevent handling cell click if dragging

        const { x: scrollX, y: scrollY } = this.maincellManager.getCanvasCoordinates(event);
    
        this.clickedCell_headercells = this.maincellManager.getCellFromCoordinates(scrollX, scrollY);
        if (this.clickedCell_headercells) {
            this.deselectCurrentCells();
            // this.maincellManager.updateInputElement(this.clickedCell_headercells);
            this.selectCell(this.clickedCell_headercells);
            this.updateSelectedCells(this.startPoint);
            // this.drawHighlight();
        }
      }
    

      private selectCell(cell:{column:IGridHeaderCell, row:IGridHeaderCell} |null) {
        this.maincellManager.updateInputElement(cell); 
        this.maincellManager.draw(); 
        // this.drawHighlight();
      }

      public deselectCurrentCells() {
        if (this.selectedCells.length > 0) {
            this.selectedCells = [];
            this.maincellManager.hideInputElement(); // Hide the input element if it's visible
            this.maincellManager.draw(); // Redraw the sheet to remove any highlighting
        }
    }

    public updatePosForScrolling(): void {
        this.maincellManager.updateInputElement(this.clickedCell_headercells);
        this.selectCell(this.clickedCell_headercells);
        this.drawHighlight();

    }

    public updateSelectedCells(endPoint:{ x: number; y: number }) {
        const cells = this.maincellManager.getCellsFromRect(this.startPoint, endPoint);
        this.selectedCells = cells;
        this.drawHighlight()
      }

    drawHighlight() {
        this.maincellManager.draw();
        const ctx = this.canvases.spreadsheet.getContext("2d")!;
        const { x: scrollX, y: scrollY } =
        this.maincellManager.getScroll();

        if (this.selectedCells.length === 0) return;
        let width = null;
        let height = null;
        ctx.strokeStyle = DEFAULT_HIGHLIGHT_BORDER_COLOR;
        ctx.lineWidth = DEFAULT_HIGHLIGHT_LINE_WIDTH;
        // Get the boundary of the selected area
        const minX = Math.min(...this.selectedCells.map((cell) => cell.column!.x));
        const maxX = Math.max(
          ...this.selectedCells.map((cell) => {
            width = cell.column!.width;
            return cell.column!.x + cell.column!.width;
          })
        );
        const minY = Math.min(...this.selectedCells.map((cell) => cell.row!.y));
        const maxY = Math.max(
          ...this.selectedCells.map((cell) => {
            height = cell.row!.height;
            return cell.row!.y + cell.row!.height;
          })
        );

        // Use a single function to draw on both horizontal and vertical canvases
        this.drawRectangleOnHeaderCanvas(
          'horizontal', minX - scrollX, 0, maxX - minX, height!, true
        );
        this.drawRectangleOnHeaderCanvas(
          'vertical', 0, minY - scrollY, width!, maxY - minY, false
        );

        // Draw the border around the entire selection area
        ctx.fillStyle = DEFAULT_HIGHLIGHT_FILL_COLOR;
        ctx.fillRect(minX - scrollX, minY - scrollY, maxX - minX, maxY - minY);
        ctx.strokeRect(minX - scrollX, minY - scrollY, maxX - minX, maxY - minY);

    }

    private drawRectangleOnHeaderCanvas(type:string, x:number, y:number, width:number = 0, height:number = 0, isHorizontal:boolean) {
      const context =  this.maincellManager.getContexts();
      const ctx = context[type];
      ctx.beginPath();
      ctx.fillStyle = DEFAULT_HIGHLIGHT_HEADER_FILL_COLOR;
      ctx.fillRect(x, y, width, height);

      if (isHorizontal) {
        // Draw a solid green line at the bottom
        ctx.strokeStyle = DEFAULT_HIGHLIGHT_HEADER_BORDER_COLOR;
        ctx.lineWidth = DEFAULT_HIGHLIGHT_HEADER_LINE_WIDTH;
        ctx.moveTo(x, 20);
        ctx.lineTo(x + width, 20);
      } else {
        // Draw a solid green line on the right side
        ctx.strokeStyle = DEFAULT_HIGHLIGHT_HEADER_BORDER_COLOR;
        ctx.lineWidth = DEFAULT_HIGHLIGHT_HEADER_LINE_WIDTH ;
        ctx.moveTo(30, y);
        ctx.lineTo(30, y + height);
      }
  
      ctx.stroke(); // Finalize the drawing
    }

    removeEventListeners() {
        const canvas = this.canvases.spreadsheet;
        canvas.removeEventListener("pointerdown", this.handlePointerDown);
        document.removeEventListener("pointerup", this.handlePointerUp);
        document.removeEventListener("pointermove", this.handlePointerMove);
      }
}