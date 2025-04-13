import { HeaderCellManager } from "../headerCellManager.js";

export class HeaderResizeFunctionality {
    private headerCellManager: HeaderCellManager;
    private resizeThreshold: number;
    private isResizing: boolean;
    private resizeStart: number | null;
    private resizeType: 'row' | 'column' | null;
    private resizeIndex: number | null;
    private currentResizePosition: number | null;
    private canvases: { [key: string]: HTMLCanvasElement; };
    constructor(headerCellManager: HeaderCellManager) {
        this.headerCellManager = headerCellManager;
        this.resizeThreshold = 5;
        this.isResizing = false;
        this.resizeStart = null;
        this.resizeType = null;
        this.resizeIndex = null;
        this.currentResizePosition = null;
        this.canvases = this.headerCellManager.getCanvases();
        
        this.setupEventListeners();
    }
    private setupEventListeners(): void {
        const hCanvas = this.canvases.horizontal;
        const vCanvas = this.canvases.vertical;

        hCanvas.addEventListener('mousedown', this.handleMouseDown.bind(this, 'horizontal'));
        vCanvas.addEventListener('mousedown', this.handleMouseDown.bind(this, 'vertical'));

        hCanvas.addEventListener('mousemove', this.handleMouseMove.bind(this));
        vCanvas.addEventListener('mousemove', this.handleMouseMove.bind(this));

        window.addEventListener('mouseup', this.handleMouseUp.bind(this));
        window.addEventListener('mousemove', this.handleDrag.bind(this));
    }

    private handleMouseMove(event: MouseEvent): void {
        if (this.isResizing) {
            return;
        }

        const canvas = event.target as HTMLCanvasElement;
        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        const isHorizontal = canvas === this.canvases.horizontal;
        const scrollOffset = isHorizontal 
            ? this.headerCellManager.getScroll().x 
            : this.headerCellManager.getScroll().y;
        
        const cells = isHorizontal 
            ? this.headerCellManager.getHorizontalHeaderCells(scrollOffset)
            : this.headerCellManager.getVerticalHeaderCells(scrollOffset);

        const resizeEdge = this.getResizeEdge(cells, x + scrollOffset, y + scrollOffset, isHorizontal);

        // Update cursor style based on whether a resize edge is near
        canvas.style.cursor = resizeEdge ? (isHorizontal ? 'col-resize' : 'row-resize') : 'default';
    }

    private handleMouseDown(direction: string, event: MouseEvent): boolean {
        const canvas = event.target as HTMLCanvasElement;
        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        const isHorizontal = direction === 'horizontal';
        const scrollOffset = isHorizontal 
            ? this.headerCellManager.getScroll().x 
            : this.headerCellManager.getScroll().y;
        const cells = isHorizontal 
            ? this.headerCellManager.getHorizontalHeaderCells(scrollOffset)
            : this.headerCellManager.getVerticalHeaderCells(scrollOffset);

        const resizeEdge = this.getResizeEdge(cells, x + scrollOffset, y + scrollOffset, isHorizontal);

        if (resizeEdge) {
            this.isResizing = true;
            this.resizeStart = isHorizontal ? x + scrollOffset : y + scrollOffset;
            this.resizeType = isHorizontal ? 'column' : 'row';

            // Adjust index based on the resize type
            if (this.resizeType === 'column') {
                this.resizeIndex = cells[resizeEdge.index].col - 1; // Use column index for resizing columns
                // conosle.log(this.resizeIndex)
            } else {
                this.resizeIndex = cells[resizeEdge.index].row - 1; // Use row index for resizing rows
                // conosle.log(this.resizeIndex)
            }
            
            event.preventDefault();
            return true; // Indicate that we handled the event for resizing
        }
        
        return false; // Indicate that we did not handle the event for resizing
    }

    private handleDrag(event: MouseEvent): void {
        if (!this.isResizing) {
            // conosle.log(this.isResizing)
            return;
        }

        const canvas = this.resizeType === 'column' 
            ? this.canvases.horizontal 
            : this.canvases.vertical;
        const rect = canvas.getBoundingClientRect();
        const scrollOffset = this.resizeType === 'column' 
            ? this.headerCellManager.getScroll().x 
            : this.headerCellManager.getScroll().y;
        const currentPosition = this.resizeType === 'column' 
            ? event.clientX - rect.left + scrollOffset
            : event.clientY - rect.top + scrollOffset;

        this.currentResizePosition = currentPosition;
        this.headerCellManager.draw(); // Redraw, potentially showing a resize line
        this.drawResizeGuide();
    }

