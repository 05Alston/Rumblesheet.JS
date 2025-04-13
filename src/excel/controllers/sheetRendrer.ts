import { Helper } from "../helper/helper.js";
import { ICell, IGridHeaderCell } from "../../data/interfaces.js";
import { DEFAULT_CANVAS_LINE_WIDTH, DEFAULT_CANVAS_TEXT_ALIGN, DEFAULT_CANVAS_TEXT_BASELINE,  DEFAULT_CANVAS_LINES_COLOR, DEFAULT_CANVAS_TEXT_COLOR, DEFAULT_CANVAS_FONT_FAMILY, DEFAULT_MIN_PADDING_IN_CELL, DEFAULT_CELL_BG_COLOR, DEFAULT_CELL_FONT_COLOR, DEFAULT_FONT_SIZE } from "../../data/constants.js";
import { ETextAlign, ETextBaseLine } from "../../data/enums.js";

export class SheetRendrer {
  private zoomIndex: number;
  private minZoom: number;
  private maxZoom: number;
  helper: Helper;
  baseGridSize: number;
  lastDevicePixelRatio: number;
  resizeObserver?: ResizeObserver;
    canvases?: { [key: string]: HTMLCanvasElement; };
    contexts?: { [key: string]: CanvasRenderingContext2D; };
  verticalCells!: IGridHeaderCell[];
  horizontalCells!: IGridHeaderCell[];
    public lastVisibleRow:number = 0;
    public lastVisibleCol:number = 0;


  constructor(helper: Helper) {
    this.helper = helper;
    this.zoomIndex = this.helper.zoomIndex;
    this.minZoom = this.helper.minZoom;
    this.maxZoom = this.helper.maxZoom;
    this.baseGridSize = 20;
    this.lastDevicePixelRatio = window.devicePixelRatio;
    this.mappingFromHelper();
    this.setUpResizeObserver();
    this.setupEventListeners();
    this.monitorDevicePixelRatio();
  }

    mappingFromHelper():void {
    this.resizeObserver = this.helper.resizeObserver;
    this.canvases = this.helper.canvases;
    this.contexts = this.helper.contexts;
  }

    setUpResizeObserver():void {
    // Set up the ResizeObserver
    this.resizeObserver = new ResizeObserver(this.handleResize.bind(this));
    this.resizeObserver.observe(this.canvases!.spreadsheet);
  }

  resizeCanvases() {
    const dpr = window.devicePixelRatio;
    Object.values(this.canvases ?? {}).forEach((canvas) =>
      this.updateCanvasDimensions(canvas ?? {}, dpr)
    );
    this.updateHeaderCells();
    this.draw();
      this.helper.updateDrawForFeatures()
  }

    updateCanvasDimensions(canvas: HTMLCanvasElement, dpr: number):void {
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    const ctx = canvas.getContext("2d")!;
    ctx.scale(dpr, dpr);
  }

    setupEventListeners():void {
    window.addEventListener("resize", this.handleResize.bind(this));
    this.canvases!.spreadsheet.addEventListener(
      "wheel",
      this.handleWheel.bind(this),
      { passive: false }
    );
  }

  handleResize() {
    this.resizeCanvases();
  }

    handleWheel(event: WheelEvent):void {
    if (event.ctrlKey || event.metaKey) {
      event.preventDefault();
      const delta = event.deltaY;
      const zoomDelta = delta > 0 ? 0.9 : 1.1;

      const rect = this.canvases!.spreadsheet.getBoundingClientRect();
      const mouseX = event.clientX - rect.left;
      const mouseY = event.clientY - rect.top;

      this.zoom(zoomDelta, mouseX, mouseY);
    }
  }

