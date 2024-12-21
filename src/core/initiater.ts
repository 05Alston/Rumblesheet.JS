import { Excel } from "../excel/excel.js";
import { Ribbon } from "../ribbon/ribbon.js";


export class excelsHandler {
    mainContainer: HTMLElement;
    maxRow: number;
    maxCol: number;
    selectedDiv: HTMLElement | null;
    currentRowCount: number;
    rowArr: Excel[][];
    currExcelRow?: number;
    currExcelCol?: number;
    currSheetObj?: any;

    constructor(mainContainer: HTMLElement, maxRow: number, maxCol: number) {
        this.mainContainer = mainContainer;
        this.maxRow = maxRow;
        this.maxCol = maxCol;
        this.selectedDiv = null;
        this.currentRowCount = 0;
        this.rowArr = [];
        this.init();
    }

    private init(): void {
        this.mainContainer.style.display = 'flex';
        this.mainContainer.style.flexDirection = 'column';
        this.addNewRow();
        this.handleClick = this.handleClick.bind(this);
        this.setupEventListeners();
    }

    private setupEventListeners(): void {
        const form = document.querySelector('form');
        const addNewRowButton = document.querySelector('.add-new-row');
        const addNewColButton = document.querySelector('.add-new-col');
        const deleteExcelButton = document.querySelector('.delete-excel');

        addNewRowButton?.addEventListener('click', () => this.addNewRow());
        addNewColButton?.addEventListener('click', () => {
            if (this.currExcelRow !== undefined) {
                this.addNewCol(this.currExcelRow);
            }
        });

        deleteExcelButton?.addEventListener('click', () => {
            if (this.currExcelRow !== undefined && this.currExcelCol !== undefined) {
                this.deleteExcel(this.currExcelRow, this.currExcelCol);
            }
        });

        this.mainContainer.addEventListener('click', this.handleClick);
    }

    private handleClick(event: MouseEvent): void {
        if (this.selectedDiv) {
            this.selectedDiv.style.border = '1px solid black';
        }

        const targetDiv = (event.target as HTMLElement).closest('div[aria-rowindex][aria-colindex]') as HTMLElement;

        if (targetDiv) {
            targetDiv.style.border = '1px solid red';
            this.selectedDiv = targetDiv;
        }
    }

    updateCurrExcel(excelRow: number, excelCol: number, sheetObj: any): void {
        this.currExcelRow = excelRow;
        this.currExcelCol = excelCol;
        this.currSheetObj = sheetObj;
    }

    private addNewRow(): void {
        if (this.currentRowCount >= this.maxRow) {
            alert('No more rows can be added');
            return;
        }

        this.currentRowCount += 1;
        const row = document.createElement('div');
        row.className = 'row';
        row.id = `row_${this.currentRowCount}`;
        row.style.flex = '1';
        const excel = new Excel(row, this.currentRowCount, 1, this);
        this.rowArr[this.currentRowCount - 1] = [excel];
        this.mainContainer.appendChild(row);
        this.addResizeHandles();
        this.handleResize();
    }

    private addNewCol(rowNum: number): void {
        if (rowNum > this.currentRowCount) return;

        let colCount = this.rowArr[rowNum - 1].length;
        if (colCount >= this.maxCol) {
            alert('No more columns can be added');
            return;
        }

        colCount += 1;
        const row = document.getElementById(`row_${rowNum}`);
        if (!row) return;

        const excel = new Excel(row, rowNum, colCount, this);
        this.rowArr[rowNum - 1].push(excel);
        this.addResizeHandles();
        this.handleResize();
    }

    private deleteExcel(rowNum: number, colNum: number): void {
        const rowElement = document.getElementById(`row_${rowNum}`);
        if (rowElement) {
            const cells = rowElement.querySelectorAll('.excel');
            if (cells[colNum - 1]) {
                rowElement.removeChild(cells[colNum - 1]);
            }
        }

        this.rowArr[rowNum - 1].splice(colNum - 1, 1);

        if (this.rowArr[rowNum - 1].length === 0) {
            this.deleteRow(rowNum);
            return;
        }

        this.rowArr.forEach((row, rowIndex) => {
            row.forEach((cell, colIndex) => {
                const updatedColNum = colIndex + 1;
                if (updatedColNum >= colNum) {
                    cell.element.style.gridColumn = String(updatedColNum);
                    cell.element.dataset.col = String(updatedColNum);
                }
            });
        });

        this.addResizeHandles();
    }

