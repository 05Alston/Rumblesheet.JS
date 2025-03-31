import { EventManager } from "./core/eventManager.js";
import { ExcelsHandler } from "./core/excelsHandler.js";
import { Ribbon } from "./ribbon/ribbon.js";

export class Rumblesheet {
  wrapperContainer!: HTMLElement;
  ribbon!: Ribbon;
  excelHandler!: ExcelsHandler;
  eventManager!: EventManager;

  constructor(wrapperContainerId: string) {
    document.addEventListener("DOMContentLoaded", () => {
      const wrapperContainer = document.getElementById(wrapperContainerId);
      if (!wrapperContainer) {
        throw new Error(
          `Rumblesheet container with ID '${wrapperContainer}' not found.`
        );
      }
      this.wrapperContainer = wrapperContainer;
      this.init();
    });
  }

  private init() {
    const rumblesheetContainer = this.createRumblesheetContainer();
    const ribbonContainer = this.createRibbonContainer(rumblesheetContainer);
    const mainContainer = this.createMainContainer(rumblesheetContainer);

    this.wrapperContainer.appendChild(rumblesheetContainer);

    this.initializeInstances(ribbonContainer, mainContainer);
  }

  private createRumblesheetContainer(): HTMLElement {
    const rumblesheetContainer = document.createElement("div");
    rumblesheetContainer.id = "rumblesheet";
    rumblesheetContainer.className = "rumblesheet";
    return rumblesheetContainer;
  }

  private createRibbonContainer(parent: HTMLElement): HTMLElement {
    const ribbonContainer = document.createElement("div");
    ribbonContainer.id = "ribbon";
    ribbonContainer.className = "ribbon";
    parent.appendChild(ribbonContainer);
    return ribbonContainer;
  }

  private createMainContainer(parent: HTMLElement): HTMLElement {
    const mainContainer = document.createElement("div");
    mainContainer.id = "mainContainer";
    mainContainer.className = "mainContainer";
    parent.appendChild(mainContainer);
    return mainContainer;
  }

  private initializeInstances(
    ribbonContainer: HTMLElement,
    mainContainer: HTMLElement
  ): void {
    const maxRow = 3;
    const maxCol = 3;
    this.ribbon = new Ribbon(ribbonContainer, ribbonContainer.parentElement!);
    this.excelHandler = new ExcelsHandler(mainContainer, maxRow, maxCol);
    this.eventManager = new EventManager(this.excelHandler, this.ribbon);
  }
}
