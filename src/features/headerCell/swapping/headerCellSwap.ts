import { HeaderCellManager } from "../headerCellManager.js";

export class HeaderSwapFunctionality {
    private headerCellManager: HeaderCellManager;
    private canvases: { [key: string]: HTMLCanvasElement };
    private isDragging: boolean = false;
    private dragStartIndex: number | null = null;
    private dragType: 'horizontal' | 'vertical' | null = null;
    private selectedIndices: number[] = [];
    private dragOverIndex: number | null = null;

    constructor(headerCellManager: HeaderCellManager) {
        this.headerCellManager = headerCellManager;
        this.canvases = this.headerCellManager.getCanvases();
        this.setupEventListeners();
    }

    private setupEventListeners(): void {
        this.canvases.horizontal.addEventListener('mousedown', (e) => this.handleMouseDown(e, 'horizontal'));
        this.canvases.vertical.addEventListener('mousedown', (e) => this.handleMouseDown(e, 'vertical'));

        window.addEventListener('mousemove', this.handleMouseMove.bind(this));
        window.addEventListener('mouseup', this.handleMouseUp.bind(this));
    }

    private handleMouseDown(event: MouseEvent, type: 'horizontal' | 'vertical'): void {
        const canvas = this.canvases[type === 'vertical' ? 'horizontal' : 'vertical'];
        const rect = canvas.getBoundingClientRect();
        const coord = type === 'vertical' 
            ? event.clientX - rect.left + this.headerCellManager.getScroll().x
            : event.clientY - rect.top + this.headerCellManager.getScroll().y;

        const index = this.headerCellManager.getCellIndexFromPosition(type, coord);
        if (index !== null) {
            this.dragStartIndex = index;
            this.dragType = type;
            this.selectedIndices = [1];
            this.isDragging = true;
        }
    }

    private handleMouseMove(event: MouseEvent): void {
        if (!this.isDragging || this.dragType === null) return;

        const canvas = this.canvases[this.dragType === 'horizontal' ? 'horizontal' : 'vertical'];
        const rect = canvas.getBoundingClientRect();
        const coord = this.dragType === 'horizontal'
            ? event.clientX - rect.left + this.headerCellManager.getScroll().x
            : event.clientY - rect.top + this.headerCellManager.getScroll().y;

        const overIndex = this.headerCellManager.getCellIndexFromPosition(this.dragType, coord);
        if (overIndex !== null && overIndex !== this.dragOverIndex) {
            this.dragOverIndex = overIndex;
            this.headerCellManager.draw(); // Redraw to visualize swapping
            this.drawSwapPreview();
        }
    }

    private handleMouseUp(): void {
        if (!this.isDragging || this.dragType === null || this.dragOverIndex === null) return;

        this.swapSelectedIndices(this.dragType, this.dragOverIndex);

        // Reset
        this.isDragging = false;
        this.dragStartIndex = null;
        this.dragOverIndex = null;
        this.dragType = null;
        this.headerCellManager.draw();
    }

    private swapSelectedIndices(type: 'horizontal' | 'vertical', targetIndex: number): void {
        const indices = this.selectedIndices.slice().sort((a, b) => a - b);
        const isColumn = type === 'horizontal';
        const dataType = isColumn ? 'horizontal' : 'vertical';

        const offset = targetIndex - indices[0];

        const newOrder = indices.map(i => i + offset);
        // this.headerCellManager.swapIndices(dataType, indices, newOrder);
    }

    private drawSwapPreview(): void {
        if (this.dragOverIndex === null || this.dragType === null) return;

        const ctx = this.canvases.spreadsheet.getContext("2d")!;
        const isColumn = this.dragType === 'horizontal';
        const scroll = this.headerCellManager.getScroll();

        ctx.save();
        ctx.strokeStyle = '#34a853'; // green
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 3]);

        if (isColumn) {
            const x = this.headerCellManager.getPositionFromIndex('horizontal', this.dragOverIndex) - scroll.x;
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, this.canvases.spreadsheet.height);
        } else {
            const y = this.headerCellManager.getPositionFromIndex('vertical', this.dragOverIndex) - scroll.y;
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(this.canvases.spreadsheet.width, y);
        }

        ctx.stroke();
        ctx.setLineDash([]);
        ctx.restore();
    }

    public destroy(): void {
        window.removeEventListener('mousemove', this.handleMouseMove);
        window.removeEventListener('mouseup', this.handleMouseUp);
    }
}
