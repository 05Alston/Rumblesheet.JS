import { Ribbon } from "../ribbon/ribbon.js";
import { excelsHandler } from "./excelsHandler.js";
import {
  EFontFamilies,
  ETextAlign,
  ETextBaseLine,
  ribbonDataActions,
} from "../dataStructure/interfaces.js";
import {
  activePossibleActions,
  alignmentActions,
  DEFAULT_CELL_INDENT,
  DEFAULT_FONT_SIZE,
  DEFAULT_FONT_SIZE_CHANGE_VALUE,
  DEFAULT_MIN_PADDING_IN_CELL,
  INDENT_VALUE_CHANGE_VALUE,
  indentActions,
  instantActions,
  textBaseLineActions,
} from "../dataStructure/constants.js";

// eventManager.ts
export class EventManager {
  excelsHandler: excelsHandler;
  ribbon: Ribbon;

  //*Element Declarations

  //Ribbon Specific
  private tabButtons!: NodeListOf<HTMLElement>;
  private tabContents!: NodeListOf<HTMLElement>;
  private toggleContentBtn!: HTMLElement | null;
  private focusZone!: HTMLElement | null;
  private featureMenuBtns!: NodeListOf<HTMLElement>;
  private ribbonEle!: HTMLElement | null;
  private scrollLeftBtn!: HTMLElement | null;
  private scrollRightBtn!: HTMLElement | null;
  private focusContent!: HTMLElement | null;
  private rumblesheetElement!: HTMLElement;

  constructor(excelsHandler: excelsHandler, ribbon: Ribbon, rumblesheetElement: HTMLElement) {
    this.excelsHandler = excelsHandler;
    this.ribbon = ribbon;
    this.rumblesheetElement = rumblesheetElement;
    this.initializeElement();
    this.attachEvents();
  }

  private get helper() {
    return this.excelsHandler.currSheetObj?.instance.helper;
  }

  private initializeElement() {
    //ribbon elements initalization
    this.tabButtons = document.querySelectorAll(".tablist-items");
    this.tabContents = document.querySelectorAll(".focus-tab");
    this.toggleContentBtn = document.getElementById("toggle-content");
    this.focusZone = document.querySelector(".focus-zone");
    this.featureMenuBtns = document.querySelectorAll(".feature-menu");
    this.ribbonEle = document.getElementById("ribbon");
    this.scrollLeftBtn = document.querySelector(".scroll-left");
    this.scrollRightBtn = document.querySelector(".scroll-right");
    this.focusContent = document.querySelector(".focus-content");
  }

  private attachEvents() {
    this.attachRibbonEvents();
    this.uploadBtnEvents();
  }

  //* Attach Events Functions

  //ribbon specifc events

  private attachRibbonTabEvents() {
    this.tabButtons.forEach((tab) => {
      tab.addEventListener("click", (e) =>
        this.ribbon.ribbonFunctions.toggleTabForTarget(e.target as HTMLElement)
      );
    });
  }

  private attachRibbonExpandedEvents() {
    if (this.toggleContentBtn) {
      this.toggleContentBtn.addEventListener("click", () =>
        this.ribbon.ribbonFunctions.toggleContentBtnFunc()
      );
    }
  }

  private attachRibbonMenuButtonEvents() {
    this.featureMenuBtns.forEach((btn) => {
      btn.addEventListener("click", (e) =>
        this.ribbon.ribbonFunctions.handleFeatureMenuToggle(e)
      );
    });
  }

  private attachRibbonScrollButtonEvents() {
    if (this.scrollLeftBtn && this.scrollRightBtn) {
      this.scrollLeftBtn.addEventListener("click", (e) =>
        this.ribbon.ribbonFunctions.handleScrollRibbon(e)
      );
      this.scrollRightBtn.addEventListener("click", (e) =>
        this.ribbon.ribbonFunctions.handleScrollRibbon(e)
      );
    }
  }

  private attachRibbonFeatureSelectEvents() {
    const selectElementSelector = ".ribbon .select-options";
    document.querySelectorAll(selectElementSelector).forEach((selectEle) => {
      const ele = selectEle as HTMLSelectElement;
      if (ele) {
        ele.addEventListener("change", () => {
          this.handleSelectChange(ele);
        });
      }
    });
  }

