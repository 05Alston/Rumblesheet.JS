import { Ribbon } from "../ribbon/ribbon.js";
import { EventManager } from "./eventManager.js";
import { ExcelsHandler } from "./excelsHandler.js";

export class Rumblesheet {
  container!: HTMLElement;
  ribbon!: Ribbon;
  excelHandler!: ExcelsHandler;
  eventManager!: EventManager;

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
    this.ribbon = new Ribbon(ribbonContainer, this.container);
    this.excelHandler = new ExcelsHandler(mainContainer, maxRow, maxCol);
    this.eventManager = new EventManager(
      this.excelHandler,
      this.ribbon,
      this.container
    );
  }
}