    zoom(zoomDelta: number, centerX: number, centerY: number):void {
    const buffer = 5;
    const newScale = Math.min(
      Math.max(this.zoomIndex * zoomDelta, this.minZoom),
      this.maxZoom
    );
    if (this.helper.totalCol === 0 && this.helper.totalRow === 0) {
      this.applyzoom(newScale);

      }
      else if ((this.lastVisibleRow + buffer < this.helper.totalRow && this.lastVisibleCol + buffer < this.helper.totalCol) ||
          newScale > this.zoomIndex) {
      this.applyzoom(newScale);

      }
      else if ((this.helper.totalCol === 0 && this.lastVisibleRow + buffer < this.helper.totalRow) ||newScale > this.zoomIndex){
      this.applyzoom(newScale);
      }
      else if ((this.helper.totalRow === 0 && this.lastVisibleCol + buffer < this.helper.totalCol) || newScale > this.zoomIndex){
      this.applyzoom(newScale);
    }
  }

  private applyzoom(zoomIndex: number): void {
    this.zoomIndex = zoomIndex;
    this.updateHeaderCells();
    this.helper.updateMaxScroll();
    this.draw();
        this.helper.updateDrawForFeatures()

  }

    monitorDevicePixelRatio():void {
    const checkDevicePixelRatio = () => {
      const currentDevicePixelRatio = window.devicePixelRatio;
      if (currentDevicePixelRatio !== this.lastDevicePixelRatio) {
        this.lastDevicePixelRatio = currentDevicePixelRatio;
        this.resizeCanvases();
      }
      requestAnimationFrame(checkDevicePixelRatio);
    };

    requestAnimationFrame(checkDevicePixelRatio);
  }

    clearCanvases():void {
    Object.entries(this.contexts ?? {}).forEach(([type, ctx]) => {
      const canvas = this.canvases![type];
      ctx.clearRect(
        0,
        0,
        canvas.width / window.devicePixelRatio,
        canvas.height / window.devicePixelRatio
      );
    });
  }

  updateHeaderCells(): void {
    const visibleWidth = this.canvases!.spreadsheet.clientWidth;
    const visibleHeight = this.canvases!.spreadsheet.clientHeight;
    this.helper.updateZoomIndex(visibleWidth, visibleHeight, this.zoomIndex);
    this.helper.updateMaxScroll();
  }

  draw(): void {
    this.clearCanvases();

    // Get the scroll values
    const { x: scrollX, y: scrollY } = this.helper.getScroll();

    // Check if more content needs to be loaded
    this.drawHeaders(scrollX, scrollY);
    this.drawGrid(scrollX, scrollY);
    this.drawSparseMatrixValues(scrollX, scrollY);
  
  }

  drawHeaders(scrollX: number, scrollY: number): void {
    this.verticalCells = this.helper.getVerticalHeaderCells(scrollY);
      this.lastVisibleRow = this.verticalCells[this.verticalCells.length - 1].row
    this.horizontalCells = this.helper.getHorizontalHeaderCells(scrollX);
      this.lastVisibleCol = this.horizontalCells[this.horizontalCells.length -1].col

    this.drawHeaderCells(
      this.contexts!.vertical,
      this.verticalCells,
      true,
      scrollY
    );
    this.drawHeaderCells(
      this.contexts!.horizontal,
      this.horizontalCells,
      false,
      scrollX
    );
  }

  drawHeaderCells(
    ctx: CanvasRenderingContext2D,
      cells: { x: number, y: number, width: number, height: number , value:number | string }[], 
    isVertical: boolean,
    scroll: number
  ): void {
    ctx.lineWidth = DEFAULT_CANVAS_LINE_WIDTH;
    ctx.textAlign = DEFAULT_CANVAS_TEXT_ALIGN;
    ctx.textBaseline = DEFAULT_CANVAS_TEXT_BASELINE;
    ctx.strokeStyle =DEFAULT_CANVAS_LINES_COLOR;
    ctx.fillStyle = DEFAULT_CANVAS_TEXT_COLOR;

    const canvasWidth =
        this.canvases![isVertical ? "vertical" : "horizontal"].width / window.devicePixelRatio;
    const canvasHeight =
        this.canvases![isVertical ? "vertical" : "horizontal"].height / window.devicePixelRatio;

    cells.forEach((cell) => {
      const drawCell =
        (isVertical &&
          cell.y - scroll < canvasHeight &&
          cell.y + cell.height - scroll > 0) ||
        (!isVertical &&
          cell.x - scroll < canvasWidth &&
          cell.x + cell.width - scroll > 0);

      if (drawCell) {
        ctx.beginPath();
        if (isVertical) {
          const y = cell.y - scroll;
          ctx.moveTo(0, y);
          ctx.lineTo(canvasWidth, y);
          ctx.stroke();
          this.drawAtCentered(
            ctx,
            cell.value.toString(),
            canvasWidth / 2,
            y + cell.height / 2,
            canvasWidth,
            cell.height
          );
        } else {
          const x = cell.x - scroll;
          ctx.moveTo(x, 0);
          ctx.lineTo(x, canvasHeight);
          ctx.stroke();
          this.drawAtCentered(
            ctx,
            cell.value.toString(),
            x + cell.width / 2,
            canvasHeight / 2,
            cell.width,
            canvasHeight
          );
        }
      }
    });
  }


