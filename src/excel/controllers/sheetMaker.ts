import { ISheetSectionElements } from "../../data/interfaces.js";
import { MainCellManager } from "../../features/mainCell/mainCellManager.js";
import { Helper } from "../helper/helper.js";

export class SheetMaker {
  sheetName: string;
  row: number;
  col: number;
  index: number;
  sheetSectionElements: ISheetSectionElements;
  helper?: Helper;
  mainCellManager?: MainCellManager;

  constructor(sheetName: string, row: number, col: number, index: number) {
    this.sheetName = sheetName;
    this.row = row;
    this.col = col;
    this.index = index;

    this.sheetSectionElements = {
      topSection: this.createTopSection(),
      bottomSection: this.createBottomSection(),
    };
    this.waitForSectionsToRender();
  }

  waitForSectionsToRender() {
    const observer = new MutationObserver((mutationsList) => {
      for (const _ of mutationsList) {
        // Check if the added nodes include both topSection and bototomSection
        if (
          document.body.contains(this.sheetSectionElements.topSection) &&
          document.body.contains(this.sheetSectionElements.bottomSection)
        ) {
          // Once both sections are added, instantiate this.helper
          this.helper = new Helper(this);
          observer.disconnect(); // Stop observing
          break;
        }
      }
    });

    // Start observing the DOM for changes
    observer.observe(document.body, { childList: true, subtree: true });
  }

  private createTopSection(): HTMLElement {
    const topSection = document.createElement("div");
    topSection.id = `top-section-${this.row}-${this.col}-${this.index}`;
    topSection.className = "top-section";

    const nothing = document.createElement("div");
    nothing.id = `nothing-${this.row}-${this.col}-${this.index}`;
    nothing.className = "nothing";

    const horizontalCanvasWrapper = document.createElement("div");
    horizontalCanvasWrapper.id = `horizontal-canvas-wrapper-${this.row}-${this.col}-${this.index}`;
    horizontalCanvasWrapper.className = "horizontal-canvas-wrapper";

    const horizontalCanvas = document.createElement("canvas");
    horizontalCanvas.id = `horizontal-canvas-${this.row}-${this.col}-${this.index}`;
    horizontalCanvas.className = "horizontal-canvas";

    horizontalCanvasWrapper.appendChild(horizontalCanvas);
    topSection.appendChild(nothing);
    topSection.appendChild(horizontalCanvasWrapper);

    return topSection;
  }

  private createBottomSection(): HTMLElement {
    const bottomSection = document.createElement("div");
    bottomSection.id = `bottom-section-${this.row}-${this.col}-${this.index}`;
    bottomSection.className = "bottom-section";

    const verticalCanvasWrapper = document.createElement("div");
    verticalCanvasWrapper.id = `vertical-canvas-wrapper-${this.row}-${this.col}-${this.index}`;
    verticalCanvasWrapper.className = "vertical-canvas-wrapper";

    const verticalCanvas = document.createElement("canvas");
    verticalCanvas.id = `vertical-canvas-${this.row}-${this.col}-${this.index}`;
    verticalCanvas.className = `vertical-canvas`;

    verticalCanvasWrapper.appendChild(verticalCanvas);

    const spreadsheetCanvasWrapper = document.createElement("div");
    spreadsheetCanvasWrapper.id = `spreadsheet-canvas-wrapper-${this.row}-${this.col}-${this.index}`;
    spreadsheetCanvasWrapper.className = "spreadsheet-canvas-wrapper";

    const spreadsheetCanvas = document.createElement("canvas");
    spreadsheetCanvas.id = `spreadsheet-canvas-${this.row}-${this.col}-${this.index}`;
    spreadsheetCanvas.className = "spreadsheet-canvas";

    const verticalScroll = this.createScrollbar("vertical");
    const horizontalScroll = this.createScrollbar("horizontal");

    const inputEle = document.createElement("div");
    inputEle.setAttribute("contenteditable", "true");
    inputEle.id = `input_${this.row}_${this.col}_${this.index}`;
    inputEle.className = "input";

    spreadsheetCanvasWrapper.appendChild(inputEle);
    spreadsheetCanvasWrapper.appendChild(spreadsheetCanvas);
    spreadsheetCanvasWrapper.appendChild(verticalScroll);
    spreadsheetCanvasWrapper.appendChild(horizontalScroll);

    bottomSection.appendChild(verticalCanvasWrapper);
    bottomSection.appendChild(spreadsheetCanvasWrapper);

    return bottomSection;
  }

  private createScrollbar(orientation: "vertical" | "horizontal"): HTMLElement {
    const scroll = document.createElement("div");
    scroll.id = `${orientation}-scroll-${this.row}-${this.col}-${this.index}`;
    scroll.className = `${orientation}-scroll`;

    const bar = document.createElement("div");
    bar.id = `${orientation}-bar-${this.row}-${this.col}-${this.index}`;
    bar.className = `${orientation}-bar`;

    scroll.appendChild(bar);
    return scroll;
  }
}
