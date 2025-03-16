import { Ribbon } from "../ribbon/ribbon.js";
import { EventManager } from "./eventManager.js";
import { excelsHandler } from "./excelsHandler.js";

export class Rumblesheet {
  container!: HTMLElement;

  constructor(containerId: string) {
    document.addEventListener("DOMContentLoaded", () => {
      const container = document.getElementById(containerId);
      if (!container) {
        throw new Error(
          `Rumblesheet container with ID '${containerId}' not found.`
        );
      }
      this.container = container;
      this.init();
    });
  }

  private init() {
    // Create ribbon and main container elements
    const ribbonContainer = document.createElement("div");
    ribbonContainer.id = "ribbon";
    ribbonContainer.className = "ribbon";

    const mainContainer = document.createElement("div");
    mainContainer.id = "mainContainer";
    mainContainer.className = "mainContainer";

    // Append them to the container
    this.container.appendChild(ribbonContainer);
    this.container.appendChild(mainContainer);

    // Initialize instances
    const maxRow = 3;
    const maxCol = 3;
    const ribbon = new Ribbon(ribbonContainer, this.container);
    const excelHandler = new excelsHandler(mainContainer, maxRow, maxCol);
    new EventManager(excelHandler, ribbon, this.container);
  }
}