  private attachRibbonFeatureColorEvents() {
    const chooseColorSelector = "input[type='color']";
    document.querySelectorAll(chooseColorSelector).forEach((colorEle) => {
      const ele = colorEle as HTMLInputElement;
      if (ele) {
        ele.addEventListener("input", () => {
          this.handleColorElement(ele);
        });
      }
    });
  }

  private attachRibbonFeatureButtonEvents() {
    if (!this.focusZone) {
      //no focus zone detected
      return;
    }
    const selector =
      '.feature-box .feature-icon[role="button"], .feature-box .feature-horizontal[role="button"], .feature-box .feature-vertical[role="button"]';

    this.focusZone.addEventListener("click", (event: Event) => {
      const target = event.target as HTMLElement;
      const button = target.closest(selector) as HTMLElement | null;
      if (button) {
        this.performRibbonAction(button);
      }
    });

    // Keyboard event listener for accessibility
    this.focusZone.addEventListener("keydown", (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      const button = target.closest(selector) as HTMLElement | null;
      if (button && (event.key === "Enter" || event.key === " ")) {
        event.preventDefault(); // Prevent scrolling when Space is pressed
        this.performRibbonAction(button);
      }
    });
  }

  private attachRibbonFeatureEvents() {
    this.attachRibbonFeatureSelectEvents();
    this.attachRibbonFeatureColorEvents();
    this.attachRibbonFeatureButtonEvents();
  }

  //all events

  private attachRibbonEvents(): void {
    this.attachRibbonTabEvents();
    this.attachRibbonExpandedEvents();
    this.attachRibbonMenuButtonEvents();
    this.attachRibbonScrollButtonEvents();
    this.attachRibbonFeatureEvents();
  }

  private uploadBtnEvents(): void {
    //todo not updated as per use till now
    const uploadButton = document.getElementById(
      "uploadButton"
    ) as HTMLButtonElement;
    if (uploadButton) {
      uploadButton.addEventListener(
        "click",
        this.excelsHandler.plugin.handleFileUpload.bind(this.excelsHandler.plugin)
      );
    } else {
      console.error("Upload button not found.");
    }
  }

  //* Handler Functions

  handleFileUpload(): void {
    //todo yet to be updated
    const fileInput = document.getElementById("fileInput") as HTMLInputElement;
    const file = fileInput.files ? fileInput.files[0] : null;

    if (file) {
      this.handleCsvUpload(file);
    } else {
      // console.log("No file selected.");
    }
  }

  public async handleCsvUpload(file: File): Promise<void> {
    //todo yet to be updated
    const fileData = await file.text();
    const rows: string[][] = fileData
      .split("\n")
      .map((line) => line.split(",").map((value) => value.trim()));

    alert("CSV uploaded and matrix populated successfully.");
  }

  public performRibbonAction(ele: HTMLElement) {
    if (!ele) {
      return;
    }
    const action = ele.dataset.action as ribbonDataActions;

    // Handling toggle actions (Bold, Italic, Underline)
    if (activePossibleActions.includes(action)) {
      ele.classList.toggle("active");
      const updatedState = ele.classList.contains("active");
      this.updateCellFormatting(action, updatedState);
    }
    // Handling actions like alignment
    else if (alignmentActions.includes(action)) {
      this.handleGroupRibbonActions(alignmentActions, ele);
      this.updateCellFormatting(action, true);
    }
    else if(textBaseLineActions.includes(action)){
      this.handleGroupRibbonActions(textBaseLineActions,ele);
      this.updateCellFormatting(action,true)
    }
    // Handling indent actions
    else if (indentActions.includes(action)) {
      this.handleGroupRibbonActions(indentActions, ele);
      this.updateCellFormatting(action, true);
    } else if (instantActions.includes(action)) {
      this.updateCellFormatting(action, true);
    } else {
      console.log("Unhandled action: ", action);
    }
  }

  private handleGroupRibbonActions(
    group: ribbonDataActions[],
    currEle: HTMLElement
  ) {
    group.forEach((groupAction) => {
      const indiEle = document.querySelector(`[data-action="${groupAction}"]`);
      if (indiEle) indiEle.classList.remove("active");
    });
    currEle.classList.add("active");
  }

