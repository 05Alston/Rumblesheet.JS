import {
  DEFAULT_CELL_HEIGHT,
  DEFAULT_CELL_WIDTH,
} from "../../data/constants.js";
import { Helper } from "../helper/helper.js";

class GridHeaderCell {
  x: number;
  y: number;
  width: number;
  height: number;
  value: string | number;
  row: number;
  col: number;

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
  }
}

export class GridHeaderManager {
  private helper: Helper;
  private zoomIndex: number;
  private viewportWidth: number;
  private viewportHeight: number;
  private headerCellsHorizontal: GridHeaderCell[] = [];
  private headerCellsVertical: GridHeaderCell[] = [];
  private customColumnWidths: Map<number, number> = new Map();
  private customRowHeights: Map<number, number> = new Map();
  private isInfiniteRow: boolean;
  private isInfiniteCol: boolean;
  private totalRow: number;
  private totalCol: number;
  private initialLoadCount: number = 20;
  private loadIncrement: number = 40;
  private baseCellWidth: number = DEFAULT_CELL_WIDTH;
  private baseCellHeight: number = DEFAULT_CELL_HEIGHT;
  private minimumCellWidHei: number = 2;
  private minZoom: number;
  private maxZoom: number;
  scaleFactor!: number;

  constructor(
    helper: Helper,
    viewportWidth: number,
    viewportHeight: number,
    zoomIndex: number,
    totalRow: number,
    totalCol: number
  ) {
    this.helper = helper;
    this.viewportWidth = viewportWidth;
    this.viewportHeight = viewportHeight;
    this.minZoom = this.helper.minZoom;
    this.maxZoom = this.helper.maxZoom;
    this.zoomIndex = Math.min(Math.max(zoomIndex, this.minZoom), this.maxZoom);
    this.isInfiniteRow = totalRow === 0;
    this.isInfiniteCol = totalCol === 0;
    this.totalRow = this.isInfiniteRow ? Number.MAX_SAFE_INTEGER : totalRow;
    this.totalCol = this.isInfiniteCol ? Number.MAX_SAFE_INTEGER : totalCol;
    this.helper.loadedRows = Math.min(
      this.initialLoadCount,
      this.isInfiniteRow ? Infinity : totalRow
    );
    this.helper.loadedCols = Math.min(
      this.initialLoadCount,
      this.isInfiniteCol ? Infinity : totalCol
    );
    this.update(viewportWidth, viewportHeight, this.zoomIndex);
  }

  public update(
    viewportWidth: number,
    viewportHeight: number,
    zoomIndex: number
  ): void {
    const oldzoomIndex = this.zoomIndex;
    this.viewportWidth = viewportWidth;
    this.viewportHeight = viewportHeight;
    this.zoomIndex = zoomIndex;
    this.resizeAllCells(oldzoomIndex, zoomIndex);
    this.generateNewCells();
  }

  public generateNewCells(): void {
    const cellWidth = Math.max(
      this.minimumCellWidHei,
      this.baseCellWidth * this.zoomIndex
    );
    console.log(
      "this is the calc of cell Width",
      cellWidth,
      this.baseCellWidth,
      this.zoomIndex
    );
    const cellHeight = Math.max(
      this.minimumCellWidHei,
      this.baseCellHeight * this.zoomIndex
    );
    this._updateHeaderCells("horizontal", cellWidth);
    this._updateHeaderCells("vertical", cellHeight);
  }

