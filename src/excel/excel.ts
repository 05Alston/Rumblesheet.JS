import { excelsHandler } from '../core/initiater.js';
import { Helper } from './component/helper.js';

export class Excel {
    private rowContainer: HTMLElement;
    private row: number;
    private col: number;
    private excelHandler: excelsHandler;  // Replace with the actual type for Grid_maker
    private currExcelRow!: number;
    private currExcelCol!: number;
    private currSheetObj!: Sheet;  // Replace with the actual type for Sheet instance

    private excel!: HTMLElement;
    private contentArea!: HTMLElement;
    private activeSheetIndex: number;
    private sheets!: { name: string; instance: Sheet }[];
    element: any;

    constructor(rowContainer: HTMLElement, row: number, col: number, excelHandler: excelsHandler) {
        this.rowContainer = rowContainer;
        this.row = row;
        this.col = col;
        this.excelHandler = excelHandler;
        this.activeSheetIndex = 0;
        this.init();
    }

    private init(): void {
        this.constructExcel();
        this.updateCurrExcel(this.row, this.col, this.sheets[this.activeSheetIndex]);
        this.handleEvents();
    }

    private constructExcel(): void {
        this.excel = document.createElement('div');
        this.excel.className = 'excel resizable';
        this.excel.id = `rowCol${this.row}_${this.col}`;
        this.excel.role = 'gridcell';
        this.excel.ariaRowIndex = "this.row";
        this.excel.ariaColIndex = "this.col";
        this.excel.style.flex = '1';
        this.rowContainer.appendChild(this.excel);
        this.sheets = [{ name: 'Sheet1', instance: new Sheet('Sheet1', this.row, this.col, 0) }];
        this.createExcel();
    }

    private createExcel(){
        this.excel.innerHTML = '';
        const wrapper = document.createElement('div');
        wrapper.className = 'excelWrapper';

        this.contentArea = document.createElement('div');
        this.contentArea.className = 'contentArea';
        this.updateContentArea();

        const sheetBar = this.createSheetBar();

        wrapper.appendChild(this.contentArea);
        wrapper.appendChild(sheetBar);
        this.excel.appendChild(wrapper);
    }

    private updateContentArea(): void {
        this.contentArea.innerHTML = '';
        const activeSheet = this.sheets[this.activeSheetIndex].instance;
        this.contentArea.appendChild(activeSheet.elements.topSection);
        this.contentArea.appendChild(activeSheet.elements.middleSection);
    }

    createSheetBar() {
        const sheetBar = document.createElement('div');
        sheetBar.className = 'sheet-bar';
    
        const controls = document.createElement('div');
        controls.className = 'sheet-controls';
        controls.innerHTML = `<button class="add-sheet">+</button>`;
    
        const tabs = document.createElement('div');
        tabs.className = 'sheet-tabs';
        this.updateSheetTabs(tabs);
    
        const scroll = document.createElement('div');
        scroll.className = 'sheet-scroll';
        scroll.innerHTML = `
            <button class="scroll-left">◀</button>
            <button class="scroll-right">▶</button>
        `;
    
        sheetBar.appendChild(controls);
        sheetBar.appendChild(tabs);
        sheetBar.appendChild(scroll);
    
        const addSheetButton = controls.querySelector('.add-sheet') as HTMLElement;
        addSheetButton.onclick = () => this.addSheet();
    
        tabs.onclick = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            if (target.classList.contains('sheet-tab')) {
                const index = parseInt(target.dataset.index ?? '0');
                this.switchSheet(index);
            } else if (target.classList.contains('close-tab')) {
                const index = parseInt(target.dataset.index ?? '0');
                this.removeSheet(index);
            }
        };
    
        return sheetBar;
    }
    

    private updateSheetTabs(tabsContainer: HTMLElement): void {
        tabsContainer.innerHTML = this.sheets.map((sheet, index) => `
            <div class="sheet-tab ${index === this.activeSheetIndex ? 'active' : ''}" data-index="${index}">
                ${sheet.name}
                <button class="close-tab" data-index="${index}">✖</button>
            </div>
        `).join('');
    }

    private addSheet(): void {
        const newIndex = this.sheets.length;
        const newName = `Sheet${newIndex + 1}`;
        this.sheets.push({ name: newName, instance: new Sheet(newName, this.row, this.col, newIndex) });
        this.switchSheet(newIndex);
        this.updateSheetTabs(this.excel.querySelector('.sheet-tabs')!);
    }

    private switchSheet(index: number): void {
        if (index !== this.activeSheetIndex && index >= 0 && index < this.sheets.length) {
            this.activeSheetIndex = index;
            this.updateContentArea();
            this.updateSheetTabs(this.excel.querySelector('.sheet-tabs')!);
        }
    }

    private removeSheet(index: number): void {
        if (this.sheets.length <= 1) {
            alert("You cannot remove the last sheet.");
            return;
        }

        this.sheets.splice(index, 1);

        if (index === this.activeSheetIndex) {
            this.activeSheetIndex = Math.max(0, index - 1);
        } else if (index < this.activeSheetIndex) {
            this.activeSheetIndex--;
        }

        this.updateContentArea();
        this.updateSheetTabs(this.excel.querySelector('.sheet-tabs')!);
    }

    private updateCurrExcel(excelRow: number, excelCol: number, sheetObj: any): void {
        this.currExcelRow = excelRow;
        this.currExcelCol = excelCol;
        this.currSheetObj = sheetObj;
    }

    private handleEvents(): void {
        this.excel.addEventListener('click', (e: MouseEvent) => {
            this.handleMouseDown(e);
        });
    }

    private handleMouseDown(e: MouseEvent): void {
        e.preventDefault();
        this.updateCurrExcel(this.row, this.col, this.sheets[this.activeSheetIndex]);
        this.excelHandler.updateCurrExcel(this.row, this.col, this.sheets[this.activeSheetIndex]);
    }
}

