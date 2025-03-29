import { ExcelsHandler } from "../core/excelsHandler.js";
import { ISheetObj } from "../dataStructure/interfaces.js";
import { SheetMaker } from "./component/sheetMaker.js";

export class Excel {
  private rowContainer: HTMLElement;
  private row: number;
  private col: number;
  private excelHandler: ExcelsHandler; // Replace with the actual type for Grid_maker
  public excel!: HTMLElement;
  private contentArea!: HTMLElement;
  private activeSheetIndex: number;
  private sheets!: ISheetObj[];

  constructor(
    rowContainer: HTMLElement,
    row: number,
    col: number,
    excelHandler: ExcelsHandler
  ) {
    this.rowContainer = rowContainer;
    this.row = row;
    this.col = col;
    this.excelHandler = excelHandler;
    this.activeSheetIndex = 0;
    this.init();
  }

  private init(): void {
    this.constructExcel();
    this.excelHandler.updateCurrExcel(
      this.row,
      this.col,
      this.sheets[this.activeSheetIndex]
    );
    this.handleEvents();
  }

  private constructExcel(): void {
    this.excel = document.createElement("div");
    this.excel.className = "excel resizable";
    this.excel.id = `rowCol${this.row}_${this.col}`;
    this.excel.role = "gridcell";
    this.excel.ariaRowIndex = "this.row";
    this.excel.ariaColIndex = "this.col";
    this.excel.style.flex = "1";
    this.rowContainer.appendChild(this.excel);
    this.sheets = [
      {
        name: "Sheet1",
        instance: new SheetMaker("Sheet1", this.row, this.col, 0),
      },
    ];
    this.createExcel();
  }

  private createExcel() {
    this.excel.innerHTML = "";
    const wrapper = document.createElement("div");
    wrapper.className = "excel-wrapper";

    this.contentArea = document.createElement("div");
    this.contentArea.className = "contentArea";
    this.updateContentArea();

    const sheetBar = this.createSheetBar();

    wrapper.appendChild(this.contentArea);
    wrapper.appendChild(sheetBar);
    this.excel.appendChild(wrapper);
  }

  private updateContentArea(): void {
    this.contentArea.innerHTML = "";
    const activeSheet = this.sheets[this.activeSheetIndex].instance;
    this.contentArea.appendChild(activeSheet.elements.topSection);
    this.contentArea.appendChild(activeSheet.elements.middleSection);
  }

  createSheetBar() {
    const sheetBar = document.createElement("div");
    sheetBar.className = "sheet-bar";

    const controls = document.createElement("div");
    controls.className = "sheet-controls";
    controls.innerHTML = `<button class="add-sheet">+</button>`;

    const tabs = document.createElement("div");
    tabs.className = "sheet-tabs";
    this.updateSheetTabs(tabs);

    const scroll = document.createElement("div");
    scroll.className = "sheet-scroll";
    scroll.innerHTML = `
            <button class="scroll-left">◀</button>
            <button class="scroll-right">▶</button>
        `;

    sheetBar.appendChild(controls);
    sheetBar.appendChild(tabs);
    sheetBar.appendChild(scroll);

    const addSheetButton = controls.querySelector(".add-sheet") as HTMLElement;
    addSheetButton.onclick = () => this.addSheet();

    tabs.onclick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.classList.contains("sheet-tab")) {
        const index = parseInt(target.dataset.index ?? "0");
        this.switchSheet(index);
      } else if (target.classList.contains("close-tab")) {
        const index = parseInt(target.dataset.index ?? "0");
        this.removeSheet(index);
      }
    };

    return sheetBar;
  }

  private updateSheetTabs(tabsContainer: HTMLElement): void {
    tabsContainer.innerHTML = this.sheets
      .map(
        (sheet, index) => `
            <div class="sheet-tab ${
              index === this.activeSheetIndex ? "active" : ""
            }" data-index="${index}">
                ${sheet.name}
                <button class="close-tab" data-index="${index}">✖</button>
            </div>
        `
      )
      .join("");
  }

  private addSheet(): void {
    const newIndex = this.sheets.length;
    // todo : check if the name already exists
    const newName = `Sheet${newIndex + 1}`;
    this.sheets.push({
      name: newName,
      instance: new SheetMaker(newName, this.row, this.col, newIndex),
    });
    this.switchSheet(newIndex);
    this.updateSheetTabs(this.excel.querySelector(".sheet-tabs")!);
  }

  private switchSheet(index: number): void {
    if (
      index !== this.activeSheetIndex &&
      index >= 0 &&
      index < this.sheets.length
    ) {
      this.activeSheetIndex = index;
      this.updateContentArea();
      this.updateSheetTabs(this.excel.querySelector(".sheet-tabs")!);
    }
  }

  private removeSheet(index: number): void {
    if (this.sheets.length <= 1) {
      alert("You cannot remove the last sheet.");
      return;
    }

    this.sheets.splice(index, 1);

    if (index === this.activeSheetIndex) {
      this.activeSheetIndex = Math.max(0, index - 1);
    } else if (index < this.activeSheetIndex) {
      this.activeSheetIndex--;
    }

    this.updateContentArea();
    this.updateSheetTabs(this.excel.querySelector(".sheet-tabs")!);
  }

  private handleEvents(): void {
    this.excel.addEventListener("click", (e: MouseEvent) => {
      this.handleMouseDown(e);
    });
  }

  private handleMouseDown(e: MouseEvent): void {
    e.preventDefault();
    this.excelHandler.updateCurrExcel(
      this.row,
      this.col,
      this.sheets[this.activeSheetIndex]
    );
  }
}
