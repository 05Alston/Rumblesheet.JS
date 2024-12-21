
import { Helper } from "./helper";

export class SheetRendrer {
    helper: Helper; // Define sheet as any or create a specific type if you have one
    scale: number;
    minScale: number;
    maxScale: number;
    baseGridSize: number;
    headerCellManager: any; // Define type properly if available
    lastDevicePixelRatio: number;
    sparseMatrix: any; // Define sparseMatrix type or use 'any'
    fetch: any; // Define type or use 'any'
    resizeObserver?: ResizeObserver;
    canvases?: { [key: string]: HTMLCanvasElement; };
    contexts?: { [key: string]: CanvasRenderingContext2D; };
   
   
  
    constructor(helper: Helper) {
      this.helper = helper;
      this.scale = 1;
      this.minScale = 0.5;
      this.maxScale = 2;
      this.baseGridSize = 20;
      this.headerCellManager = null;
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
      this.resizeCanvases();
    }
  
    resizeCanvases() {
      const dpr = window.devicePixelRatio;
      Object.values(this.canvases ?? {}).forEach((canvas) =>
        this.updateCanvasDimensions(canvas ?? {}, dpr)
      );
      this.updateHeaderCells();
      this.draw();
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
        const zoomFactor = delta > 0 ? 0.9 : 1.1;
  
        const rect = this.canvases!.spreadsheet.getBoundingClientRect();
        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;
  
        this.zoom(zoomFactor, mouseX, mouseY);
      }
    }
  
    zoom(factor: number, centerX: number, centerY: number):void {
      const newScale = Math.min(
        Math.max(this.scale * factor, this.minScale),
        this.maxScale
      );
      if (newScale !== this.scale) {
        this.scale = newScale;
        this.updateHeaderCells();
        this.updateMaxScroll();
  
        this.draw();
      }
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
  
    updateHeaderCells() {
      // Update header cell logic here
    }
  
    draw() {
      // Drawing functionality here
    }
  
    updateMaxScroll() {
      // Update scroll boundaries here
    }
  }
  