import { ExcelsHandler } from "../core/excelsHandler.js";
import { ISheetObj } from "../data/interfaces.js";
import { SheetMaker } from "./controllers/sheetMaker.js";

export class Excel {
  private readonly excelRowContainer: HTMLElement;
  private readonly excelRowNumber: number;
  private readonly excelColNumber: number;
  private readonly excelsHandler: ExcelsHandler;
  public excelElement!: HTMLElement;
  private contentArea!: HTMLElement;
  private activeSheetIndex: number = 0;
  private readonly sheetsArr: ISheetObj[] = [];

  constructor(
    excelRowContainer: HTMLElement,
    excelRowNumber: number,
    excelColNumber: number,
    excelsHandler: ExcelsHandler
  ) {
    this.excelRowContainer = excelRowContainer;
    this.excelRowNumber = excelRowNumber;
    this.excelColNumber = excelColNumber;
    this.excelsHandler = excelsHandler;
    this.init();
  }

  private init(): void {
    this.createExcelElement();
    this.createInitialSheet();
    this.appendChildrenToExcelElement();
    this.updateContentArea();
    this.notifyExcelsHandler();
    this.handleEvents();
  }

  private createExcelElement(): void {
    this.excelElement = document.createElement("div");
    this.excelElement.className = "excel resizable";
    this.excelElement.id = `row-${this.excelRowNumber}-col-${this.excelColNumber}`;
    this.excelElement.role = "gridcell";
    this.excelElement.ariaRowIndex = `${this.excelRowNumber}`;
    this.excelElement.ariaColIndex = `${this.excelColNumber}`;
    this.excelRowContainer.appendChild(this.excelElement);
  }

  private createInitialSheet(): void {
    const sheetName = "Sheet1";
    this.sheetsArr.push({
      name: sheetName,
      instance: new SheetMaker(
        sheetName,
        this.excelRowNumber,
        this.excelColNumber,
        0
      ),
    });
  }

  private appendChildrenToExcelElement() {
    this.excelElement.innerHTML = "";

    this.contentArea = document.createElement("div");
    this.contentArea.className = "content-area";

    const sheetBar = this.createSheetBar();

    this.excelElement.append(this.contentArea, sheetBar);
  }

  private updateContentArea(): void {
    this.contentArea.innerHTML = "";
    const activeSheet = this.sheetsArr[this.activeSheetIndex].instance;
    // todo : redefine top and middle section
    this.contentArea.appendChild(activeSheet.sheetSectionElements.topSection);
    this.contentArea.appendChild(
      activeSheet.sheetSectionElements.bottomSection
    );
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

    sheetBar.append(controls, tabs, scroll);

    const addSheetButton = controls.querySelector(".add-sheet") as HTMLElement;
    addSheetButton.addEventListener("click", () => this.addSheet());

    tabs.addEventListener("click", (e: MouseEvent) =>
      this.handleSheetTabClick(e)
    );

    return sheetBar;
  }

  private handleSheetTabClick(e: MouseEvent): void {
    const target = e.target as HTMLElement;
    if (target.classList.contains("sheet-tab")) {
      const index = parseInt(target.dataset.index ?? "0");
      this.switchSheet(index);
    } else if (target.classList.contains("close-tab")) {
      const index = parseInt(target.dataset.index ?? "0");
      this.removeSheet(index);
    }
  }

  private updateSheetTabs(tabsContainer: HTMLElement): void {
    tabsContainer.innerHTML = this.sheetsArr
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
    const newIndex = this.sheetsArr.length;
    // todo : check if the name already exists
    const newName = `Sheet${newIndex + 1}`;
    this.sheetsArr.push({
      name: newName,
      instance: new SheetMaker(
        newName,
        this.excelRowNumber,
        this.excelColNumber,
        newIndex
      ),
    });
    this.switchSheet(newIndex);
    this.updateSheetTabs(this.excelElement.querySelector(".sheet-tabs")!);
  }

  private switchSheet(index: number): void {
    if (
      index !== this.activeSheetIndex &&
      index >= 0 &&
      index < this.sheetsArr.length
    ) {
      this.activeSheetIndex = index;
      this.updateContentArea();
      this.updateSheetTabs(this.excelElement.querySelector(".sheet-tabs")!);
    }
  }

  private removeSheet(index: number): void {
    if (this.sheetsArr.length <= 1) {
      alert("You cannot remove the last sheet.");
      return;
    }

    this.sheetsArr.splice(index, 1);

    if (index === this.activeSheetIndex) {
      this.activeSheetIndex = Math.max(0, index - 1);
    } else if (index < this.activeSheetIndex) {
      this.activeSheetIndex--;
    }

    this.updateContentArea();
    this.updateSheetTabs(this.excelElement.querySelector(".sheet-tabs")!);
  }

  private handleEvents(): void {
    this.excelElement.addEventListener("click", (e: MouseEvent) => {
      this.handleMouseDown(e);
    });
  }

  private handleMouseDown(e: MouseEvent): void {
    e.preventDefault();
    this.notifyExcelsHandler();
  }

  private notifyExcelsHandler(): void {
    this.excelsHandler.updateCurrExcel(
      this.excelRowNumber,
      this.excelColNumber,
      this.sheetsArr[this.activeSheetIndex]
    );
  }
}
