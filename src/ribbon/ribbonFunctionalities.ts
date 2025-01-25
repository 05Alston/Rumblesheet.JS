export class RumbleSheetFunctions {
  private tabButtons!: NodeListOf<HTMLElement>;
  private tabContents!: NodeListOf<HTMLElement>;
  private toggleContentBtn!: HTMLElement | null;
  private focusZone!: HTMLElement | null;
  private featureMenuBtns!: NodeListOf<HTMLElement>;
  private ribbon!: HTMLElement | null;
  private scrollLeftBtn!: HTMLElement | null;
  private scrollRightBtn!: HTMLElement | null;
  private focusContent!: HTMLElement | null;
  private rumbleSheetBody!: HTMLElement | null;

  constructor() {
    this.initializeElements();
    this.attachEventListeners();
    this.updateRibbonScrollBtnsVisible();
  }

  private initializeElements(): void {
    this.tabButtons = document.querySelectorAll(".tablist-items");
    this.tabContents = document.querySelectorAll(".focus-tab");
    this.toggleContentBtn = document.getElementById("toggle-content");
    this.focusZone = document.querySelector(".focus-zone");
    this.featureMenuBtns = document.querySelectorAll(".feature-menu");
    this.ribbon = document.getElementById("ribbon");
    this.scrollLeftBtn = document.querySelector(".scroll-left");
    this.scrollRightBtn = document.querySelector(".scroll-right");
    this.focusContent = document.querySelector(".focus-content");
    this.rumbleSheetBody = document.querySelector(".rumble-sheet");
  }

  private toggleTabForTarget(target: HTMLElement): void {
    const index = Array.from(this.tabButtons).indexOf(target);

    this.tabButtons.forEach((tab) => {
      tab.classList.remove("active");
      tab.classList.remove("leftToActive");
      tab.classList.remove("rightToActive");
    });
    this.tabContents.forEach((content) => content.classList.remove("active"));

    this.tabButtons[index].classList.add("active");
    this.tabContents[index].classList.add("active");

    if (this.tabButtons[index - 1]) {
      this.tabButtons[index - 1].classList.add("leftToActive");
    }
    if (this.tabButtons[index + 1]) {
      this.tabButtons[index + 1].classList.add("rightToActive");
    }
  }

  private toggleContentBtnFunc(): void {
    if (this.focusZone) {
      this.focusZone.classList.toggle("expanded");
    }
    this.updateRibbonScrollBtnsVisible();
  }

  private handleFeatureMenuToggle(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    const tabSection = target.closest(".tab-section") as HTMLElement;
    const correspondingMenuBox = tabSection.querySelector(
      ".feature-box"
    ) as HTMLElement;

    if (!this.ribbon || !this.focusZone || !this.rumbleSheetBody) return;

    const ribbonRect = this.ribbon.getBoundingClientRect();
    const offset = 5;

    const relativeX =
      event.clientX - ribbonRect.left + offset - this.focusZone.offsetLeft;
    const relativeY =
      event.clientY - ribbonRect.top + offset - this.focusZone.offsetTop;

    correspondingMenuBox.classList.toggle("opened");

    let adjustedX = relativeX;
    let adjustedY = relativeY;
    const fromRightBottomOffset = 25;

    if (
      correspondingMenuBox.offsetWidth + relativeX >=
      this.rumbleSheetBody.clientWidth
    ) {
      adjustedX =
        relativeX -
        (correspondingMenuBox.offsetWidth +
          relativeX -
          this.rumbleSheetBody.clientWidth) -
        fromRightBottomOffset;
    }

    if (
      correspondingMenuBox.offsetHeight + relativeY >=
      this.rumbleSheetBody.clientHeight
    ) {
      adjustedY =
        relativeY -
        (correspondingMenuBox.offsetHeight +
          relativeY -
          this.rumbleSheetBody.clientHeight) -
        fromRightBottomOffset;
    }

    correspondingMenuBox.style.left = `${adjustedX}px`;
    correspondingMenuBox.style.top = `${adjustedY}px`;

    if (correspondingMenuBox.classList.contains("opened")) {
      const handleOutsideClick = (e: MouseEvent) => {
        if (
          !correspondingMenuBox.contains(e.target as Node) &&
          e.target !== target
        ) {
          correspondingMenuBox.classList.remove("opened");
          document.removeEventListener("click", handleOutsideClick);
        }
      };
      document.addEventListener("click", handleOutsideClick);
    }
  }

  private handleScrollRibbon(event: MouseEvent): void {
    const content = document.querySelector(".focus-tab.active") as HTMLElement;

    if (event.target instanceof HTMLElement) {
      if (event.target.closest(".scroll-left")) {
        content.scrollLeft -= 150;
      } else if (event.target.closest(".scroll-right")) {
        content.scrollLeft += 150;
      }
    }
  }

  private isOverflowingHorizontally(container: HTMLElement): boolean {
    return container.scrollWidth > container.clientWidth;
  }

  private updateRibbonScrollBtnsVisible(): void {
    if (!this.focusContent || !this.scrollLeftBtn || !this.scrollRightBtn)
      return;

    const content = document.querySelector(".focus-tab.active") as HTMLElement;

    if (this.isOverflowingHorizontally(content)) {
      if (!content.classList.contains("scrollAvailable")) {
        this.focusContent.classList.add("scrollAvailable");
        this.scrollLeftBtn.classList.add("scrollAvailable");
        this.scrollRightBtn.classList.add("scrollAvailable");
      }
    } else {
      this.focusContent.classList.remove("scrollAvailable");
      this.scrollLeftBtn.classList.remove("scrollAvailable");
      this.scrollRightBtn.classList.remove("scrollAvailable");
    }
  }

  private attachEventListeners(): void {
    this.tabButtons.forEach((tab) => {
      tab.addEventListener("click", (e) =>
        this.toggleTabForTarget(e.target as HTMLElement)
      );
    });

    if (this.toggleContentBtn) {
      this.toggleContentBtn.addEventListener("click", () =>
        this.toggleContentBtnFunc()
      );
    }

    this.featureMenuBtns.forEach((btn) => {
      btn.addEventListener("click", (e) => this.handleFeatureMenuToggle(e));
    });

    if (this.scrollLeftBtn && this.scrollRightBtn) {
      this.scrollLeftBtn.addEventListener("click", (e) =>
        this.handleScrollRibbon(e)
      );
      this.scrollRightBtn.addEventListener("click", (e) =>
        this.handleScrollRibbon(e)
      );
    }

    window.addEventListener("resize", () =>
      this.updateRibbonScrollBtnsVisible()
    );
  }
}
