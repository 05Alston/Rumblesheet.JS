import {
  DEFAULT_HIGHLIGHT_BORDER_COLOR,
  DEFAULT_HIGHLIGHT_FILL_COLOR,
  DEFAULT_HIGHLIGHT_HEADER_BORDER_COLOR,
  DEFAULT_HIGHLIGHT_HEADER_FILL_COLOR,
  DEFAULT_HIGHLIGHT_HEADER_LINE_WIDTH,
  DEFAULT_HIGHLIGHT_LINE_WIDTH,
  DEFAULT_HORIZONTAL_CANVAS_HEIGHT,
  DEFAULT_VERTICAL_CANVAS_WIDTH,
} from "../../../data/constants.js";
import { IGridHeaderCell, ISelectedCell } from "../../../data/interfaces.js";
import { Cell } from "../../../data/sparseMatrix.js";
import { MainCellManager } from "../mainCellManager.js";

export class Selection {
  private maincellManager!: MainCellManager;
  private canvases: { [key: string]: HTMLCanvasElement };
  private isDragging: boolean;
  private isScrolling: boolean;
  private startPoint!: { x: number; y: number };
  private endPoint!: { x: number; y: number };
  public clickedCell_headercells!: ISelectedCell;
  public selectedCells!: ISelectedCell[];

  constructor(maincellManager: MainCellManager) {
    this.maincellManager = maincellManager;
    this.canvases = this.maincellManager.getCanvases();
    this.selectedCells = [];
    this.isDragging = false;
    this.isScrolling = false;
    this.setupEventListeners();
  }

  setupEventListeners(): void {
    const canvas = this.canvases.spreadsheet;
    canvas.addEventListener("pointerdown", (event) => {
      if (event.button === 0) { // 0 = left button
          this.handlePointerDown(event);
      }
  });    document.addEventListener("pointerup", this.handlePointerUp.bind(this));
    document.addEventListener("pointermove", this.handlePointerMove.bind(this));
  }

  private handlePointerDown(event: PointerEvent) {
    event.preventDefault();
    // console.log(this.canvases)
    this.startPoint = this.maincellManager.getCanvasCoordinates(event);
    this.handleCellClick(event);

    if (!this.isDragging) {
      this.selectedCells = [];
      this.isDragging = true;
      this.isScrolling = true;
      this.updateSelectedCells(this.startPoint);
    }
  }

  private handlePointerUp() {
    this.isScrolling = false;
    this.removeEventListeners();
    if (this.isDragging) {
      this.isDragging = false;
    }
  }

  private handlePointerMove(event: PointerEvent) {
    if (this.isDragging) {
      const currentPoint = this.maincellManager.getCanvasCoordinates(event);
      this.updateSelectedCells(currentPoint);
      this.handleScrolling(event);
    }
  }

  handleScrolling(event: PointerEvent) {
    const { x, y } = this.maincellManager.getCanvasCoordinates(event);
    const { x: scrollX, y: scrollY } = this.maincellManager.getScroll();

    // Check if the pointer is near the edges to trigger scrolling
    const edgeDistance = 30; // Distance from edge to start scrolling
    const canvas = this.canvases.spreadsheet;

    if (x - scrollX < 0 && event.movementX < 0) {
      this.maincellManager.setScroll(-10, 0);
    } else if (
      x - scrollX > canvas.clientWidth - edgeDistance &&
      event.movementX > 0
    ) {
      this.maincellManager.setScroll(10, 0);
    }

    if (y - scrollY < 0 && event.movementY < 0) {
      this.maincellManager.setScroll(0, -10); // Scroll up
    } else if (
      y - scrollY > canvas.clientHeight - edgeDistance &&
      event.movementY > 0
    ) {
      this.maincellManager.setScroll(0, 10); // Scroll down
    }

    this.maincellManager.updateInputElement(this.clickedCell_headercells);
  }

  private handleCellClick(event: PointerEvent) {
    if (this.isDragging) return; // Prevent handling cell click if dragging

    const { x: scrollX, y: scrollY } =
      this.maincellManager.getCanvasCoordinates(event);

    this.clickedCell_headercells = this.maincellManager.getCellFromCoordinates(
      scrollX,
      scrollY
    )!;
    // console.log(this.clickedCell_headercells)
    if (this.clickedCell_headercells) {
      this.deselectCurrentCells();
      // this.maincellManager.updateInputElement(this.clickedCell_headercells);
      this.selectCell(this.clickedCell_headercells);
      // this.updateSelectedCells(this.startPoint);
      // this.drawHighlight();
    }
  }

  private selectCell(cell:ISelectedCell) {
    this.maincellManager.updateInputElement(cell);
    this.maincellManager.draw();
    // this.drawHighlight();
  }

  public deselectCurrentCells() {
    if (this.selectedCells.length > 0) {
      this.selectedCells = [];
      this.maincellManager.hideInputElement(); // Hide the input element if it's visible
      this.maincellManager.draw(); // Redraw the sheet to remove any highlighting
    }
  }