  private updateCellFormatting(
    action: ribbonDataActions,
    isActive: boolean,
    newValue: string = ""
  ) {
    console.log(action, isActive);
    const selectedCells = this.helper?.mainCellManager.getCurrSelectedCells();
    if (selectedCells) {
      selectedCells.forEach((cellDetails) => {
        if (cellDetails && cellDetails.cell) {
          switch (action) {
            case ribbonDataActions.bold:
              cellDetails.cell.styles.bold = isActive;
              break;
            case ribbonDataActions.italic:
              cellDetails.cell.styles.italic = isActive;
              break;
            case ribbonDataActions.underline:
              cellDetails.cell.styles.underline = isActive;
              break;
            case ribbonDataActions.alignLeft:
              cellDetails.cell.styles.textAlign = ETextAlign.left;
              break;
            case ribbonDataActions.alignRight:
              cellDetails.cell.styles.textAlign = ETextAlign.right;
              break;
            case ribbonDataActions.alignCenter:
              cellDetails.cell.styles.textAlign = ETextAlign.center;
              break;
            case ribbonDataActions.increaseFont:
              cellDetails.cell.styles.fontSize =
                (cellDetails.cell.styles.fontSize ?? DEFAULT_FONT_SIZE) +
                DEFAULT_FONT_SIZE_CHANGE_VALUE;
              break;
            case ribbonDataActions.decreaseFont:
              cellDetails.cell.styles.fontSize =
                (cellDetails.cell.styles.fontSize ?? DEFAULT_FONT_SIZE) -
                DEFAULT_FONT_SIZE_CHANGE_VALUE;
              break;
            case ribbonDataActions.textBaselineTop:
              cellDetails.cell.styles.textBaseline = ETextBaseLine.top;
              console.log("done")
              break;
            case ribbonDataActions.textBaselineMiddle:
              cellDetails.cell.styles.textBaseline = ETextBaseLine.middle;
              break;
            case ribbonDataActions.textBaselineBottom:
              cellDetails.cell.styles.textBaseline = ETextBaseLine.bottom;
              break;
            case ribbonDataActions.cut:
              //todo - to be handled
              break;
            case ribbonDataActions.copy:
              //todo - to be handled
              break;
            case ribbonDataActions.paste:
              //todo - to be handled
              break;
            case ribbonDataActions.fontFamily:
              cellDetails.cell.styles.fontFamily = newValue as EFontFamilies;
              break;
            case ribbonDataActions.fontSize:
              cellDetails.cell.styles.fontSize = parseInt(newValue);
              break;
            case ribbonDataActions.fillColor:
              cellDetails.cell.styles.fill = newValue;
              break;
            case ribbonDataActions.textColor:
              cellDetails.cell.styles.color = newValue;
              break;
            case ribbonDataActions.increaseIndent:
              //todo - handle properly after resize is implemented
              cellDetails.cell.styles.textIndent =
                (cellDetails.cell.styles.textIndent ?? DEFAULT_CELL_INDENT) +
                INDENT_VALUE_CHANGE_VALUE;
              break;
            case ribbonDataActions.decreaseIndent:
              cellDetails.cell.styles.textIndent = Math.max(
                0,
                (cellDetails.cell.styles.textIndent ?? DEFAULT_CELL_INDENT) -
                  INDENT_VALUE_CHANGE_VALUE
              );
              break;
            default:
              console.log("other button clicked");
              break;
          }
        }
      });
    }
    this.helper?.mainCellManager.draw();
  }

  private handleSelectChange(selectElement: HTMLSelectElement) {
    const ele = selectElement as HTMLSelectElement;
    const action = ele.dataset.action as ribbonDataActions;
    if (ele && ele.value && action) {
      this.updateCellFormatting(action, true, ele.value);
    }
  }

  private handleColorElement(inputTypeColorEle: HTMLElement) {
    const ele = inputTypeColorEle as HTMLInputElement;
    const action = ele.dataset.action as ribbonDataActions;
    if (ele && ele.value && action) {
      this.updateCellFormatting(action, true, ele.value);
    }
  }
}
