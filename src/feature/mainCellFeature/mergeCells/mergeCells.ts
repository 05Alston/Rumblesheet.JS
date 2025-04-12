import {  mainCellManager } from "../mainCellManager.js";
import { Cell } from "../../../dataStructure/sparseMatrix.js";
import { IGridHeaderCell } from "../../../dataStructure/interfaces.js";
import { DEFAULT_HIGHLIGHT_FILL_COLOR, DEFAULT_HIGHLIGHT_BORDER_COLOR, DEFAULT_HIGHLIGHT_LINE_WIDTH, DEFAULT_HIGHLIGHT_HEADER_FILL_COLOR, DEFAULT_HIGHLIGHT_HEADER_LINE_WIDTH,  DEFAULT_HIGHLIGHT_HEADER_BORDER_COLOR } from "../../../dataStructure/constants.js";


export class MergeCell{
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

    private setupEventListeners(){
        return
    }
}