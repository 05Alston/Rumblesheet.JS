import {
  activePossibleActions,
  alignmentActions,
  DEFAULT_CELL_INDENT,
  DEFAULT_FONT_SIZE,
  DEFAULT_FONT_SIZE_CHANGE_VALUE,
  INDENT_VALUE_CHANGE_VALUE,
  indentActions,
  instantActions,
  textBaseLineActions,
} from "../data/constants.js";
import {
  EFontFamilies,
  ERibbonDataActions,
  ETextAlign,
  ETextBaseLine,
} from "../data/enums.js";
import { Ribbon } from "../ribbon/ribbon.js";
import { ExcelsHandler } from "./excelsHandler.js";

// eventManager.ts
export class EventManager {
  excelsHandler: ExcelsHandler;
  ribbon: Ribbon;

  //*Element Declarations

  //Ribbon Specific
  private tabButtons!: NodeListOf<HTMLElement>;
  private toggleContentBtn!: HTMLElement | null;
  private focusZone!: HTMLElement | null;
  private featureMenuBtns!: NodeListOf<HTMLElement>;
  private scrollLeftBtn!: HTMLElement | null;
  private scrollRightBtn!: HTMLElement | null;

  constructor(excelsHandler: ExcelsHandler, ribbon: Ribbon) {
    this.excelsHandler = excelsHandler;
    this.ribbon = ribbon;
    this.initializeElement();
    this.attachEvents();
  }

  private get currentSheetObjHelper() {
    return this.excelsHandler.currSheetObj?.instance.helper;
  }

  private initializeElement() {
    //ribbon elements initalization
    this.tabButtons = document.querySelectorAll(".rumblesheet .tablist-items");
    this.toggleContentBtn = document.querySelector(
      ".rumblesheet #toggle-content"
    );
    this.focusZone = document.querySelector(".rumblesheet .focus-zone");
    this.featureMenuBtns = document.querySelectorAll(
      ".rumblesheet .feature-menu"
    );
    this.scrollLeftBtn = document.querySelector(".rumblesheet .scroll-left");
    this.scrollRightBtn = document.querySelector(".rumblesheet .scroll-right");
  }

  private attachEvents() {
    this.attachRibbonEvents();
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

  //* Handler Functions

  public performRibbonAction(ele: HTMLElement) {
    if (!ele) {
      return;
    }
    const action = ele.dataset.action as ERibbonDataActions;

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
    } else if (textBaseLineActions.includes(action)) {
      this.handleGroupRibbonActions(textBaseLineActions, ele);
      this.updateCellFormatting(action, true);
    }
    // Handling indent actions
    else if (indentActions.includes(action)) {
      this.handleGroupRibbonActions(indentActions, ele);
      this.updateCellFormatting(action, true);
    } else if (instantActions.includes(action)) {
      this.updateCellFormatting(action, true);
    } else {
      // conosle.log("Unhandled action: ", action);
    }
  }

  private handleGroupRibbonActions(
    group: ERibbonDataActions[],
    currEle: HTMLElement
  ) {
    group.forEach((groupAction) => {
      const indiEle = document.querySelector(`[data-action="${groupAction}"]`);
      if (indiEle) indiEle.classList.remove("active");
    });
    currEle.classList.add("active");
  }

  private updateCellFormatting(
    action: ERibbonDataActions,
    isActive: boolean,
    newValue: string = ""
  ) {
    // conosle.log(action, isActive);
    const selectedCells =
      this.currentSheetObjHelper?.mainCellManager.getCurrSelectedCells();
    if (selectedCells) {
      console.log(selectedCells)
      selectedCells.forEach((cellDetails) => {
        if (cellDetails && cellDetails.cell) {
          switch (action) {
            case ERibbonDataActions.Bold:
              cellDetails.cell.styles.bold = isActive;
              break;
            case ERibbonDataActions.Italic:
              cellDetails.cell.styles.italic = isActive;
              break;
            case ERibbonDataActions.Underline:
              cellDetails.cell.styles.underline = isActive;
              break;
            case ERibbonDataActions.AlignLeft:
              cellDetails.cell.styles.textAlign = ETextAlign.Left;
              break;
            case ERibbonDataActions.AlignRight:
              cellDetails.cell.styles.textAlign = ETextAlign.Right;
              break;
            case ERibbonDataActions.AlignCenter:
              cellDetails.cell.styles.textAlign = ETextAlign.Center;
              break;
            case ERibbonDataActions.IncreaseFont:
              cellDetails.cell.styles.fontSize =
                (cellDetails.cell.styles.fontSize ?? DEFAULT_FONT_SIZE) +
                DEFAULT_FONT_SIZE_CHANGE_VALUE;
              break;
            case ERibbonDataActions.DecreaseFont:
              cellDetails.cell.styles.fontSize =
                (cellDetails.cell.styles.fontSize ?? DEFAULT_FONT_SIZE) -
                DEFAULT_FONT_SIZE_CHANGE_VALUE;
              break;
            case ERibbonDataActions.TextBaselineTop:
              cellDetails.cell.styles.textBaseline = ETextBaseLine.Start;
              break;
            case ERibbonDataActions.TextBaselineMiddle:
              cellDetails.cell.styles.textBaseline = ETextBaseLine.Middle;
              break;
            case ERibbonDataActions.TextBaselineBottom:
              cellDetails.cell.styles.textBaseline = ETextBaseLine.End;
              break;
            case ERibbonDataActions.Cut:
              // TODO - to be handled
              break;
            case ERibbonDataActions.Copy:
              // TODO - to be handled
              break;
            case ERibbonDataActions.Paste:
              // TODO - to be handled
              break;
            case ERibbonDataActions.FontFamily:
              cellDetails.cell.styles.fontFamily = newValue as EFontFamilies;
              break;
            case ERibbonDataActions.FontSize:
              cellDetails.cell.styles.fontSize = parseInt(newValue);
              break;
            case ERibbonDataActions.FillColor:
              cellDetails.cell.styles.fill = newValue;
              break;
            case ERibbonDataActions.TextColor:
              cellDetails.cell.styles.color = newValue;
              break;
            case ERibbonDataActions.IncreaseIndent:
              // TODO - handle properly after resize is implemented
              cellDetails.cell.styles.textIndent =
                (cellDetails.cell.styles.textIndent ?? DEFAULT_CELL_INDENT) +
                INDENT_VALUE_CHANGE_VALUE;
              break;
            case ERibbonDataActions.DecreaseIndent:
              cellDetails.cell.styles.textIndent = Math.max(
                0,
                (cellDetails.cell.styles.textIndent ?? DEFAULT_CELL_INDENT) -
                  INDENT_VALUE_CHANGE_VALUE
              );
              break;
            default:
              // conosle.log("other button clicked");
              break;
          }
        }
      });
    }
    this.currentSheetObjHelper?.updateDrawForFeatures()
  }

  private handleSelectChange(selectElement: HTMLSelectElement) {
    const ele = selectElement as HTMLSelectElement;
    const action = ele.dataset.action as ERibbonDataActions;
    if (ele && ele.value && action) {
      this.updateCellFormatting(action, true, ele.value);
    }
  }

  private handleColorElement(inputTypeColorEle: HTMLElement) {
    const ele = inputTypeColorEle as HTMLInputElement;
    const action = ele.dataset.action as ERibbonDataActions;
    if (ele && ele.value && action) {
      this.updateCellFormatting(action, true, ele.value);
    }
  }
}
