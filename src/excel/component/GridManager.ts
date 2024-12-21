export class GridHeaderCell {
    x: number;
    y: number;
    width: number;
    height: number;
    value: string | number;
    row: number;
    col: number;
    isFetched: boolean;

    constructor(
        x: number, 
        y: number, 
        width: number, 
        height: number, 
        value: string | number, 
        row: number, 
        col: number
    ) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.value = value;
        this.row = row;
        this.col = col;
        this.isFetched = false;
    }
}

export class GridHeaderManager {
    private sheet: any; // Replace 'any' with proper type for sheet
    private zoomLevel: number;
    private viewportWidth: number;
    private viewportHeight: number;
    private headerCellsHorizontal: GridHeaderCell[] = [];
    private headerCellsVertical: GridHeaderCell[] = [];
    private customColumnWidths: Map<number, number> = new Map();
    private customRowHeights: Map<number, number> = new Map();

    constructor(sheet: any, viewportWidth: number, viewportHeight: number, zoomLevel: number) {
        this.sheet = sheet;
        this.viewportWidth = viewportWidth;
        this.viewportHeight = viewportHeight;
        this.zoomLevel = zoomLevel;
        this.update(viewportWidth, viewportHeight, zoomLevel);
    }

    update(viewportWidth: number, viewportHeight: number, zoomLevel: number): void {
        const oldZoomLevel = this.zoomLevel;
        this.viewportWidth = viewportWidth;
        this.viewportHeight = viewportHeight;
        this.zoomLevel = zoomLevel;
        this.resizeAllCells(oldZoomLevel, zoomLevel);
        this.updateCells();
    }

    private resizeAllCells(oldZoomLevel: number, newZoomLevel: number): void {
        const scaleFactor = newZoomLevel / oldZoomLevel;

        // Resize horizontal header cells
        this.headerCellsHorizontal.forEach((cell) => {
            if (!this.customColumnWidths.has(cell.col - 1)) {
                cell.width *= scaleFactor;
            }
        });

        // Resize vertical header cells
        this.headerCellsVertical.forEach((cell) => {
            if (!this.customRowHeights.has(cell.row - 1)) {
                cell.height *= scaleFactor;
            }
        });
    }

    public updateCells(): void {
        const cellWidth = Math.max(30, 120 * this.zoomLevel);
        const cellHeight = Math.max(30, 40 * this.zoomLevel);

        this._updateHeaderCells('horizontal', cellWidth);
        this._updateHeaderCells('vertical', cellHeight);
    }

    private _updateHeaderCells(type: 'horizontal' | 'vertical', size: number): void {
        const isHorizontal = type === 'horizontal';
        const totalCells = Math.ceil((isHorizontal ? this.viewportWidth : this.viewportHeight) / size) + 1;
        const headerCells = isHorizontal ? this.headerCellsHorizontal : this.headerCellsVertical;

        while (headerCells.length < totalCells) {
            const i = headerCells.length;
            const customSize = isHorizontal ? this.customColumnWidths.get(i) : this.customRowHeights.get(i);
            const dimension = customSize || size;

            const newCell = new GridHeaderCell(
                0, 0, 
                isHorizontal ? dimension : 30, 
                isHorizontal ? 30 : dimension, 
                isHorizontal ? this.numberToColumnName(i + 1) : i + 1, 
                isHorizontal ? 0 : i + 1, 
                isHorizontal ? i + 1 : 0
            );

            headerCells.push(newCell);
        }

        this.updateCellPositions(type);
    }

    private updateCellPositions(type: 'horizontal' | 'vertical'): void {
        const cells = type === 'horizontal' ? this.headerCellsHorizontal : this.headerCellsVertical;
        let position = 0;

        cells.forEach((cell, index) => {
            if (type === 'horizontal') {
                cell.width = this.customColumnWidths.get(index) || cell.width;
                cell.x = position;
                position += cell.width;
            } else {
                cell.height = this.customRowHeights.get(index) || cell.height;
                cell.y = position;
                position += cell.height;
            }
        });
    }

    public numberToColumnName(num: number): string {
        let columnName = '';
        while (num > 0) {
            num--;
            columnName = String.fromCharCode(65 + (num % 26)) + columnName;
            num = Math.floor(num / 26);
        }
        return columnName;
    }

    getHeaderCellsHorizontal(scrollX: number): GridHeaderCell[] {
        return this._getVisibleHeaderCells('horizontal', scrollX, this.viewportWidth);
    }

    getHeaderCellsVertical(scrollY: number): GridHeaderCell[] {
        return this._getVisibleHeaderCells('vertical', scrollY, this.viewportHeight);
    }

    private _getVisibleHeaderCells(
        type: 'horizontal' | 'vertical',
        scroll: number,
        visibleSize: number
    ): GridHeaderCell[] {
        const startIndex = this.findStartingIndex(type, scroll);
        const visibleCells: GridHeaderCell[] = [];
        const cells = type === 'horizontal' ? this.headerCellsHorizontal : this.headerCellsVertical;

        let position = cells[startIndex]?.[type === 'horizontal' ? 'x' : 'y'] || 0;
        for (let i = startIndex; position < scroll + visibleSize; i++) {
            if (i >= cells.length) {
                const size = this.getCellSize(type, i);
                cells.push(
                    new GridHeaderCell(
                        type === 'horizontal' ? position : 0,
                        type === 'horizontal' ? 0 : position,
                        type === 'horizontal' ? size : 30,
                        type === 'horizontal' ? 30 : size,
                        type === 'horizontal' ? this.numberToColumnName(i + 1) : i + 1,
                        type === 'horizontal' ? 0 : i + 1,
                        type === 'horizontal' ? i + 1 : 0
                    )
                );
            }
            const cell = cells[i];
            visibleCells.push(cell);
            position += type === 'horizontal' ? cell.width : cell.height;
        }

        return visibleCells;
    }

    private findStartingIndex(type: 'horizontal' | 'vertical', scroll: number): number {
        const cells = type === 'horizontal' ? this.headerCellsHorizontal : this.headerCellsVertical;
        let low = 0;
        let high = cells.length - 1;

        while (low <= high) {
            const mid = Math.floor((low + high) / 2);
            const cell = cells[mid];
            const position = type === 'horizontal' ? cell.x : cell.y;
            const size = type === 'horizontal' ? cell.width : cell.height;

            if (position + size > scroll) {
                high = mid - 1;
            } else {
                low = mid + 1;
            }
        }

        return low < cells.length ? low : cells.length;
    }

    private getCellSize(type: 'horizontal' | 'vertical', index: number): number {
        if (type === 'horizontal') {
            return this.customColumnWidths.get(index) || 120 * this.zoomLevel;
        } else {
            return this.customRowHeights.get(index) || 40 * this.zoomLevel;
        }
    }

    public getTotalWidth(): number {
        return this.headerCellsHorizontal.reduce(
            (totalWidth, cell) => totalWidth + (this.customColumnWidths.get(cell.col - 1) || cell.width),
            0
        );
    }

    public getTotalHeight(): number {
        return this.headerCellsVertical.reduce(
            (totalHeight, cell) => totalHeight + (this.customRowHeights.get(cell.row - 1) || cell.height),
            0
        );
    }
}
