export class Ribbon {
    private ribbonElement: HTMLElement;
    private activeTab: HTMLElement | null;
    private oldInput!: number;

    constructor(ribbonElement: HTMLElement) {
        if (!ribbonElement) {
            throw new Error(`Element with ID ${ribbonElement} not found.`);
        }
        this.ribbonElement = ribbonElement;
        this.activeTab = null;

        this.createRibbon();
        this.handleEvents();
    }

    private createRibbon(): void {
        // Clear existing content
        this.ribbonElement.innerHTML = '';

        // Create progress bar
        const progressBar = document.createElement('div');
        progressBar.className = 'progress';
        progressBar.setAttribute('role', 'progressbar');
        progressBar.setAttribute('aria-valuenow', '75');
        progressBar.setAttribute('aria-valuemin', '0');
        progressBar.setAttribute('aria-valuemax', '100');
        progressBar.innerHTML = `<div class="progress-bar progress-bar-striped progress-bar-animated"></div>`;
        this.ribbonElement.appendChild(progressBar);

        // Create tab list container
        const tabListContainer = document.createElement('div');
        tabListContainer.className = 'tab-list-container';
        tabListContainer.innerHTML = `
            <span class="tab-list-container-items format-tab-btn active">Format</span>
            <span class="tab-list-container-items file-tab-btn">File</span>
            <span class="tab-list-container-items operations-tab-btn">Operations</span>
            <span class="tab-list-container-items graph-tab-btn">Graph</span>
        `;
        this.ribbonElement.appendChild(tabListContainer);

        // Create focus zone
        const focusZone = document.createElement('div');
        focusZone.className = 'focus-zone';
        focusZone.innerHTML = `
            <div class="row focus-zone-inner">
                <div class="focus-zone-left">
                    ${this.createFormatSection()}
                    ${this.createFileSection()}
                    ${this.createOperationsSection()}
                    ${this.createGraphSection()}
                </div>
                <div class="focus-zone-right">
                    <button class="add-new-row focus-zone-inner-btn focus-zone-inner-btn-left">
                        <span class="iconify" data-icon="majesticons:add-row" data-width="23" data-height="23"></span>
                    </button>
                    <button class="delete-excel focus-zone-inner-btn focus-zone-inner-btn-middle">
                        <span class="iconify" data-icon="mdi:table-large-remove" data-width="23" data-height="23"></span>
                    </button>
                    <button class="add-new-col focus-zone-inner-btn focus-zone-inner-btn-right">
                        <span class="iconify" data-icon="majesticons:add-column" data-width="23" data-height="23"></span>
                    </button>
                </div>
            </div>
        `;
        this.ribbonElement.appendChild(focusZone);
    }