  private _updateHeaderCells(
    type: "horizontal" | "vertical",
    size: number
  ): void {
    const isHorizontal = type === "horizontal";
    const totalCells = Math.min(
      Math.ceil(isHorizontal ? this.helper.loadedCols : this.helper.loadedRows),
      isHorizontal ? this.totalCol : this.totalRow
    );
    const headerCells = isHorizontal
      ? this.headerCellsHorizontal
      : this.headerCellsVertical;
    while (headerCells.length < totalCells) {
      const i = headerCells.length;
      const customSize = isHorizontal
        ? this.customColumnWidths.get(i)
        : this.customRowHeights.get(i);
      const dimension = customSize || size;

      const newCell = new GridHeaderCell(
        0,
        0,
        isHorizontal ? dimension : this.minimumCellWidHei,
        isHorizontal ? this.minimumCellWidHei : dimension,
        isHorizontal ? this.helper.numberToColumnName(i + 1) : i + 1,
        isHorizontal ? 0 : i + 1,
        isHorizontal ? i + 1 : 0
      );

      headerCells.push(newCell);
    }

    this.updateCellPositions(type);
  }

  private updateCellPositions(type: "horizontal" | "vertical"): void {
    const cells =
      type === "horizontal"
        ? this.headerCellsHorizontal
        : this.headerCellsVertical;
    let position = 0;

    cells.forEach((cell, index) => {
      if (type === "horizontal") {
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

  private calculateVisibleCells(): { rows: number; cols: number } {
    const cellWidth = this.baseCellWidth * this.zoomIndex;
    const cellHeight = this.baseCellHeight * this.zoomIndex;
    return {
      rows: Math.ceil(this.viewportHeight / cellHeight),
      cols: Math.ceil(this.viewportWidth / cellWidth),
    };
  }

  public getCellSize(type: "horizontal" | "vertical", index: number): number {
    if (type === "horizontal") {
      return (
        this.customColumnWidths.get(index) ||
        this.baseCellWidth * this.zoomIndex
      );
    } else {
      return (
        this.customRowHeights.get(index) || this.baseCellHeight * this.zoomIndex
      );
    }
  }

  setCustomCellSize(
    type: "horizontal" | "vertical",
    index: number,
    size: number
  ) {
    const customSizes =
      type === "horizontal" ? this.customColumnWidths : this.customRowHeights;
    customSizes.set(index, Math.max(this.minimumCellWidHei, size));
    this.updateCellPositions(type);
  }

  public resizeAllCells(oldzoomIndex: number, newzoomIndex: number): void {
    this.scaleFactor = newzoomIndex / oldzoomIndex;

    // Resize horizontal header cells
    this.headerCellsHorizontal.forEach((cell) => {
      if (!this.customColumnWidths.has(cell.col - 1)) {
        cell.width *= this.scaleFactor;
      }
    });

    // Resize vertical header cells
    this.headerCellsVertical.forEach((cell) => {
      if (!this.customRowHeights.has(cell.row - 1)) {
        cell.height *= this.scaleFactor;
      }
    });
  }

  public getHeaderCellsHorizontal(scrollX: number): GridHeaderCell[] {
    return this._getVisibleHeaderCells(
      "horizontal",
      scrollX,
      this.viewportWidth
    );
  }

  public getHeaderCellsVertical(scrollY: number): GridHeaderCell[] {
    return this._getVisibleHeaderCells(
      "vertical",
      scrollY,
      this.viewportHeight
    );
  }

  public getHeaderCells() {
    return [this.headerCellsHorizontal, this.headerCellsVertical];
  }

  public getAllHorizontalHeaderCells(): GridHeaderCell[] {
    return this.headerCellsHorizontal;
  }

  public getAllVerticalHeaderCells(): GridHeaderCell[] {
    return this.headerCellsVertical;
  }

  public loadMoreContent(direction: "vertical" | "horizontal"): boolean {
    if (direction === "vertical" && this.isInfiniteRow) {
      this.helper.loadedRows += this.loadIncrement;
      this.generateNewCells();
      return true;
    } else if (direction === "horizontal" && this.isInfiniteCol) {
      this.helper.loadedCols += this.loadIncrement;
      this.generateNewCells();
      return true;
    } else {
      // For finite scrolling
      if (direction === "vertical") {
        const newLoadedRows = Math.min(
          this.helper.loadedRows + this.loadIncrement,
          this.totalRow
        );
        if (newLoadedRows > this.helper.loadedRows) {
          this.helper.loadedRows = newLoadedRows;
          this.generateNewCells();
          return true;
        }
      } else {
        const newLoadedCols = Math.min(
          this.helper.loadedCols + this.loadIncrement,
          this.totalCol
        );
        if (newLoadedCols > this.helper.loadedCols) {
          this.helper.loadedCols = newLoadedCols;
          this.generateNewCells();
          return true;
        }
      }
    }
    return false;
  }

  public getScrollbarRatio(direction: "vertical" | "horizontal"): number {
    const isVertical = direction === "vertical";

    const total = isVertical ? this.totalRow : this.totalCol;
    const loaded = isVertical ? this.helper.loadedRows : this.helper.loadedCols;
    const visible = this.calculateVisibleCells()[isVertical ? "rows" : "cols"];
    console.log(visible, total);

    const isInfinite = isVertical ? this.isInfiniteRow : this.isInfiniteCol;
    const isOppositeInfinite = isVertical
      ? this.isInfiniteCol
      : this.isInfiniteRow;
    console.log(isInfinite, isOppositeInfinite);

    if (isInfinite) {
      // Infinite scrolling for this direction
      return Math.min(0.4, visible / loaded);
    } else if (isOppositeInfinite) {
      // Opposite direction is infinite, finite scrolling for this direction
      return Math.min(1, visible / total);
    } else {
      // Both directions are finite
      return Math.min(1, visible / total);
    }
  }
  private _getVisibleHeaderCells(
    type: "horizontal" | "vertical",
    scroll: number,
    visibleSize: number
  ): GridHeaderCell[] {
    const isHorizontal = type === "horizontal";
    const cells = isHorizontal
      ? this.headerCellsHorizontal
      : this.headerCellsVertical;
    const startIndex = this.findStartingIndex(type, scroll);
    const visibleCells: GridHeaderCell[] = [];

    let position = cells[startIndex]?.[isHorizontal ? "x" : "y"] || 0;
    let i = startIndex;

    while (position < scroll + visibleSize) {
      if (i >= cells.length) {
        if (!this.loadMoreContent(isHorizontal ? "horizontal" : "vertical")) {
          break;
        }
        // After loading more content, cells array should be updated
        continue;
      }

      const cell = cells[i];
      if (!cell) break;

      visibleCells.push(cell);
      position += isHorizontal ? cell.width : cell.height;
      i++;
    }

    return visibleCells;
  }

  public findStartingIndex(
    type: "horizontal" | "vertical",
    scroll: number
  ): number {
    const cells =
      type === "horizontal"
        ? this.headerCellsHorizontal
        : this.headerCellsVertical;
    let low = 0;
    let high = cells.length - 1;

    while (low <= high) {
      const mid = Math.floor((low + high) / 2);
      const cell = cells[mid];
      const position = type === "horizontal" ? cell.x : cell.y;
      const size = type === "horizontal" ? cell.width : cell.height;

      if (position + size > scroll) {
        high = mid - 1;
      } else {
        low = mid + 1;
      }
    }

    return low < cells.length ? low : cells.length;
  }

  public getTotalContainerWidth(): number {
    console.log(
      "This is the total Width of the container",
      this.headerCellsHorizontal
        .slice(0, this.helper.loadedCols)
        .reduce(
          (totalWidth, cell) =>
            totalWidth +
            (this.customColumnWidths.get(cell.col - 1) || cell.width),
          0
        )
    );
    return this.headerCellsHorizontal
      .slice(0, this.helper.loadedCols)
      .reduce(
        (totalWidth, cell) =>
          totalWidth +
          (this.customColumnWidths.get(cell.col - 1) || cell.width),
        0
      );
  }

  public getTotalContainerHeight(): number {
    return this.headerCellsVertical
      .slice(0, this.helper.loadedRows)
      .reduce(
        (totalHeight, cell) =>
          totalHeight +
          (this.customRowHeights.get(cell.row - 1) || cell.height),
        0
      );
  }
}
