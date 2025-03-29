import { Ribbon } from "../ribbon/ribbon.js";
import { EventManager } from "./eventManager.js";
import { ExcelsHandler } from "./excelsHandler.js";

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
    // Create rumblesheet container element
    const rumblesheetContainer = document.createElement("div");
    rumblesheetContainer.id = "rumblesheet";
    rumblesheetContainer.className = "rumblesheet";

    // Create ribbon and main container elements
    const ribbonContainer = document.createElement("div");
    ribbonContainer.id = "ribbon";
    ribbonContainer.className = "ribbon";

    const mainContainer = document.createElement("div");
    mainContainer.id = "mainContainer";
    mainContainer.className = "mainContainer";

    // Append them to the rumblesheet container
    rumblesheetContainer.appendChild(ribbonContainer);
    rumblesheetContainer.appendChild(mainContainer);

    // Append the rumblesheet container to the wrapper container
    this.wrapperContainer.appendChild(rumblesheetContainer);

    // Initialize instances
    const maxRow = 3;
    const maxCol = 3;
    this.ribbon = new Ribbon(ribbonContainer, rumblesheetContainer);
    this.excelHandler = new ExcelsHandler(mainContainer, maxRow, maxCol);
    this.eventManager = new EventManager(
      this.excelHandler,
      this.ribbon,
      rumblesheetContainer
    );
  }
}
