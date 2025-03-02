import { RibbonFunctionalities } from "./ribbonFunctionalities.js";
import { EFontFamilies, ribbonDataActions } from "../dataStructure/interfaces.js";
import { DEFAULT_FONT_FAMILTY, DEFAULT_FONT_SIZE, FONT_FAMILY_ARRAY, FONT_SIZES_ARRAY } from "../dataStructure/constants.js";

enum TabList {
  file = "File",
  home = "Home",
  graph = "Graph",
  operations = "Operations",
  format = "Format",
}

export class Ribbon {
  private ribbonElement: HTMLElement; //ribbon element where the ribbon is to be embedded
  ribbonFunctions!: RibbonFunctionalities;
  tabs: TabList[] = [
    TabList.file,
    TabList.home,
    TabList.graph,
    TabList.operations,
    TabList.format,
  ];
  fontSizes:number[] = FONT_SIZES_ARRAY;
  fontFamilies: EFontFamilies[] = FONT_FAMILY_ARRAY;
  activeTabIndex: number = 1;

  constructor(ribbonElement: HTMLElement) {
    if (!ribbonElement) {
      //ribbon element does not exists
      throw new Error(`Element with ID ${ribbonElement} not found.`);
    }
    //updating ribbon elements values
    this.ribbonElement = ribbonElement;

    //init Ribbon
    this.initRibbon();
  }

  initRibbon() {
    this.createRibbon(); //create ribbon structure
    this.ribbonFunctions = new RibbonFunctionalities(); //add functionlities to ribbon
  }