    drawAtCentered(ctx: CanvasRenderingContext2D,text: string,x: number,y: number,
    maxWidth: number,
      maxHeight: number): void{
    const baseFontSize = this.baseGridSize * this.zoomIndex;
    let fontSize = Math.min(baseFontSize, maxHeight * 0.8);

    // Adjust font size if text is too wide
    // ctx.font = `${fontSize}px Arial`;

    let textWidth = ctx.measureText(text).width;
    if (textWidth > maxWidth * 0.9) {
      fontSize *= (maxWidth * 0.9) / textWidth;
    }
    ctx.font = `${fontSize}px ${DEFAULT_CANVAS_FONT_FAMILY}`;
    ctx.strokeStyle = DEFAULT_CANVAS_LINES_COLOR;
    ctx.fillText(text, x, y, maxWidth);
  }

  drawGrid(scrollX: number, scrollY: number): void {
    const ctx: CanvasRenderingContext2D = this.contexts!.spreadsheet;
    const verticalCells: IGridHeaderCell[] = this.verticalCells;
    const horizontalCells: IGridHeaderCell[] = this.horizontalCells;

    ctx.strokeStyle = DEFAULT_CANVAS_LINES_COLOR;
    ctx.lineWidth = DEFAULT_CANVAS_LINE_WIDTH;

    const canvasWidth: number =
      this.canvases!.spreadsheet.width / window.devicePixelRatio;
    const canvasHeight: number =
      this.canvases!.spreadsheet.height / window.devicePixelRatio;

    verticalCells.forEach((cell: IGridHeaderCell) => {
      const y: number = cell.y - scrollY;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvasWidth, y);
      ctx.stroke();
    });