    private deleteRow(rowNum: number): void {
        const rowElement = document.getElementById(`row_${rowNum}`);
        if (rowElement) {
            this.mainContainer.removeChild(rowElement);
        }

        this.rowArr.splice(rowNum - 1, 1);

        for (let i = rowNum; i <= this.currentRowCount; i++) {
            const rowElement = document.getElementById(`row_${i}`);
            if (rowElement) {
                rowElement.id = `row_${i - 1}`;
                const cells = rowElement.querySelectorAll('.excel');
                cells.forEach((cell) => {
                    (cell as HTMLElement).dataset.row = String(i - 1);
                });
            }
        }

        this.currentRowCount--;
        this.addResizeHandles();
    }

    private addResizeHandles(): void {
        this.rowArr.forEach((row, rowIndex) => {
            const rowElement = document.getElementById(`row_${rowIndex + 1}`);

            if (rowElement && rowIndex < this.rowArr.length - 1) {
                const rowResizeHandle = document.createElement('div');
                rowResizeHandle.className = 'row-resize-handle';
                rowElement.appendChild(rowResizeHandle);
            }

            row.forEach((cell, colIndex) => {
                if (colIndex < row.length - 1) {
                    const cellElement = document.getElementById(`rowCol${rowIndex + 1}_${colIndex+1}`);
                    const colResizeHandle = document.createElement('div');
                    colResizeHandle.className = 'col-resize-handle';
                    cellElement?.appendChild(colResizeHandle);
                }
            });
        });
    }

    private handleResize(): void {
        let isResizing = false;
        let currentElement: HTMLElement | null = null;
        let startX = 0, startY = 0, startWidth = 0, startHeight = 0;
        let resizeType = '';

        const startResize = (e: MouseEvent): void => {
            const target = e.target as HTMLElement;
            if (target.classList.contains('col-resize-handle')) {
                currentElement = target.closest('.excel') as HTMLElement;
                resizeType = 'column';
            } else if (target.classList.contains('row-resize-handle')) {
                currentElement = target.closest('.row') as HTMLElement;
                resizeType = 'row';
            } else {
                return;
            }

            isResizing = true;
            startX = e.clientX;
            startY = e.clientY;
            startWidth = currentElement.offsetWidth;
            startHeight = currentElement.offsetHeight;

            document.addEventListener('mousemove', resize);
            document.addEventListener('mouseup', stopResize);
            e.preventDefault();
        };

        const resize = (e: MouseEvent): void => {
            if (!isResizing || !currentElement) return;

            if (resizeType === 'column') {
                const width = startWidth + (e.clientX - startX);
                currentElement.style.width = `${width}px`;
                currentElement.style.flex = 'none';
            } else if (resizeType === 'row') {
                const height = startHeight + (e.clientY - startY);
                const newHeight = Math.max(height, 50);
                currentElement.style.height = `${newHeight}px`;
                currentElement.style.flex = 'none';
            }

            currentElement.style.display = 'none';
            currentElement.offsetHeight; // Force reflow
            currentElement.style.display = '';
        };

        const stopResize = (): void => {
            isResizing = false;
            currentElement = null;
            document.removeEventListener('mousemove', resize);
            document.removeEventListener('mouseup', stopResize);
        };

        this.mainContainer.addEventListener('mousedown', startResize);
    }
}


function init(ribbonContainer: HTMLElement, mainContainer: HTMLElement): void {
    // Create instances of RibbonMaker and GridMaker
    const maxRow = 3;
    const maxCol = 3;
    new Ribbon(ribbonContainer);
    new excelsHandler(mainContainer, maxRow, maxCol);
}

document.addEventListener('DOMContentLoaded', () => {
    // Get HTML elements from the DOM
    const ribbonContainer = document.getElementById("ribbon-container");
    const mainContainer = document.getElementById("mainContainer");

    // Check if elements exist and initialize
    if (ribbonContainer instanceof HTMLElement && mainContainer instanceof HTMLElement) {
        init(ribbonContainer, mainContainer);
    } else {
        console.error("Ribbon container or main container not found in the DOM.");
    }
});
