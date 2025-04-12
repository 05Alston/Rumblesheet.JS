import { MainCellManager } from "../mainCellManager.js";
import { Cell } from "../../../data/sparseMatrix.js";
import { IGridHeaderCell } from "../../../data/interfaces.js";
import { DEFAULT_HIGHLIGHT_HEADER_BORDER_COLOR } from '../../../data/constants';


export class MergeCell{
    private maincellManager! : MainCellManager;
    private canvases: { [key: string]: HTMLCanvasElement; };
    private isDragging: boolean;
    private isScrolling: boolean;
    private startPoint!: { x: number; y: number };
    private endPoint!: { x: number; y: number };
    private clickedCell_headercells!: {column:IGridHeaderCell, row:IGridHeaderCell} |null;
    public selectedCells!: { column: IGridHeaderCell | undefined; row: IGridHeaderCell | undefined; cell: Cell |null }[];


    constructor(maincellManager:MainCellManager){
        this.maincellManager = maincellManager;
        this.canvases = this.maincellManager.getCanvases();
        this.selectedCells = []
        this.isDragging = false; 
        this.isScrolling = false; 
        this.setupEventListeners(); 
    }

    private setupEventListeners(){
        return
    }
}