    private handleMouseUp(event: MouseEvent): void {
        if (this.isResizing) {
            this.applyResize(event);
            this.isResizing = false;
        }
    }
    private applyResize(event: MouseEvent): void {
        if (!this.isResizing || !this.resizeType || this.resizeIndex === null) return;
        // conosle.log("applying the resize")
        const canvas = this.resizeType === 'column' 
            ? this.canvases.horizontal 
            : this.canvases.vertical;
        const rect = canvas.getBoundingClientRect();
        const scrollOffset = this.resizeType === 'column' 
            ? this.headerCellManager.getScroll().x 
            : this.headerCellManager.getScroll().y;
        const currentPosition = this.resizeType === 'column' 
            ? event.clientX - rect.left + scrollOffset
            : event.clientY - rect.top + scrollOffset;

        const delta = currentPosition - (this.resizeStart || 0);
        const headerCellManager = this.headerCellManager;
        const currentSize = headerCellManager.getCellSize(
            this.resizeType === 'column' ? 'horizontal' : 'vertical',
            this.resizeIndex
        );
        const newSize = Math.max(20, currentSize! + delta);
        // conosle.log("current Position: ",currentPosition," scrolloffset: ",scrollOffset,"delta:",delta,"currentSize:",currentSize)


        // Set the new size for the resized header cell
        headerCellManager.setCustomCellSize(
            this.resizeType === 'column' ? 'horizontal' : 'vertical',
            this.resizeIndex,
            newSize
        );

        this.isResizing = false;
        this.currentResizePosition = null;
        this.headerCellManager.draw(); // Redraw to apply the new sizes
    }

    private getResizeEdge(cells: any[], x: number, y: number, isHorizontal: boolean): { index: number, position: number } | null {
        for (let i = 0; i < cells.length; i++) {
            const cell = cells[i];
            const edge = isHorizontal ? cell.x + cell.width : cell.y + cell.height;
            if (Math.abs(edge - (isHorizontal ? x : y)) <= this.resizeThreshold) {
                return { index: i, position: edge };
            }
        }
        return null;
    }

    public drawResizeGuide(): void {
        if (!this.isResizing || this.currentResizePosition === null) return;

        const ctxH = this.canvases.horizontal.getContext('2d');
        const ctxV = this.canvases.vertical.getContext('2d');
        const ctxS = this.canvases.spreadsheet.getContext('2d');
        
        const scrollX = this.headerCellManager.getScroll().x;
        const scrollY = this.headerCellManager.getScroll().y;
        
        // Set line style for resize guide
        const setLineStyle = (ctx: CanvasRenderingContext2D) => {
            ctx.strokeStyle = '#4285f4'; // Google blue color
            ctx.lineWidth = 2;
            ctx.setLineDash([5, 3]); // Dashed line
        };
        
        if (this.resizeType === 'column') {
            const adjustedX = this.currentResizePosition - scrollX;
            
            // Draw on horizontal header canvas
            setLineStyle(ctxH!);
            ctxH!.moveTo(adjustedX, 0);
            ctxH!.beginPath();
            ctxH!.lineTo(adjustedX, this.canvases.horizontal.height);
            ctxH!.stroke();
            
            // Draw on spreadsheet canvas
            setLineStyle(ctxS!);
            ctxS!.beginPath();
            ctxS!.moveTo(adjustedX, 0);
            ctxS!.lineTo(adjustedX, this.canvases.spreadsheet.height);
            ctxS!.stroke();
        } else if (this.resizeType === 'row') {
            const adjustedY = this.currentResizePosition - scrollY;
            
            // Draw on vertical header canvas
            setLineStyle(ctxV!);
            ctxV!.beginPath();
            ctxV!.moveTo(0, adjustedY);
            ctxV!.lineTo(this.canvases.vertical.width, adjustedY);
            ctxV!.stroke();
            
            // Draw on spreadsheet canvas
            setLineStyle(ctxS!);
            ctxS!.beginPath();
            ctxS!.moveTo(0, adjustedY);
            ctxS!.lineTo(this.canvases.spreadsheet.width, adjustedY);
            ctxS!.stroke();
        }
        
        // Reset line dash to avoid affecting other drawings
        ctxH!.setLineDash([]);
        ctxV!.setLineDash([]);
        ctxS!.setLineDash([]);
    }

    public isResizingActive(): boolean {
        return this.isResizing;
    }

    public removeEventListeners(): void {
        const hCanvas = this.canvases.horizontal;
        const vCanvas = this.canvases.vertical;

        hCanvas.removeEventListener('mousemove', this.handleMouseMove);
        vCanvas.removeEventListener('mousemove', this.handleMouseMove);

        window.removeEventListener('mouseup', this.handleMouseUp);
        window.removeEventListener('mousemove', this.handleDrag);
    }
}