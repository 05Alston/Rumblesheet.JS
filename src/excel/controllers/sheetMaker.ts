import { MainCellManager } from "../../features/mainCell/mainCellManager.js";
import { Helper } from "../helper/helper.js";

export class SheetMaker {
  name: string;
  row: number;
  col: number;
  index: number;
  elements: { topSection: HTMLElement; middleSection: HTMLElement };
  helper?: Helper;
  mainCellManager?: MainCellManager;

  constructor(name: string, row: number, col: number, index: number) {
    this.name = name;
    this.row = row;
    this.col = col;
    this.index = index;

    this.elements = {
      topSection: this.createTopSection(),
      middleSection: this.createMiddleSection(),
    };
    this.waitForSectionsToRender();
  }

  waitForSectionsToRender() {
    const observer = new MutationObserver((mutationsList) => {
      for (const mutation of mutationsList) {
        // Check if the added nodes include both topSection and middleSection
        if (
          document.body.contains(this.elements.topSection) &&
          document.body.contains(this.elements.middleSection)
        ) {
          // Once both sections are added, instantiate this.helper
          this.helper = new Helper(this);
          this.initiatefeature();
          observer.disconnect(); // Stop observing
          break;
        }
      }
    });

    // Start observing the DOM for changes
    observer.observe(document.body, { childList: true, subtree: true });
  }

  private initiatefeature() {
    // to add helper to feature classes
    this.mainCellManager = new MainCellManager(this);
  }

  private createTopSection(): HTMLElement {
    const topSection = document.createElement("div");
    topSection.id = `topsection_${this.row}_${this.col}_${this.index}`;
    topSection.className = "top-section";

    const nothing = document.createElement("div");
    nothing.id = `nothing_${this.row}_${this.col}_${this.index}`;
    nothing.className = "nothing";

    const upperCanvas = document.createElement("div");
    upperCanvas.id = `upperCanvas_${this.row}_${this.col}_${this.index}`;
    upperCanvas.className = "upperCanvas";

    const horizontalCanvas = document.createElement("canvas");
    horizontalCanvas.id = `horizontalCanvas_${this.row}_${this.col}_${this.index}`;
    horizontalCanvas.className = "horizontalCanvas";

    upperCanvas.appendChild(horizontalCanvas);
    topSection.appendChild(nothing);
    topSection.appendChild(upperCanvas);

    return topSection;
  }

  private createMiddleSection(): HTMLElement {
    const midSection = document.createElement("div");
    midSection.id = `midSection_${this.row}_${this.col}_${this.index}`;
    midSection.className = "middleSection";

    const verticalCanvasWrapper = document.createElement("div");
    verticalCanvasWrapper.id = `verticalCanvasWrapper_${this.row}_${this.col}_${this.index}`;
    verticalCanvasWrapper.className = "verticalCanvas";

    const verticalCanvas = document.createElement("canvas");
    verticalCanvas.id = `verticalCanvas_${this.row}_${this.col}_${this.index}`;

    verticalCanvasWrapper.appendChild(verticalCanvas);

    const fullCanvas = document.createElement("div");
    fullCanvas.id = `fullCanvas_${this.row}_${this.col}_${this.index}`;
    fullCanvas.className = "fullCanvas";

    const spreadsheetCanvas = document.createElement("canvas");
    spreadsheetCanvas.id = `spreadsheetCanvas_${this.row}_${this.col}_${this.index}`;
    spreadsheetCanvas.className = "spreadsheetCanvas";

    const verticalScroll = this.createScrollbar("vertical");
    const horizontalScroll = this.createScrollbar("horizontal");

    const inputEle = document.createElement("div");
    inputEle.setAttribute("contenteditable", "true");
    inputEle.id = `input_${this.row}_${this.col}_${this.index}`;
    inputEle.className = "input";

    fullCanvas.appendChild(inputEle);
    fullCanvas.appendChild(spreadsheetCanvas);
    fullCanvas.appendChild(verticalScroll);
    fullCanvas.appendChild(horizontalScroll);

    midSection.appendChild(verticalCanvasWrapper);
    midSection.appendChild(fullCanvas);

    return midSection;
  }

  private createScrollbar(orientation: "vertical" | "horizontal"): HTMLElement {
    const scroll = document.createElement("div");
    scroll.id = `${orientation}Scroll_${this.row}_${this.col}_${this.index}`;
    scroll.className = `${orientation}Scroll`;

    const bar = document.createElement("div");
    bar.id = `${orientation}Bar_${this.row}_${this.col}_${this.index}`;
    bar.className = `${orientation}Bar`;

    scroll.appendChild(bar);
    return scroll;
  }
}