  public updateDrawForScrolling(): void {
    this.maincellManager.updateInputElement(this.clickedCell_headercells);
    this.selectCell(this.clickedCell_headercells);
    this.drawHighlight();
  }

  public updateSelectedCells(endPoint: { x: number; y: number }) {
    const cells = this.maincellManager.getCellsFromRect(
      this.startPoint,
      endPoint
    );
    this.selectedCells = cells;
    this.drawHighlight();
  }

  drawHighlight() {
    this.maincellManager.draw();
    const ctx = this.canvases.spreadsheet.getContext("2d")!;
    const { x: scrollX, y: scrollY } = this.maincellManager.getScroll();

    if (this.selectedCells.length === 0) return;
    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;
    let width = 50;
    let height = 30;
    ctx.strokeStyle = DEFAULT_HIGHLIGHT_BORDER_COLOR;
    ctx.lineWidth = DEFAULT_HIGHLIGHT_LINE_WIDTH;
    // Get the boundary of the selected area
    for (const selectedcell of this.selectedCells) {
      const cell = selectedcell.cell;
      if (cell?.mergedTo){
        minX = Math.min(minX,cell.mergedTo.firstColumnHeaderCell!.x);
        minY = Math.min(minY,cell.mergedTo.firstRowHeaderCell!.y);
        maxX = Math.max(maxX,cell.mergedTo.lastColumnHeaderCell!.x + cell.mergedTo.lastColumnHeaderCell!.width)
        maxY = Math.max(maxY,cell.mergedTo.lastRowHeaderCell!.y + cell.mergedTo.lastRowHeaderCell!.height)
      }
      else{
        minX = Math.min(minX, selectedcell.column!.x);
        minY = Math.min(minY, selectedcell.row!.y);
        maxX = Math.max(maxX, selectedcell.column!.x + selectedcell.column!.width)
        maxY = Math.max(maxY, selectedcell.row!.y + selectedcell.row!.height)
      }
    }
    // minX = Math.min(...this.selectedCells.map((cell) => cell.column!.x));
    // maxX = Math.max(
    //   ...this.selectedCells.map((cell) => {
    //     width = cell.column!.width;
    //     return cell.column!.x + cell.column!.width;
    //   })
    // );
    // minY = Math.min(...this.selectedCells.map((cell) => cell.row!.y));
    // maxY = Math.max(
    //   ...this.selectedCells.map((cell) => {
    //     height = cell.row!.height;
    //     return cell.row!.y + cell.row!.height;
    //   })
    // );

    // Use a single function to draw on both horizontal and vertical canvases
    this.drawRectangleOnHeaderCanvas(
      "horizontal",
      minX - scrollX,
      0,
      maxX - minX,
      height!,
      true
    );
    this.drawRectangleOnHeaderCanvas(
      "vertical",
      0,
      minY - scrollY,
      width!,
      maxY - minY,
      false
    );

    // Draw the border around the entire selection area
    ctx.fillStyle = DEFAULT_HIGHLIGHT_FILL_COLOR;
    ctx.fillRect(minX - scrollX, minY - scrollY, maxX - minX, maxY - minY);
    ctx.strokeRect(minX - scrollX, minY - scrollY, maxX - minX, maxY - minY);
  }

  private drawRectangleOnHeaderCanvas(
    type: string,
    x: number,
    y: number,
    width: number = 0,
    height: number = 0,
    isHorizontal: boolean
  ) {
    const context = this.maincellManager.getContexts();
    const ctx = context[type];
    ctx.beginPath();
    ctx.fillStyle = DEFAULT_HIGHLIGHT_HEADER_FILL_COLOR;
    ctx.fillRect(x, y, width, height);

    if (isHorizontal) {
      // Draw a solid green line at the bottom
      ctx.strokeStyle = DEFAULT_HIGHLIGHT_HEADER_BORDER_COLOR;
      ctx.lineWidth = DEFAULT_HIGHLIGHT_HEADER_LINE_WIDTH;
      ctx.moveTo(x, DEFAULT_HORIZONTAL_CANVAS_HEIGHT);
      ctx.lineTo(x + width, DEFAULT_HORIZONTAL_CANVAS_HEIGHT);
    } else {
      // Draw a solid green line on the right side
      ctx.strokeStyle = DEFAULT_HIGHLIGHT_HEADER_BORDER_COLOR;
      ctx.lineWidth = DEFAULT_HIGHLIGHT_HEADER_LINE_WIDTH;
      ctx.moveTo(DEFAULT_VERTICAL_CANVAS_WIDTH, y);
      ctx.lineTo(DEFAULT_VERTICAL_CANVAS_WIDTH, y + height);
    }

    ctx.stroke(); // Finalize the drawing
  }

  removeEventListeners() {
    const canvas = this.canvases.spreadsheet;
    canvas.removeEventListener("pointerdown", this.handlePointerDown);
    document.removeEventListener("pointerup", this.handlePointerUp);
    document.removeEventListener("pointermove", this.handlePointerMove);
  }
}
