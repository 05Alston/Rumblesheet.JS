import { Sheet } from '../excel.js';
import { Scroll } from './scroll.js'; // Assuming Scroll is imported from scroll.ts
import { SparseMatrix, Cell } from '../../dataStructure/sparseMatrix.js';
import { SheetRendrer } from './sheetrendrer.js';
import { GridHeaderCell, GridHeaderManager } from './GridManager.js';


export class Helper {
    public scroll: Scroll;
    public sheetRendrer: SheetRendrer;
    public sheet: Sheet;
    public SparseMatrix: SparseMatrix;
    public GridHeaderCell!: GridHeaderCell;
    canvases: { [key: string]: HTMLCanvasElement };
    contexts: { [key: string]: CanvasRenderingContext2D };
    verticalScroll?: { scroll: HTMLElement | null; bar: HTMLElement | null };
    horizontalScroll?: { scroll: HTMLElement | null; bar: HTMLElement | null };
    GridHeaderManager?:GridHeaderManager;
    resizeObserver?: ResizeObserver;

    constructor(Sheet: Sheet) {
        this.sheet = Sheet;
        this.canvases = {};
        this.contexts = {};
        this.initCanvases();
        this.SparseMatrix = new SparseMatrix();
        this.scroll = new Scroll(this);
        this.GridHeaderManager = new GridHeaderManager(this.sheet,
            this.canvases.spreadsheet.clientWidth,
            this.canvases.spreadsheet.clientHeight,
            1)
        this.sheetRendrer = new SheetRendrer(this);
        this.scroll.setRenderer(this.sheetRendrer);
    }

    public getRowColofExcel(): { row: number; col: number; index:number } {
        return {
          row: this.sheet.row,
          col: this.sheet.col,
          index: this.sheet.index
        };
    }

    public updateCells():void {
      this.GridHeaderManager?.updateCells();
    }

    public getRowheader():{ [key: number]: Cell | undefined }{
      return this.SparseMatrix.rowHeaders;
    }

    initCanvases() {
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
            scroll: document.getElementById(`verticalScroll_${this.sheet.row}_${this.sheet.col}_${this.sheet.index}`),
            bar: document.getElementById(`verticalBar_${this.sheet.row}_${this.sheet.col}_${this.sheet.index}`),
          };
          
        this.horizontalScroll = {
            scroll: document.getElementById(`horizontalScroll_${this.sheet.row}_${this.sheet.col}_${this.sheet.index}`),
            bar: document.getElementById(`horizontalBar_${this.sheet.row}_${this.sheet.col}_${this.sheet.index}`),
          };
      }

      getScrollRatio(direction: 'horizontal' | 'vertical'): number {
        // Determine the ID of the scroll element based on the direction
        const scrollElementId =
          direction === 'horizontal'
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
          throw new Error(`${direction} scroll element is not a valid HTMLElement.`);
        }
      
        // Determine maxScroll based on the direction
        const maxScroll = direction === 'horizontal' ? this.scroll.maxScrollX : this.scroll.maxScrollY;
      
        // Calculate and return the scroll ratio
        return scrollElement.clientHeight / (scrollElement.clientHeight + maxScroll);
      }

      getScroll():{ x: number, y: number }{
        return this.scroll.getScroll();
      }

      // update the max scroll by getting new width and height from grid header manager
      updateMaxScroll() {
        const totalWidth = this.GridHeaderManager!.getTotalWidth();
        const totalHeight = this.GridHeaderManager!.getTotalHeight();
        const visibleWidth = this.canvases.spreadsheet.clientWidth;
        const visibleHeight = this.canvases.spreadsheet.clientHeight;
        this.scroll.updateMaxScroll(
          totalWidth,
          totalHeight,
          visibleWidth,
          visibleHeight
        );
      }

      //Get Horizontal header cells 
      getHorizontalHeaderCells(scrollX: number): GridHeaderCell[] {
        return this.GridHeaderManager!.getHeaderCellsHorizontal(scrollX);
      }

      // Get Vertical header cells
      getVerticalHeaderCells(scrollY: number): GridHeaderCell[] {
        return this.GridHeaderManager!.getHeaderCellsVertical(scrollY);
      }

      numberToColumnName(value : number):string{
        return this.GridHeaderManager!.numberToColumnName(value);
      }
      
      draw(){
        this.sheetRendrer.draw();
      }
      
    // Method to initialize scroll
    initializeScroll(): void {
        
    }

    // Method to initialize the spreadsheet
    initializeSpreadsheet(): void {
        
    }

    // Any other helper methods you may need to run logic for both classes
    initializeAll(): void {
        this.initializeScroll();
        this.initializeSpreadsheet();
    }
}
export { GridHeaderCell };