export class Sheet {
    name: string;
    row: number;
    col: number;
    index: number;
    elements: { topSection: HTMLElement; middleSection: HTMLElement };
    helper?: Helper;

    constructor(name: string, row: number, col: number, index: number) {
        this.name = name;
        this.row = row;
        this.col = col;
        this.index = index;

        this.elements = {
            topSection: this.createTopSection(),
            middleSection: this.createMiddleSection()
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
              observer.disconnect(); // Stop observing
              break;
            }
          }
        });
    
        // Start observing the DOM for changes
        observer.observe(document.body, { childList: true, subtree: true });
      }

    private createTopSection(): HTMLElement {
        const topSection = document.createElement('div');
        topSection.id = `topsection_${this.row}_${this.col}_${this.index}`;
        topSection.className = 'topSection';

        const nothing = document.createElement('div');
        nothing.id = `nothing_${this.row}_${this.col}_${this.index}`;
        nothing.className = 'nothing';

        const upperCanvas = document.createElement('div');
        upperCanvas.id = `upperCanvas_${this.row}_${this.col}_${this.index}`;
        upperCanvas.className = 'upperCanvas';

        const horizontalCanvas = document.createElement('canvas');
        horizontalCanvas.id = `horizontalCanvas_${this.row}_${this.col}_${this.index}`;
        horizontalCanvas.className = 'horizontalCanvas';

        upperCanvas.appendChild(horizontalCanvas);
        topSection.appendChild(nothing);
        topSection.appendChild(upperCanvas);

        return topSection;
    }

    private createMiddleSection(): HTMLElement {
        const midSection = document.createElement('div');
        midSection.id = `midSection_${this.row}_${this.col}_${this.index}`;
        midSection.className = 'middleSection';

        const verticalCanvasWrapper = document.createElement('div');
        verticalCanvasWrapper.id = `verticalCanvasWrapper_${this.row}_${this.col}_${this.index}`;
        verticalCanvasWrapper.className = 'verticalCanvas';

        const verticalCanvas = document.createElement('canvas');
        verticalCanvas.id = `verticalCanvas_${this.row}_${this.col}_${this.index}`;

        verticalCanvasWrapper.appendChild(verticalCanvas);

        const fullCanvas = document.createElement('div');
        fullCanvas.id = `fullCanvas_${this.row}_${this.col}_${this.index}`;
        fullCanvas.className = 'fullCanvas';

        const spreadsheetCanvas = document.createElement('canvas');
        spreadsheetCanvas.id = `spreadsheetCanvas_${this.row}_${this.col}_${this.index}`;
        spreadsheetCanvas.className = 'spreadsheetCanvas';

        const verticalScroll = this.createScrollbar('vertical');
        const horizontalScroll = this.createScrollbar('horizontal');

        const inputEle = document.createElement('input');
        inputEle.setAttribute('type', 'text');
        inputEle.id = `input_${this.row}_${this.col}_${this.index}`;
        inputEle.className = 'input';

        fullCanvas.appendChild(inputEle);
        fullCanvas.appendChild(spreadsheetCanvas);
        fullCanvas.appendChild(verticalScroll);
        fullCanvas.appendChild(horizontalScroll);

        midSection.appendChild(verticalCanvasWrapper);
        midSection.appendChild(fullCanvas);

        return midSection;
    }

    private createScrollbar(orientation: 'vertical' | 'horizontal'): HTMLElement {
        const scroll = document.createElement('div');
        scroll.id = `${orientation}Scroll_${this.row}_${this.col}_${this.index}`;
        scroll.className = `${orientation}Scroll`;

        const bar = document.createElement('div');
        bar.id = `${orientation}Bar_${this.row}_${this.col}_${this.index}`;
        bar.className = `${orientation}Bar`;

        scroll.appendChild(bar);
        return scroll;
    }
}

