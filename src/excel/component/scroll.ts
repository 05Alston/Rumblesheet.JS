import { Helper } from "./helper.js";
import { SheetRendrer } from "./sheetrendrer.js";

export class Scroll {
    scrollX = 0;
    scrollY = 0;
    maxScrollX = 0;
    maxScrollY = 0;
    isDragging = false;
    isScrollbarDragging = false;
    lastMouseX = 0;
    lastMouseY = 0;
    scrollbarDirection?: 'vertical' | 'horizontal';
    sheetRendrer: SheetRendrer;
    canvases?: { [key: string]: HTMLCanvasElement; };
    contexts?: { [key: string]: CanvasRenderingContext2D; };

    constructor(private helper: Helper) {
        this.sheetRendrer = helper.sheetRendrer;
        this.mappingFromHelper();
        this.setupEventListeners();
    }

    mappingFromHelper():void {
        this.canvases = this.helper.canvases;
        this.contexts = this.helper.contexts;
      }

    setupEventListeners() {
        const canvas = this.canvases!.spreadsheet;
        const { row: Sheetrow, col: Sheetcol, index: Sheetindex } = this.helper.getRowColofExcel();
        canvas.addEventListener('wheel', this.handleWheel.bind(this), { passive: false });
        canvas.addEventListener('mousedown', this.handleMouseDown.bind(this));
        document.addEventListener('mousemove', this.handleMouseMove.bind(this));
        document.addEventListener('mouseup', this.handleMouseUp.bind(this));

        const verticalScrollBar = document.getElementById(`verticalBar_${Sheetrow}_${Sheetcol}_${Sheetindex}`);
        const horizontalScrollBar = document.getElementById(`horizontalBar_${Sheetrow}_${Sheetcol}_${Sheetindex}`);

        verticalScrollBar?.addEventListener('mousedown', this.handleScrollBarMouseDown.bind(this, 'vertical'));
        horizontalScrollBar?.addEventListener('mousedown', this.handleScrollBarMouseDown.bind(this, 'horizontal'));
    }

    handleScrollBarMouseDown(direction: 'vertical' | 'horizontal', event: MouseEvent) {
        event.preventDefault();
        this.isScrollbarDragging = true;
        this.scrollbarDirection = direction;
        this.lastMouseX = event.clientX;
        this.lastMouseY = event.clientY;
    }

    handleMouseMove(event: MouseEvent) {
        if (this.isDragging) {
            if (event.shiftKey) {
                const deltaX = this.lastMouseX - event.clientX;
                const deltaY = this.lastMouseY - event.clientY;
                this.scroll(deltaX, deltaY);
                this.lastMouseX = event.clientX;
                this.lastMouseY = event.clientY;
            }
        } else if (this.isScrollbarDragging && this.scrollbarDirection) {
            const delta = this.scrollbarDirection === 'vertical'
                ? event.clientY - this.lastMouseY
                : event.clientX - this.lastMouseX;
            
            const scrollRatio = this.scrollbarDirection === 'vertical'
                ? this.helper.getScrollRatio("vertical")
                : this.helper.getScrollRatio("horizontal");

            const scrollDelta = delta / scrollRatio;
            
            if (this.scrollbarDirection === 'vertical') {
                this.scroll(0, scrollDelta);
            } else {
                this.scroll(scrollDelta, 0);
            }

            this.lastMouseX = event.clientX;
            this.lastMouseY = event.clientY;
        }
    }
  
    handleMouseUp() {
        this.isDragging = false;
        this.isScrollbarDragging = false;
        this.destroy();
    }
   
    handleWheel(event: WheelEvent) {
        if (!event.ctrlKey && !event.metaKey) {
            event.preventDefault();
            const deltaX = event.deltaX;
            const deltaY = event.deltaY;
            this.scroll(deltaX, deltaY);
        }
    }

    handleMouseDown(event: MouseEvent) {
        this.isDragging = true;
        this.lastMouseX = event.clientX;
        this.lastMouseY = event.clientY;
    }

    updateMaxScroll(totalWidth: number, totalHeight: number, viewportWidth: number, viewportHeight: number) {
        this.maxScrollX = Math.max(0, totalWidth - viewportWidth);
        this.maxScrollY = Math.max(0, totalHeight - viewportHeight);
        
        // Adjust current scroll if it exceeds new maximum
        this.scrollX = Math.min(this.scrollX, this.maxScrollX);
        this.scrollY = Math.min(this.scrollY, this.maxScrollY);
    }
    