    horizontalCells.forEach((cell: IGridHeaderCell) => {
      const x: number = cell.x - scrollX;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvasHeight);
      ctx.stroke();
    });
  }

  drawSparseMatrixValues(scrollX: number, scrollY: number): void {
    const ctx: CanvasRenderingContext2D = this.contexts!.spreadsheet;
    const visibleWidth: number = this.canvases!.spreadsheet.width / window.devicePixelRatio;
    const visibleHeight: number = this.canvases!.spreadsheet.height / window.devicePixelRatio;
  
    const verticalCellMap: Map<number | string, IGridHeaderCell> = new Map(
      this.verticalCells.map((cell: IGridHeaderCell) => [cell.value, cell])
    );
    const horizontalCellMap: Map<string, IGridHeaderCell> = new Map(
      this.horizontalCells.map((cell: IGridHeaderCell) => [cell.value as string, cell])
    );
  
    let rowHeader = this.helper.getRowheader();
    for (const row in rowHeader) {
      let current = rowHeader[row];
      while (current) {
        const vCell = verticalCellMap.get(current.rowValue);
        const hCell = horizontalCellMap.get(this.helper!.numberToColumnName(current.colValue));
        if (!vCell || !hCell) {
          current = current.nextCol;
          continue;
        }
  
        const cellX = hCell.x - scrollX;
        const cellY = vCell.y - scrollY;
  
        const isMergedRoot = !current.mergedTo || current.mergedTo === current;
        if (!isMergedRoot) {
          current = current.nextCol;
          continue; // Skip non-root merged cells
        }
  
        const { width: mergeCols, height: mergeRows } = this.helper.getMergedRange(current);
  
        const rightCell = this.horizontalCells.find(c => c.col === current!.colValue + mergeCols - 1);
        const bottomCell = this.verticalCells.find(c => c.row === current!.rowValue + mergeRows - 1);
  
        if (!rightCell || !bottomCell) {
          current = current.nextCol;
          continue;
        }
  
        const mergedWidth = rightCell.x + rightCell.width - hCell.x;
        const mergedHeight = bottomCell.y + bottomCell.height - vCell.y;
  
        if (
          cellX < visibleWidth &&
          cellY < visibleHeight &&
          cellX + mergedWidth > 0 &&
          cellY + mergedHeight > 0
        ) {
          ctx.save();
  
          if (current) {
            ctx.fillStyle = current.styles.color ?? DEFAULT_CANVAS_TEXT_COLOR;
            const fontSize = (current.styles?.fontSize ?? DEFAULT_FONT_SIZE) * this.zoomIndex;
            const fontFamily = current.styles?.fontFamily ?? DEFAULT_CANVAS_FONT_FAMILY;
            const fontWeight = current.styles?.bold ? "bold" : "normal";
            const fontStyle = current.styles?.italic ? "italic" : "normal";
            ctx.font = `${fontStyle} ${fontWeight} ${fontSize}px ${fontFamily}`;
          }
  
          ctx.beginPath();
          ctx.fillStyle = current.styles.fill ?? DEFAULT_CELL_BG_COLOR;
          ctx.fillRect(
            cellX + DEFAULT_CANVAS_LINE_WIDTH / 2,
            cellY + DEFAULT_CANVAS_LINE_WIDTH / 2,
            mergedWidth - DEFAULT_CANVAS_LINE_WIDTH,
            mergedHeight - DEFAULT_CANVAS_LINE_WIDTH
          );
          ctx.fillStyle = current.styles.color ?? DEFAULT_CELL_FONT_COLOR;
          ctx.rect(cellX, cellY, mergedWidth, mergedHeight);
          ctx.clip();
  
          if (current.value !== undefined && current.value !== null) {
            let textX = cellX + (current.styles.textIndent ?? 0) + hCell.width / 2;
            let textY = cellY + vCell.height / 2;
            ctx.textAlign = DEFAULT_CANVAS_TEXT_ALIGN as CanvasTextAlign;
  
            if (current.styles.textAlign === ETextAlign.Left) {
              textX = cellX + (current.styles.textIndent ?? 0) + DEFAULT_MIN_PADDING_IN_CELL;
              ctx.textAlign = ETextAlign.Left as CanvasTextAlign;
            } else if (current.styles.textAlign === ETextAlign.Center) {
              textX = cellX + (current.styles.textIndent ?? 0) + mergedWidth / 2;
              ctx.textAlign = ETextAlign.Center as CanvasTextAlign;
            } else if (current.styles.textAlign === ETextAlign.Right) {
              textX = cellX + (current.styles.textIndent ?? 0) + mergedWidth - DEFAULT_MIN_PADDING_IN_CELL;
              ctx.textAlign = ETextAlign.Right as CanvasTextAlign;
            }
  
            if (current.styles.textBaseline === ETextBaseLine.Top) {
              textY = cellY + DEFAULT_MIN_PADDING_IN_CELL;
              ctx.textBaseline = ETextBaseLine.Top as CanvasTextBaseline;
            } else if (current.styles.textBaseline === ETextBaseLine.Middle) {
              textY = cellY + mergedHeight / 2;
              ctx.textBaseline = ETextBaseLine.Middle as CanvasTextBaseline;
            } else if (current.styles.textBaseline === ETextBaseLine.Bottom) {
              textY = cellY + mergedHeight - DEFAULT_MIN_PADDING_IN_CELL;
              ctx.textBaseline = ETextBaseLine.Bottom as CanvasTextBaseline;
            }
  
            ctx.fillText(current.value.toString(), textX, textY);
          }
  
          ctx.restore();
        }
  
        current = current.nextCol;
      }
    }
  }
}