    private createFormatSection(): String {
        return `
        <div class="focus-format active">
            <button class="focus-zone-inner-btn focus-zone-inner-btn-left font-bold-btn active">
                <span class="iconify" data-icon="f7:bold" data-width="23" data-height="23"></span>
            </button>
            <button class="focus-zone-inner-btn focus-zone-inner-btn-middle font-italic-btn">
                <span class="iconify" data-icon="lucide:italic" data-width="23" data-height="23"></span>
            </button>
            <button class="focus-zone-inner-btn focus-zone-inner-btn-middle font-strikethrough-btn">
                <span class="iconify" data-icon="majesticons:strike-through-line" data-width="23" data-height="23"></span>
            </button>
            <button class="focus-zone-inner-btn focus-zone-inner-btn-right font-underline-btn">
                <span class="iconify" data-icon="lucide:underline" data-width="23" data-height="23"></span>
            </button>

            <div class="focus-zone-inner-seperator"></div>

            <button class="focus-zone-inner-btn focus-zone-inner-btn-left horizontal-left-btn active">
                <span class="iconify" data-icon="mingcute:align-left-line" data-width="23" data-height="23"></span>
            </button>
            <button class="focus-zone-inner-btn focus-zone-inner-btn-middle horizontal-center-btn">
                <span class="iconify" data-icon="mingcute:align-center-line" data-width="23" data-height="23"></span>
            </button>
            <button class="focus-zone-inner-btn focus-zone-inner-btn-right horizontal-right-btn">
                <span class="iconify" data-icon="mingcute:align-right-line" data-width="23" data-height="23"></span>
            </button>

            <div class="focus-zone-inner-seperator"></div>

            <button class="focus-zone-inner-btn focus-zone-inner-btn-left vertical-top-btn">
                <span class="iconify" data-icon="material-symbols:vertical-align-top-rounded" data-width="23" data-height="23"></span>
            </button>
            <button class="focus-zone-inner-btn focus-zone-inner-btn-middle vertical-middle-btn active">
                <span class="iconify" data-icon="material-symbols:vertical-align-center-rounded" data-width="23" data-height="23"></span>
            </button>
            <button class="focus-zone-inner-btn focus-zone-inner-btn-right vertical-bottom-btn">
                <span class="iconify" data-icon="material-symbols:vertical-align-bottom-rounded" data-width="23" data-height="23"></span>
            </button>

            <div class="focus-zone-inner-seperator"></div>

            <button class="focus-zone-inner-btn focus-zone-inner-btn-left decrement-font-size-btn">
                <span class="iconify" data-icon="ph:minus-bold" data-width="23" data-height="23"></span>
            </button>

            <input class="font-size-input" type="text" id="fontSize" value="14">

            <button class="focus-zone-inner-btn focus-zone-inner-btn-right increment-font-size-btn">
                <span class="iconify" data-icon="ph:plus-bold" data-width="23" data-height="23"></span>
            </button>

            <div class="focus-zone-inner-seperator"></div>

            <select class="font-family-select" id="fontFamily">
                <option class="font-family-option" value="Arial" style="font-family: Arial;">Arial</option>
                <option class="font-family-option" value="Times New Roman" style="font-family: 'Times New Roman';">Times New Roman</option>
                <option class="font-family-option" value="Verdana" style="font-family: Verdana;">Verdana</option>
            </select>

            <div class="focus-zone-inner-seperator"></div>

            <button class="focus-zone-inner-btn focus-zone-inner-btn-left">
                <label for="text-color-picker">
                    <span class="iconify" data-icon="tabler:letter-a" data-width="23" data-height="23"></span>
                </label>
                <input id="text-color-picker" type="color" title="Text Color">
            </button>

            <button class="focus-zone-inner-btn focus-zone-inner-btn-right">
                <label for="fill-color-picker">
                    <span class="iconify" data-icon="mdi:format-colour-fill" data-width="23" data-height="23"></span>
                </label>
                <input id="fill-color-picker" type="color" title="Fill Color">
            </button>
        </div>
    `;
    }

    private createFileSection(): String {
        return `
            <div class="focus-file">
                <input class="focus-zone-input-btn focus-zone-inner-btn-left" type="file" name="file" accept=".csv">
                <button class="focus-zone-inner-btn focus-zone-inner-btn-right" type="submit" value="Upload">
                    <span class="iconify" data-icon="material-symbols:upload" data-width="23" data-height="23"></span>
                </button>
            </div>
        `;
    }

    private createOperationsSection(): String {
        return `
            <div class="focus-operations">
                <input class="focus-zone-input-btn focus-zone-inner-btn-left" type="text" id="search-input" placeholder="Search...">
                <button id="search" class="focus-zone-inner-btn focus-zone-inner-btn-right">
                    <span class="iconify" data-icon="material-symbols:search" data-width="23" data-height="23"></span>
                </button>
            </div>
        `;
    }

