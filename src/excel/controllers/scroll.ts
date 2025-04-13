import { Helper } from "../helper/helper.js";
import { SheetRendrer } from "./sheetRendrer.js";
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
    sheetRendrer!: SheetRendrer;
    canvases?: { [key: string]: HTMLCanvasElement; };
    contexts?: { [key: string]: CanvasRenderingContext2D; };
    private readonly loadThreshold = 0.8;

    constructor(private readonly helper: Helper) {
        this.helper = helper;
        this.mappingFromHelper();
        this.setupEventListeners();
    }

    private mappingFromHelper():void {
        this.canvases = this.helper.canvases;
        this.contexts = this.helper.contexts;
    }

    private setupEventListeners():void {
        const canvas = this.canvases!.spreadsheet;
        const { row: Sheetrow, col: Sheetcol, index: Sheetindex } = this.helper.getRowColofExcel();
        canvas.addEventListener('wheel', this.handleWheel.bind(this), { passive: false });
        canvas.addEventListener('mousedown', this.handleMouseDown.bind(this));
        document.addEventListener('mousemove', this.handleMouseMove.bind(this));
        document.addEventListener('mouseup', this.handleMouseUp.bind(this));

        const verticalScrollBar = document.getElementById(`vertical-bar-${Sheetrow}-${Sheetcol}-${Sheetindex}`);
        const horizontalScrollBar = document.getElementById(`horizontal-bar-${Sheetrow}-${Sheetcol}-${Sheetindex}`);

        verticalScrollBar?.addEventListener('mousedown', this.handleScrollBarMouseDown.bind(this, 'vertical'));
        horizontalScrollBar?.addEventListener('mousedown', this.handleScrollBarMouseDown.bind(this, 'horizontal'));
    }

    public setRenderer(renderer: SheetRendrer) {
        this.sheetRendrer = renderer;
        this.setScrollLimits();
    }

    private setScrollLimits(): void {
        const viewportWidth = this.canvases!.spreadsheet.clientWidth;
        const viewportHeight = this.canvases!.spreadsheet.clientHeight;
        const totalWidth = this.helper.getTotalWidth();
        const totalHeight = this.helper.getTotalHeight();

        this.updateMaxScroll(totalWidth, totalHeight, viewportWidth, viewportHeight);
    }

    updateMaxScroll(totalWidth: number, totalHeight: number, viewportWidth: number, viewportHeight: number): void {
        this.maxScrollX = Math.max(0, totalWidth - viewportWidth);
        this.maxScrollY = Math.max(0, totalHeight - viewportHeight);

        // Ensure current scroll positions don't exceed new maximums
        this.scrollX = Math.min(this.scrollX, this.maxScrollX);
        this.scrollY = Math.min(this.scrollY, this.maxScrollY);

        this.updateScrollBar('horizontal');
        this.updateScrollBar('vertical');
    }

    private updateScrollBar(direction: 'vertical' | 'horizontal'): void {
        const scrollElement = direction === 'vertical' 
            ? this.helper.verticalScroll?.scroll 
            : this.helper.horizontalScroll?.scroll;
        const barElement = direction === 'vertical' 
            ? this.helper.verticalScroll?.bar 
            : this.helper.horizontalScroll?.bar;

        if (!scrollElement || !barElement || !this.helper) {
            return;
        }

        const minBarSize = 20;
        const scrollSize = direction === 'vertical' ? scrollElement.clientHeight : scrollElement.clientWidth;
        
        // Get ratio from GridHeaderManager
        const ratio = this.helper.getScrollbarRatio(direction);
        
        // Calculate bar size
        const barSize = Math.max(minBarSize, scrollSize * ratio!);

        // Calculate position
        const maxScroll = direction === 'vertical' ? this.maxScrollY : this.maxScrollX;
        const currentScroll = direction === 'vertical' ? this.scrollY : this.scrollX;
        const scrollableSpace = scrollSize - barSize;
        const scrollProgress = maxScroll > 0 ? currentScroll / maxScroll : 0;
        const barPosition = scrollableSpace * scrollProgress;

        // Update bar style
        if (direction === 'vertical') {
            barElement.style.height = `${barSize}px`;
            barElement.style.top = `${barPosition}px`;
        } else {
            barElement.style.width = `${barSize}px`;
            barElement.style.left = `${barPosition}px`;
        }
    }

    setScroll(deltaX: number, deltaY: number): void {
        const maxScrollSpeed = 100;
        deltaX = Math.max(-maxScrollSpeed, Math.min(deltaX, maxScrollSpeed));
        deltaY = Math.max(-maxScrollSpeed, Math.min(deltaY, maxScrollSpeed));
        // Calculate new scroll positions
        let newScrollX = Math.max(0, Math.min(this.scrollX + deltaX, this.maxScrollX));
        let newScrollY = Math.max(0, Math.min(this.scrollY + deltaY, this.maxScrollY));

        // Update scroll positions
        if (newScrollX !== this.scrollX || newScrollY !== this.scrollY) {
            this.scrollX = newScrollX;
            this.scrollY = newScrollY;

            if (deltaX !== 0) this.updateScrollBar('horizontal');
            if (deltaY !== 0) this.updateScrollBar('vertical');
            this.helper.draw();
        }

        // Check if we need to load more content
        const shouldLoadMore = this.checkAndLoadMoreContent(newScrollX, newScrollY);
        if (shouldLoadMore) {
            // Update scroll limits based on new content
            this.setScrollLimits();
        }
        this.helper.updateDrawForFeatures();
        
    }

    handleScrollBarMouseDown(direction: 'vertical' | 'horizontal', event: MouseEvent):void {
        event.preventDefault();
        this.isScrollbarDragging = true;
        this.scrollbarDirection = direction;
        this.lastMouseX = event.clientX;
        this.lastMouseY = event.clientY;
    }

    handleMouseMove(event: MouseEvent):void {
        if (this.isDragging) {
            if (event.shiftKey) {
                const deltaX = this.lastMouseX - event.clientX;
                const deltaY = this.lastMouseY - event.clientY;
                this.setScroll(deltaX, deltaY);
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
                this.setScroll(0, scrollDelta);
            } else {
                this.setScroll(scrollDelta, 0);
            }

            this.lastMouseX = event.clientX;
            this.lastMouseY = event.clientY;
        }
    }
  
    handleMouseUp():void {
        this.isDragging = false;
        this.isScrollbarDragging = false;
        this.destroy();
    }
   
    handleWheel(event: WheelEvent):void {
        if (!event.ctrlKey && !event.metaKey) {
            event.preventDefault();
            const deltaX = event.deltaX;
            const deltaY = event.deltaY;
            this.setScroll(deltaX, deltaY);
        }
    }

    handleMouseDown(event: MouseEvent):void {
        this.isDragging = true;
        this.lastMouseX = event.clientX;
        this.lastMouseY = event.clientY;
    }

    private checkAndLoadMoreContent(newScrollX: number, newScrollY: number): boolean {
        let contentLoaded = false;
        if (!this.helper) {
            return contentLoaded;
        }
    
        // Check vertical scroll
        const verticalBarElement = this.helper.verticalScroll?.bar;
        const verticalBarTop = verticalBarElement?.offsetTop || 0;
        const verticalScrollableHeight = (this.helper.verticalScroll?.scroll!.clientHeight || 0) - (verticalBarElement?.clientHeight || 0);
    
        if (verticalScrollableHeight > 0 && (verticalBarTop / verticalScrollableHeight) >= this.loadThreshold) {
            if (this.helper.loadMoreContent('vertical')) {
                contentLoaded = true;
            }
        }
    
        // Check horizontal scroll
        const horizontalBarElement = this.helper.horizontalScroll?.bar;
        const horizontalBarLeft = horizontalBarElement?.offsetLeft || 0;
        const horizontalScrollableWidth = (this.helper.horizontalScroll?.scroll!.clientWidth || 0) - (horizontalBarElement?.clientWidth || 0);
    
        if (horizontalScrollableWidth > 0 && (horizontalBarLeft / horizontalScrollableWidth) >= this.loadThreshold) {
            if (this.helper.loadMoreContent('horizontal')) {
                contentLoaded = true;
            }
        }
    
        return contentLoaded;
    }

    // Remove expandContent and checkScrollPosition methods as they're no longer needed

    constrainScrollPosition(scrollValue: number, direction: "horizontal" | "vertical"): number {
        const maxScroll = direction === "horizontal" ? this.maxScrollX : this.maxScrollY;
        return Math.max(0, Math.min(scrollValue, maxScroll));
    }

    
    getScroll(): { x: number, y: number } {
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