  private getTabList(): string {
    //todo: accesibility using arrow keys, curved from upper corners when active
    return `
      <div class="tablist-container leftSection" role="tablist" aria-label="Main Tabs">
        ${this.tabs
          .map(
            (tab, index) => `
            <div
              role="tab"
              class="tablist-items${
                index === this.activeTabIndex ? " active" : ""
              }"
              aria-selected="${
                index === this.activeTabIndex ? "true" : "false"
              }"
              tabindex="${index === this.activeTabIndex ? "0" : "-1"}"
              id="tab-${index}"
              aria-controls="tabpanel-${index}"
            >
              ${tab}
            </div>
          `
          )
          .join("")}
      </div>
      <div class="rightSection">
            <p class="name">Rumblesheet</p>
            <div class="search">Search</div>
      </div>
    `;
  }
  private getFileTabContent(): string {
    return `
    <div class="focus-file">
        <input class="focus-zone-input-btn focus-zone-inner-btn-left" type="file" name="file" accept=".csv" id="fileInput">
        <button class="focus-zone-inner-btn focus-zone-inner-btn-right" type="submit" value="Upload" id="uploadButton">
            <span class="iconify" data-icon="material-symbols:upload" data-width="23" data-height="23"></span>
        </button>
    </div>
`;
  }
  private getHomeTabContent(): string {

    return `<div class="tab-section section-1">
                <div class="feature-menu menu-1">
                  <div class="icon icon-paste-20"></div>
                  <div class="name">Clipboard</div>
                  <div class="feature-menu-arrow icon-down"></div>
                </div>
                <div class="feature-box box-1">
                  <div class="content divided-in-column">
                    <div class="col">
                      <div class="feature-vertical btn" role="button" tabindex="0" data-action = '${ribbonDataActions.paste}' >
                        <div class="icon icon-paste"></div>
                        <p class="icon-name">Paste</p>
                      </div>
                    </div>
                    <div class="sub-divider collapsed"></div>
                    <div class="col">
                      <div class="feature-horizontal btn" role="button" tabindex="0"  data-action = '${ribbonDataActions.cut}' >
                        <div class="icon icon-cut"></div>
                        <p class="icon-name">Cut</p>
                      </div>
                      <div class="feature-horizontal btn" role="button" tabindex="0"  data-action = '${ribbonDataActions.copy}' >
                        <div class="icon icon-copy"></div>
                        <p class="icon-name">Copy</p>
                      </div>
                    </div>
                  </div>
                  <div class="name">Clipboard</div>
                </div>
              </div>
              <div class="divider"></div>
              <div class="tab-section section-2">
                <div class="feature-menu menu-2" >
                  <div class="icon icon-bold"></div>
                  <div class="name">Font</div>
                  <div class="feature-menu-arrow icon-down"></div>
                </div>
                <div class="feature-box box-2">
                  <div class="content divided-in-row">
                    <div class="row">
                      <select
                        class="select-options"
                        data-action = '${ribbonDataActions.fontFamily}'
                        name="font-family"
                        id="family-select"
                      >
                        ${this.fontFamilies
                        .map(
                          (family) =>
                            `<option value="${family}" ${
                              family === DEFAULT_FONT_FAMILTY ? "selected" : ""
                            }>${family}</option>`
                        )
                        .join("")}
                      </select>
                      <select
                        class="select-options"
                        data-action = '${ribbonDataActions.fontSize}'
                        name="font-size"
                        id="size-select"
                      >
                        ${this.fontSizes
                        .map(
                          (size) =>
                            `<option value="${size}" ${
                              size === DEFAULT_FONT_SIZE ? "selected" : ""
                            }>${size}</option>`
                        )
                        .join("")}
                      </select>
                      <div class="feature-icon" role="button" tabindex="0"  data-action = '${ribbonDataActions.decreaseFont}'>
                        <div class="icon icon-font-size-decrease"></div>
                        <p class="icon-name">Font Size Decrease</p>
                      </div>
                      <div class="feature-icon" role="button" tabindex="0"  data-action = '${ribbonDataActions.increaseFont}' >
                        <div class="icon icon-font-size-increase"></div>
                        <p class="icon-name">Font Size Increase</p>
                      </div>
                    </div>
                    <div class="sub-divider collapsed"></div>
                    <div class="row">
                      <div class="feature-icon" role="button" tabindex="0"  data-action = '${ribbonDataActions.bold}' >
                        <div class="icon icon-bold"></div>
                        <p class="icon-name">Bold</p>
                      </div>
                      <div class="feature-icon" role="button" tabindex="0"  data-action = '${ribbonDataActions.italic}' >
                        <div class="icon icon-italic"></div>
                        <p class="icon-name">Italic</p>
                      </div>
                      <div class="feature-icon" role="button" tabindex="0"  data-action = '${ribbonDataActions.underline}' >
                        <div class="icon icon-underline"></div>
                        <p class="icon-name">Underline</p>
                      </div>
                      <div class="feature-icon feature-icon-input">
                        <div class="icon icon-fill"></div>
                        <input type="color" data-action = '${ribbonDataActions.fillColor}' />
                        <p class="icon-name">Fill</p>
                      </div>
                      <div class="feature-icon feature-icon-input">
                        <div class="icon icon-A"></div>
                        <input type="color"  data-action = '${ribbonDataActions.textColor}' />
                        <p class="icon-name">Font Color</p>
                      </div>
                    </div>
                  </div>
                  <div class="name">Font</div>
                </div>
              </div>
              <div class="divider"></div>
              <div class="tab-section section-3">
                <div class="feature-menu menu-3">
                  <div class="icon icon-align-center"></div>
                  <div class="name">Alignment</div>
                  <div class="feature-menu-arrow icon-down"></div>
                </div>
                <div class="feature-box box-3">
                  <div class="content divided-in-row">
                    <div class="row">
                      <div class="feature-icon" role="button" tabindex="0"  data-action = '${ribbonDataActions.alignLeft}' >
                        <div class="icon icon-align-left"></div>
                        <p class="icon-name">Align Left</p>
                      </div>
                      <div class="feature-icon" role="button" tabindex="0"  data-action = '${ribbonDataActions.alignCenter}'>
                        <div class="icon icon-align-center"></div>
                        <p class="icon-name">Align Center</p>
                      </div>
                      <div class="feature-icon" role="button" tabindex="0"  data-action = '${ribbonDataActions.alignRight}' >
                        <div class="icon icon-align-right"></div>
                        <p class="icon-name">Align Right</p>
                      </div>
                    </div>
                    <div class="sub-divider collapsed"></div>
                    <div class="row">
                      <div class="feature-icon" role="button" tabindex="0"  data-action = '${ribbonDataActions.decreaseIndent}' >
                        <div class="icon icon-decrease-indent"></div>
                        <p class="icon-name">Decrease Indent</p>
                      </div>
                      <div class="feature-icon" role="button" tabindex="0"  data-action = '${ribbonDataActions.increaseIndent}' >
                        <div class="icon icon-increase-indent"></div>
                        <p class="icon-name">Increase Indent</p>
                      </div>
                    </div>
                  </div>
                  <div class="name">Alignment</div>
                </div>
              </div>
              <div class="divider"></div>

              `;
  }
  private getGraphTabContent(): string {
    return `
            <div class="focus-graph">
                <button class="focus-zone-inner-btn focus-zone-inner-btn-left" data-chart-type="bar">
                    <span class="iconify" data-icon="mdi:chart-bar" data-width="23" data-height="23"></span>
                </button>
                <button class="focus-zone-inner-btn focus-zone-inner-btn-right" data-chart-type="line">
                    <span class="iconify" data-icon="mdi:chart-line" data-width="23" data-height="23"></span>
                </button>
            </div>
        `;
  }
  private getOperationsTabContent(): string {
    return `
            <div class="focus-operations">
                <input class="focus-zone-input-btn focus-zone-inner-btn-left" type="text" id="search-input" placeholder="Search...">
                <button id="search" class="focus-zone-inner-btn focus-zone-inner-btn-right">
                    <span class="iconify" data-icon="material-symbols:search" data-width="23" data-height="23"></span>
                </button>
            </div>
        `;
  }
  private getFormatTabContent(): string {
    return "Format Tab";
  }
  private getFocusContents(): string {
    return `
      <div class="focus-content">
        ${this.tabs
          .map((tab, index) => {
            const activeClass = index === this.activeTabIndex ? "active" : "";
            const tabId = `tab-${index + 1}`;
            let tabContent = "";
            switch (tab) {
              case TabList.file:
                tabContent = this.getFileTabContent();
                break;
              case TabList.home:
                tabContent = this.getHomeTabContent();
                break;
              case TabList.graph:
                tabContent = this.getGraphTabContent();
                break;
              case TabList.operations:
                tabContent = this.getOperationsTabContent();
                break;
              case TabList.format:
                tabContent = this.getFormatTabContent();
                break;
              default:
                tabContent = `<div> No content available for ${tab} </div>`;
            }
            return `
              <div class="focus-tab ${tabId} ${activeClass}" id="${tabId}">
                ${tabContent}
              </div>
            `;
          })
          .join("")}
      </div>
    `;
  }
  private getFocusSection(): string {
    const scrollLeftEle = `<div class="scroll-left btn" role="button" tabindex="0">
            <div class="icon icon-down"></div>
          </div>`;
    const focusContents = this.getFocusContents();
    const scrollRightBtn = `<div class="scroll-right btn" role="button" tabindex="0">
            <div class="icon icon-down"></div>
          </div>`;
    const fixedToRight = `<div class="fixed-to-right">
            <button class="toggle-content-btn" id="toggle-content">
              <div class="icon icon-down"></div>
            </button>
          </div>`;
    return `${scrollLeftEle} ${focusContents} ${scrollRightBtn} ${fixedToRight}`;
  }
  private getBottomSection(): string {
    return `
          <div class="active-cell">
            <input type="text" value="A1" />
          </div>
          <div class="formula-bar">
            <div class="icon function-icon icon-fx"></div>
            <textarea rows="1"></textarea>
          </div>
       `;
  }
  private createRibbon() {
    const topSection = document.createElement("div");
    topSection.className = "top";
    topSection.innerHTML = this.getTabList();
    //top section is the tab list

    const focusSection = document.createElement("div");
    focusSection.className = "focus-zone";
    focusSection.innerHTML = this.getFocusSection();
    //focus sections is the main part where the buttons related to current tablist is present

    const bottomSection = document.createElement("div");
    bottomSection.className = "bottom";
    bottomSection.innerHTML = this.getBottomSection();
    //bottom section is for extra options at present at all tabs for formula and cell selection

    this.ribbonElement.appendChild(topSection);
    this.ribbonElement.appendChild(focusSection);
    this.ribbonElement.appendChild(bottomSection);
  }

  setTabActive(newIndex: number) {
    if (newIndex < this.tabs.length) {
      this.activeTabIndex = newIndex;
    }
  }
}