    private createGraphSection(): String {
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

    private handleEvents(): void {
        this.addTabEventListeners(); // Add tab switch listeners
        this.addFontSizeEventListeners(); // Add Font Size listeners
        this.addFontFamilyListener; // Add Font Family listeners
        this.addTextFormatListeners(); // Add text format listeners
        this.addTextColorListener(); // Add text color listener
        this.addFillColorListener(); // Add fill color listener
        this.addHorizontalAlignmentListeners(); // Add horizontal alignment listeners
        this.addVerticalAlignmentListeners(); // Add vertical alignment listeners
    }

    private addTabEventListeners(): void {
        const tabButtons: { [key: string]: HTMLElement } = {
            format: this.ribbonElement.querySelector(".format-tab-btn") as HTMLElement,
            file: this.ribbonElement.querySelector(".file-tab-btn") as HTMLElement,
            operations: this.ribbonElement.querySelector(".operations-tab-btn") as HTMLElement,
            graph: this.ribbonElement.querySelector(".graph-tab-btn") as HTMLElement,
        };

        const tabContents: { [key: string]: HTMLElement } = {
            format: this.ribbonElement.querySelector('.focus-format') as HTMLElement,
            file: this.ribbonElement.querySelector('.focus-file') as HTMLElement,
            operations: this.ribbonElement.querySelector('.focus-operations') as HTMLElement,
            graph: this.ribbonElement.querySelector('.focus-graph') as HTMLElement,
        };

        Object.keys(tabButtons).forEach((tab: string) => {
            tabButtons[tab].addEventListener("click", () => this.toggleTab(tab, tabButtons, tabContents));
        });
    }

    toggleTab(activeTab: string, tabButtons: { [key: string]: HTMLElement }, tabContents: { [key: string]: HTMLElement }): void {
        Object.keys(tabButtons).forEach((tab: string) => {
            if (tab === activeTab) {
                tabButtons[tab].classList.add("active");
                tabContents[tab].classList.add("active");
            } else {
                tabButtons[tab].classList.remove("active");
                tabContents[tab].classList.remove("active");
            }
        });
    }

     /**
     * Adds event listeners for font size change.
     */
     addFontSizeEventListeners(): void {
        const decrementBtn = this.ribbonElement.querySelector('.decrement-font-size-btn') as HTMLElement;
        const incrementBtn = this.ribbonElement.querySelector('.increment-font-size-btn') as HTMLElement;
        const fontSizeInput = this.ribbonElement.querySelector('#fontSize') as HTMLInputElement;

        // Function to update the font size
        const updateFontSize = (newSize: number): void => {
            fontSizeInput.value = newSize.toString();
            this.oldInput = newSize;
        };

        // Decrease font size
        decrementBtn.addEventListener('click', () => {
            let currentSize = parseInt(fontSizeInput.value, 10);
            if (currentSize > 1) { // Prevent font size from becoming too small
                currentSize--;
                updateFontSize(currentSize);
            }
        });

        // Increase font size
        incrementBtn.addEventListener('click', () => {
            let currentSize = parseInt(fontSizeInput.value, 10);
            currentSize++;
            updateFontSize(currentSize);
        });

        // Handle manual input changes
        fontSizeInput.addEventListener('input', (event: Event) => {
            const input = event.target as HTMLInputElement;
            let newSize = parseInt(input.value, 10);
            if (!isNaN(newSize) && newSize < 100 && newSize > 0) { // Valid font size range
                updateFontSize(newSize);
            } else {
                updateFontSize(this.oldInput); // Restore old valid input if invalid
            }
        });
    }

    /**
     * Adds event listener for font family selection.
     */
    addFontFamilyListener(): void {
        const fontSelect = document.getElementById('fontFamily') as HTMLSelectElement;

        fontSelect.addEventListener('change', () => {
            const selectedFont = fontSelect.value;
            // Assuming you have a target element to apply the font to, like a text area
            const textArea = document.getElementById('textArea') as HTMLTextAreaElement | null; // Update with your actual target
            if (textArea) {
                textArea.style.fontFamily = selectedFont;
            }
        });
    }

    /**
     * Adds event listeners for text formatting buttons.
     */
    addTextFormatListeners(): void {
        const fontBoldBtn = this.ribbonElement.querySelector(".font-bold-btn") as HTMLElement;
        const fontItalicBtn = this.ribbonElement.querySelector('.font-italic-btn') as HTMLElement;
        const fontStrikethroughBtn = this.ribbonElement.querySelector(".font-strikethrough-btn") as HTMLElement;
        const fontUnderlineBtn = this.ribbonElement.querySelector('.font-underline-btn') as HTMLElement;

        fontBoldBtn.addEventListener("click", () => {
            this.toggleActiveState(fontBoldBtn, [fontItalicBtn, fontStrikethroughBtn, fontUnderlineBtn]);
        });

        fontItalicBtn.addEventListener("click", () => {
            this.toggleActiveState(fontItalicBtn, [fontBoldBtn, fontStrikethroughBtn, fontUnderlineBtn]);
        });

        fontStrikethroughBtn.addEventListener("click", () => {
            this.toggleActiveState(fontStrikethroughBtn, [fontBoldBtn, fontItalicBtn, fontUnderlineBtn]);
        });

        fontUnderlineBtn.addEventListener("click", () => {
            this.toggleActiveState(fontUnderlineBtn, [fontBoldBtn, fontItalicBtn, fontStrikethroughBtn]);
        });
    }

    /**
     * Toggles active state for formatting buttons.
     * @param activeBtn The button to be activated.
     * @param otherBtns Other buttons to be deactivated.
     */
    toggleActiveState(activeBtn: HTMLElement, otherBtns: HTMLElement[]): void {
        activeBtn.classList.add("active");
        otherBtns.forEach(btn => btn.classList.remove("active"));
    }

    /**
     * Adds event listener for text color selection.
     */
    addTextColorListener(): void {
        const textColorPicker = this.ribbonElement.querySelector("#text-color-picker") as HTMLInputElement;

        textColorPicker.addEventListener("input", (event: Event) => {
            const color = (event.target as HTMLInputElement).value;
            document.execCommand("foreColor", false, color);
        });
    }

    /**
     * Adds event listener for fill color selection.
     */
    addFillColorListener(): void {
        const fillColorPicker = document.getElementById('fill-color-picker') as HTMLInputElement;

        fillColorPicker.addEventListener('input', () => {
            const color = fillColorPicker.value;
            document.execCommand("backColor", false, color); // Change the fill color
        });
    }

    /**
     * Adds event listeners for horizontal alignment buttons.
     */
    addHorizontalAlignmentListeners(): void {
        const horizontalLeftBtn = this.ribbonElement.querySelector(".horizontal-left-btn") as HTMLElement;
        const horizontalCenterBtn = this.ribbonElement.querySelector(".horizontal-center-btn") as HTMLElement;
        const horizontalRightBtn = this.ribbonElement.querySelector(".horizontal-right-btn") as HTMLElement;

        horizontalLeftBtn.addEventListener("click", () => this.toggleActiveState(horizontalLeftBtn, [horizontalCenterBtn, horizontalRightBtn]));
        horizontalCenterBtn.addEventListener("click", () => this.toggleActiveState(horizontalCenterBtn, [horizontalLeftBtn, horizontalRightBtn]));
        horizontalRightBtn.addEventListener("click", () => this.toggleActiveState(horizontalRightBtn, [horizontalLeftBtn, horizontalCenterBtn]));
    }

    /**
     * Adds event listeners for vertical alignment buttons.
     */
    addVerticalAlignmentListeners(): void {
        const verticalTopBtn = this.ribbonElement.querySelector(".vertical-top-btn") as HTMLElement;
        const verticalMiddleBtn = this.ribbonElement.querySelector('.vertical-middle-btn') as HTMLElement;
        const verticalBottomBtn = this.ribbonElement.querySelector(".vertical-bottom-btn") as HTMLElement;

        verticalTopBtn.addEventListener("click", () => this.toggleActiveState(verticalTopBtn, [verticalMiddleBtn, verticalBottomBtn]));
        verticalMiddleBtn.addEventListener("click", () => this.toggleActiveState(verticalMiddleBtn, [verticalTopBtn, verticalBottomBtn]));
        verticalBottomBtn.addEventListener("click", () => this.toggleActiveState(verticalBottomBtn, [verticalTopBtn, verticalMiddleBtn]));
    }
}