    expandContent(direction: 'horizontal' | 'vertical') {
        const scrollBar = direction === 'horizontal' 
            ? this.helper.horizontalScroll?.bar
            : this.helper.verticalScroll?.bar;
    
        if (scrollBar) {
            const expandFactor = 1.2; // Factor to expand content
            const shrinkFactor = 0.8; // Factor to shrink content

            if (direction === 'horizontal') {
                if (this.scrollX >= 0.8 * (this.maxScrollX - this.canvases!.spreadsheet.clientWidth)) {
                    this.sheetRendrer.headerCellManager.updateCells();
                    this.maxScrollX *= expandFactor;
                    this.scrollX = Math.min(this.scrollX, this.maxScrollX);
                }
            } else if (direction === 'vertical') {
                if (this.scrollY >= 0.8 * (this.maxScrollY - this.canvases!.spreadsheet.clientHeight)) {
                    this.sheetRendrer.headerCellManager.updateCells();
                    this.maxScrollY *= expandFactor;
                    this.scrollY = Math.min(this.scrollY, this.maxScrollY);
                }
            }

            // Update scrollbar style
            this.updateScrollBar(direction);
        }
    }

    updateScrollBar(direction: 'vertical' | 'horizontal') {
        // Get the scroll and bar elements based on the direction
        let scrollElement: HTMLElement | null | undefined;
        let barElement: HTMLElement | null | undefined;
        let maxScrollValue: number;
        let scrollValue: number;
        const minBarSize = 20;
        if (direction === 'vertical'){
            scrollElement = this.helper.verticalScroll?.scroll;
            barElement = this.helper.verticalScroll?.bar;
            maxScrollValue = this.maxScrollY;
            scrollValue = this.scrollY;
        }
        else{
            scrollElement = this.helper.horizontalScroll?.scroll;
            barElement = this.helper.horizontalScroll?.bar;
            maxScrollValue = this.maxScrollX;
            scrollValue = this.scrollX;
        }
      
        // Ensure elements exist
        if (!scrollElement || !barElement) {
          throw new Error(`${direction} scroll or bar element not found.`);
        }
      
        // Calculate scroll and bar dimensions
        const scrollSize = direction === 'vertical' ? scrollElement.clientHeight : scrollElement.clientWidth;
        const contentSize = scrollSize + maxScrollValue;
        const barSize = Math.max(minBarSize, (scrollSize / contentSize) * scrollSize);
        const barPosition = (scrollValue / maxScrollValue) * (scrollSize - barSize);
      
        // Update bar dimensions and position
        if (direction === 'vertical') {
          barElement.style.height = `${barSize}px`;
          barElement.style.top = `${barPosition}px`;
        } else {
          barElement.style.width = `${barSize}px`;
          barElement.style.left = `${barPosition}px`;
        }
      }
      
    
    scroll(deltaX: number, deltaY: number) {
        const direction = deltaX === 0 
            ? "vertical"
            : "horizontal";
        // Limit the maximum scroll speed
        const maxScrollSpeed = 10000; // Adjust this value to control the maximum scroll speed
        if (deltaX > 0 || deltaY > 0) {
            deltaX = Math.max(-maxScrollSpeed, Math.min(deltaX, maxScrollSpeed));
            deltaY = Math.max(-maxScrollSpeed, Math.min(deltaY, maxScrollSpeed));
        }
        
        this.scrollX = Math.max(0, Math.min(this.scrollX + deltaX, this.maxScrollX));
        this.scrollY = Math.max(0, Math.min(this.scrollY + deltaY, this.maxScrollY));

        this.updateScrollBar(direction);
        this.checkScrollPosition();
        this.sheetRendrer.draw();
    }
    
    checkScrollPosition() {
        // Horizontal scroll
        const horizontalRatio = this.scrollX / this.maxScrollX;
        if (horizontalRatio > 0.8) {
            this.expandContent('horizontal');
        }
    
        // Vertical scroll
        const verticalRatio = this.scrollY / this.maxScrollY;
        if (verticalRatio > 0.8) {
            this.expandContent('vertical');
        }
    }
    
    getScroll() {
        return { x: this.scrollX, y: this.scrollY };
    }

    destroy() {
        const canvas = this.canvases!.spreadsheet;
        canvas.removeEventListener('wheel', this.handleWheel);
        canvas.removeEventListener('mousedown', this.handleMouseDown);
        document.removeEventListener('mousemove', this.handleMouseMove);
        document.removeEventListener('mouseup', this.handleMouseUp);
    }
}
