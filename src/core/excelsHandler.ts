import { ISheetObj } from "../data/interfaces.js";
import { Excel } from "../excel/excel.js";
import { ThemeManager } from "../theme/theme.js";

export class ExcelsHandler {
  private readonly mainContainer: HTMLElement;
  private readonly maxExcelRow: number;
  private readonly maxExcelCol: number;
  private selectedExcel: HTMLElement | null = null;
  private totalExcelRows: number = 0;
  private excelsRowArr: Excel[][] = [];
  currExcelRow?: number;
  currExcelCol?: number;
  currSheetObj?: ISheetObj;
  themeManager!: ThemeManager;

  constructor(
    mainContainer: HTMLElement,
    maxExcelRow: number,
    maxExcelCol: number
  ) {
    this.mainContainer = mainContainer;
    this.maxExcelRow = maxExcelRow;
    this.maxExcelCol = maxExcelCol;
    this.init();
  }

  private init(): void {
    this.setupTheme();
    this.addNewExcelRow();
    this.handleResize();
    this.setupEventListeners();
  }

  private setupTheme(): void {
    this.themeManager = new ThemeManager();
    this.themeManager.updateTheme("violet");
  }

  private setupEventListeners(): void {
    this.mainContainer.addEventListener("click", (event) =>
      this.handleClick(event)
    );
    const addNewExcelRowButton = document.querySelector(".add-new-row");
    const addNewExcelColButton = document.querySelector(".add-new-col");
    const deleteExcelButton = document.querySelector(".delete-excel");

    addNewExcelRowButton?.addEventListener("click", () =>
      this.addNewExcelRow()
    );
    addNewExcelColButton?.addEventListener("click", () => {
      if (this.currExcelRow !== undefined) {
        this.addNewExcelCol(this.currExcelRow);
      }
    });
    deleteExcelButton?.addEventListener("click", () => {
      if (this.currExcelRow !== undefined && this.currExcelCol !== undefined) {
        this.deleteExcel(this.currExcelRow, this.currExcelCol);
      }
    });
  }

  private handleClick(event: MouseEvent): void {
    // Remove border from previously selected excel
    if (this.selectedExcel) {
      this.selectedExcel.style.border = "1px solid black";
    }

    const targetDiv = (event.target as HTMLElement).closest(
      "div[aria-rowindex][aria-colindex]"
    ) as HTMLElement;

    if (targetDiv) {
      targetDiv.style.border = "1px solid red";
      this.selectedExcel = targetDiv;
    }
  }

  public updateCurrExcel(
    excelRow: number,
    excelCol: number,
    sheetObj: ISheetObj
  ): void {
    this.currExcelRow = excelRow;
    this.currExcelCol = excelCol;
    this.currSheetObj = sheetObj;
  }

  public addNewExcelRow(): void {
    if (this.totalExcelRows >= this.maxExcelRow) {
      alert("No more rows can be added");
      return;
    }

    this.totalExcelRows++;
    const rowElement = document.createElement("div");
    rowElement.className = "row";
    rowElement.id = `row-${this.totalExcelRows}`;

    const excel = new Excel(rowElement, this.totalExcelRows, 1, this);
    this.excelsRowArr[this.totalExcelRows - 1] = [excel];
    this.mainContainer.appendChild(rowElement);
    this.addResizeHandles();
    this.handleResize();
  }

  public addNewExcelCol(rowNum: number): void {
    if (rowNum > this.totalExcelRows) return;

    let colCount = this.excelsRowArr[rowNum - 1].length;
    if (colCount >= this.maxExcelCol) {
      alert("No more columns can be added");
      return;
    }

    colCount += 1;
    const row = document.getElementById(`row-${rowNum}`);
    if (!row) return;

    const excel = new Excel(row, rowNum, colCount, this);
    this.excelsRowArr[rowNum - 1].push(excel);
    this.addResizeHandles();
    this.handleResize();
  }

