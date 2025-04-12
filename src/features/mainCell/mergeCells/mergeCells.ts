import { MainCellManager } from "../mainCellManager.js";
import { Cell } from "../../../data/sparseMatrix.js";
import { IGridHeaderCell } from "../../../data/interfaces.js";
import { DEFAULT_HIGHLIGHT_HEADER_BORDER_COLOR } from '../../../data/constants';
import { SparseMatrix } from '../../../data/sparseMatrix';


export class MergeCell{
    private maincellManager! : MainCellManager;
    private canvases: { [key: string]: HTMLCanvasElement; };
    public selectedCells!: { column: IGridHeaderCell | undefined; row: IGridHeaderCell | undefined; cell: Cell |null }[];


    constructor(maincellManager:MainCellManager){
        this.maincellManager = maincellManager;
        this.canvases = this.maincellManager.getCanvases();
        this.setupEventListeners(); 
    }

    private setupEventListeners() {
        // conosle.log(this.canvases)
        const canvas = this.canvases.spreadsheet;
        canvas.addEventListener("contextmenu", this.handleRightClick.bind(this));
    }
    
    private handleRightClick(event: MouseEvent) {
        event.preventDefault();
        // console.log("in the designers era")
        this.selectedCells = this.maincellManager.getCurrSelectedCells()
        const canvas = event.currentTarget as HTMLCanvasElement;
        const rect = canvas.getBoundingClientRect();
        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;
    
        // Optional: Get the cell based on x, y if needed
        // const clickedCell = this.maincellManager.getCellAt(mouseX, mouseY);
    
        if (!this.selectedCells.length) return; // Only show if there are selected cells
    
        this.showContextMenu(event.clientX, event.clientY);
    }
    
    private showContextMenu(x: number, y: number) {
        let existingMenu = document.getElementById("merge-context-menu");
        if (existingMenu) existingMenu.remove();
    
        const menu = document.createElement("div");
        menu.id = "merge-context-menu";
        menu.innerText = "Merge";
        menu.style.position = "fixed";
        menu.style.left = `${x}px`;
        menu.style.top = `${y}px`;
        menu.style.background = "#fff";
        menu.style.border = "1px solid #ccc";
        menu.style.padding = "8px 12px";
        menu.style.cursor = "pointer";
        menu.style.zIndex = "9999";
        menu.style.boxShadow = "0 2px 8px rgba(0,0,0,0.15)";
    
        menu.addEventListener("click", () => {
            this.mergeSelectedCells();
            menu.remove();
        });
    
        document.body.appendChild(menu);
    
        // Hide menu on next click
        const hideMenu = () => {
            menu.remove();
            document.removeEventListener("click", hideMenu);
        };
        setTimeout(() => document.addEventListener("click", hideMenu), 0);
    }
    
    private mergeSelectedCells() {
        if (this.selectedCells.length <= 1) return;
        // console.log("merging....",this.selectedCells)
        this.maincellManager.updateCellsValueForMerging()
        this.selectedCells = [];
    }
}