  public deleteExcel(rowNum: number, colNum: number): void {
    const rowElement = document.getElementById(`row-${rowNum}`);
    if (rowElement) {
      const cells = rowElement.querySelectorAll(".excel");
      if (cells[colNum - 1]) {
        rowElement.removeChild(cells[colNum - 1]);
      }
    }

    this.excelsRowArr[rowNum - 1].splice(colNum - 1, 1);

    if (this.excelsRowArr[rowNum - 1].length === 0) {
      this.deleteRow(rowNum);
      return;
    }

    this.excelsRowArr.forEach((row, rowIndex) => {
      row.forEach((Excel, colIndex) => {
        const updatedColNum = colIndex + 1;
        if (updatedColNum >= colNum) {
          Excel.excelElement.style.gridColumn = String(updatedColNum);
          Excel.excelElement.dataset.col = String(updatedColNum);
        }
      });
    });

    this.addResizeHandles();
  }

  private deleteRow(rowNum: number): void {
    const rowElement = document.getElementById(`row-${rowNum}`);
    if (rowElement) {
      this.mainContainer.removeChild(rowElement);
    }

    this.excelsRowArr.splice(rowNum - 1, 1);

    for (let i = rowNum; i <= this.totalExcelRows; i++) {
      const rowElement = document.getElementById(`row-${i}`);
      if (rowElement) {
        rowElement.id = `row-${i - 1}`;
        const cells = rowElement.querySelectorAll(".excel");
        cells.forEach((cell) => {
          (cell as HTMLElement).dataset.row = String(i - 1);
        });
      }
    }

    this.totalExcelRows--;
    this.addResizeHandles();
  }

  private addResizeHandles(): void {
    this.excelsRowArr.forEach((row, rowIndex) => {
      const rowElement = document.getElementById(`row-${rowIndex + 1}`);

      if (rowElement && rowIndex < this.excelsRowArr.length - 1) {
        const rowResizeHandle = document.createElement("div");
        rowResizeHandle.className = "row-resize-handle";
        rowElement.appendChild(rowResizeHandle);
      }

      row.forEach((cell, colIndex) => {
        if (colIndex < row.length - 1) {
          const cellElement = document.getElementById(
            `row-${rowIndex + 1}-col-${colIndex + 1}`
          );
          const colResizeHandle = document.createElement("div");
          colResizeHandle.className = "col-resize-handle";
          cellElement?.appendChild(colResizeHandle);
        }
      });
    });
  }

  private handleResize(): void {
    let isResizing = false;
    let currentElement: HTMLElement | null = null;
    let startX = 0,
      startY = 0,
      startWidth = 0,
      startHeight = 0;
    let resizeType = "";

    const startResize = (e: MouseEvent): void => {
      const target = e.target as HTMLElement;
      if (target.classList.contains("col-resize-handle")) {
        currentElement = target.closest(".excel") as HTMLElement;
        resizeType = "column";
      } else if (target.classList.contains("row-resize-handle")) {
        currentElement = target.closest(".row") as HTMLElement;
        resizeType = "row";
      } else {
        return;
      }

      isResizing = true;
      startX = e.clientX;
      startY = e.clientY;
      startWidth = currentElement.offsetWidth;
      startHeight = currentElement.offsetHeight;

      document.addEventListener("mousemove", resize);
      document.addEventListener("mouseup", stopResize);
      e.preventDefault();
    };

    const resize = (e: MouseEvent): void => {
      if (!isResizing || !currentElement) return;

      if (resizeType === "column") {
        const width = startWidth + (e.clientX - startX);
        currentElement.style.width = `${width}px`;
        currentElement.style.flex = "none";
      } else if (resizeType === "row") {
        const height = startHeight + (e.clientY - startY);
        const newHeight = Math.max(height, 50);
        currentElement.style.height = `${newHeight}px`;
        currentElement.style.flex = "none";
      }

      currentElement.style.display = "none";
      /* SonarQube ignore next line */
      currentElement.offsetHeight; // Force reflow
      currentElement.style.display = "";
    };

    const stopResize = (): void => {
      isResizing = false;
      currentElement = null;
      document.removeEventListener("mousemove", resize);
      document.removeEventListener("mouseup", stopResize);
    };

    this.mainContainer.addEventListener("mousedown", startResize);
  }
}
