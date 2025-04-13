import { DEFAULT_CELL_STYLES } from "./constants.js";
import { ICell, ICellStyles, IGridHeaderCell, ISelectedCell } from "./interfaces.js";

export class Cell {
  public firstColumnHeaderCell: IGridHeaderCell| undefined;
  public lastColumnHeaderCell: IGridHeaderCell| undefined;
  public firstRowHeaderCell: IGridHeaderCell| undefined;
  public lastRowHeaderCell: IGridHeaderCell| undefined;
  public rowValue: number;
  public colValue: number;
  public value: string | null;
  public nextRow?: ICell | undefined;
  public nextCol?: ICell | undefined;
  public prevRow?: ICell | undefined;
  public prevCol?: ICell | undefined;
  public styles: ICellStyles;
  public mergedTo?: ICell | undefined ;

  constructor(
    rowValue: number,
    colValue: number,
    value: string | null,
    nextRow?: ICell | undefined,
    nextCol?: ICell | undefined,
    prevRow?: ICell | undefined,
    prevCol?: ICell | undefined, 
    styles?: ICellStyles,
  ) {
    this.rowValue = rowValue;
    this.colValue = colValue;
    this.value = value;
    this.nextRow = nextRow;
    this.nextCol = nextCol;
    this.prevRow = prevRow;
    this.prevCol = prevCol;
    this.styles = { ...DEFAULT_CELL_STYLES, ...styles }; // Ensures `styles` is never undefined
  }
}

export class SparseMatrix {
  rowHeaders: { [key: number]: Cell | undefined } = {};
  colHeaders: { [key: number]: Cell | undefined } = {};

  private _cellExists(row: number, col: number): boolean {
    let current = this.rowHeaders[row];
    while (current) {
      if (current.colValue === col) return true;
      current = current.nextCol;
    }
    return false;
  }

  private _shiftRow(row: number, newRow: number): void {
    let current = this.rowHeaders[row];
    while (current) {
      current.rowValue = newRow;
      current = current.nextCol;
    }
    this.rowHeaders[newRow] = this.rowHeaders[row];
    delete this.rowHeaders[row];
  }

  private _shiftColumn(col: number, newCol: number): void {
    let current = this.colHeaders[col];
    while (current) {
      current.colValue = newCol;
      current = current.nextRow;
    }
    this.colHeaders[newCol] = this.colHeaders[col];
    delete this.colHeaders[col];
  }

  private _insertCellInRow(row: number, newCell: Cell): void {
    let current = this.rowHeaders[row];
    let prev: Cell | undefined = undefined;

    while (current && current.colValue < newCell.colValue) {
      prev = current;
      current = current.nextCol;
    }

    if (prev) {
      prev.nextCol = newCell;
      newCell.prevCol = prev;
    } else {
      this.rowHeaders[row] = newCell;
    }

    if (current) {
      newCell.nextCol = current;
      current.prevCol = newCell;
    }
  }

  private _insertCellInColumn(col: number, newCell: Cell): void {
    let current = this.colHeaders[col];
    let prev: Cell | undefined = undefined;

    while (current && current.rowValue < newCell.rowValue) {
      prev = current;
      current = current.nextRow;
    }

    if (prev) {
      prev.nextRow = newCell;
      newCell.prevRow = prev;
    } else {
      this.colHeaders[col] = newCell;
    }

    if (current) {
      newCell.nextRow = current;
      current.prevRow = newCell;
    }
  }

  private _shiftCellsRight(row: number, col: number): void {
    let current = this.rowHeaders[row];
    while (current && current.colValue < col) current = current.nextCol;

    while (current) {
      this._shiftColumn(current.colValue, current.colValue + 1);
      current = current.nextCol;
    }
  }

  private _shiftCellsDown(row: number, col: number): void {
    let current = this.colHeaders[col];
    while (current && current.rowValue < row) current = current.nextRow;

    while (current) {
      this._shiftRow(current.rowValue, current.rowValue + 1);
      current = current.nextRow;
    }
  }

  private _removeCellFromRow(row: number, col: number): void {
    let current = this.rowHeaders[row];
    let prev: Cell | undefined = undefined;

    while (current && current.colValue !== col) {
      prev = current;
      current = current.nextCol;
    }

    if (!current) return;

    if (prev) {
      prev.nextCol = current.nextCol;
    } else {
      this.rowHeaders[row] = current.nextCol;
    }

    if (current.nextCol) {
      current.nextCol.prevCol = prev;
    }
  }

  private _removeCellFromColumn(row: number, col: number): void {
    let current = this.colHeaders[col];
    let prev: Cell | undefined = undefined;

    while (current && current.rowValue !== row) {
      prev = current;
      current = current.nextRow;
    }

    if (!current) return;

    if (prev) {
      prev.nextRow = current.nextRow;
    } else {
      this.colHeaders[col] = current.nextRow;
    }

    if (current.nextRow) {
      current.nextRow.prevRow = prev;
    }
  }

    private createCell(row:number, col:number, value:string | null) {
    if (this._cellExists(row, col)) return;

    const newNode = new Cell(row, col, value);
    if (!this.rowHeaders[row]) {
      this.rowHeaders[row] = newNode;
    } else {
      this._insertCellInRow(row, newNode);
    }

    if (!this.colHeaders[col]) {
      this.colHeaders[col] = newNode;
    } else {
      this._insertCellInColumn(col, newNode);
    }
  }

    private _updateCellValue(row:number, col:number, value:string | null) {
    let current = this.rowHeaders[row];
    while (current) {
      if (current.colValue === col) {
        current.value = value;
        return;
      }
      current = current.nextCol;
    }
  }

  public addRowInBetween(newRow: number): void {
    Object.keys(this.rowHeaders)
      .map(Number)
      .sort((a, b) => b - a)
            .forEach(row => {
        if (row >= newRow) this._shiftRow(row, row + 1);
      });

    for (let col in this.colHeaders) {
      const newCell = new Cell(newRow, parseInt(col), null);
      this._insertCellInColumn(parseInt(col), newCell);
    }
  }

  public addColumnInBetween(newCol: number): void {
    Object.keys(this.colHeaders)
      .map(Number)
      .sort((a, b) => b - a)
            .forEach(col => {
        if (col >= newCol) this._shiftColumn(col, col + 1);
      });

    for (let row in this.rowHeaders) {
      const newCell = new Cell(parseInt(row), newCol, null);
      this._insertCellInRow(parseInt(row), newCell);
      this._insertCellInColumn(newCol, newCell);
    }
  }

  public deleteRow(rowToDelete: number): void {
    let current = this.rowHeaders[rowToDelete];
    while (current) {
      this._removeCellFromColumn(current.colValue, rowToDelete);
      current = current.nextCol;
    }
    delete this.rowHeaders[rowToDelete];
    Object.keys(this.rowHeaders)
      .map(Number)
      .sort((a, b) => a - b)
            .forEach(row => {
        if (row > rowToDelete) this._shiftRow(row, row - 1);
      });
  }

  public deleteColumn(colToDelete: number): void {
    let current = this.colHeaders[colToDelete];
    while (current) {
      this._removeCellFromRow(current.rowValue, colToDelete);
      current = current.nextRow;
    }
    delete this.colHeaders[colToDelete];
    Object.keys(this.colHeaders)
      .map(Number)
      .sort((a, b) => a - b)
            .forEach(col => {
        if (col > colToDelete) this._shiftColumn(col, col - 1);
      });
  }

    public getCell(row:number, col:number): Cell|null {
    let current = this.rowHeaders[row];
    while (current) {
      if (current.colValue === col) return current;
      current = current.nextCol;
    }
    return null;
  }

    public setCell(row:number, col:number, value:string | null) {
    if (this._cellExists(row, col)) {
      this._updateCellValue(row, col, value);
    } else {
      this.createCell(row, col, value);
    }
  }

  public updateCellsForSparse(selectedCells: ISelectedCell[]) {
    // console.log(selectedCells)
    if (!selectedCells.length) return;
  
    for (const cellInfo of selectedCells) {
      const col = cellInfo.column?.col;
      const row = cellInfo.row?.row;
  
      if (col === undefined || row === undefined) continue;
  
      // Check if cell exists
      if (!this._cellExists(row, col)) {
        this.createCell(row, col, null); // Create with null value
      }
  
      const cell = this.getCell(row, col); // Assuming this retrieves the created/existing cell
      if (cell) {
        cell.mergedTo = this.getCell(selectedCells[0].row?.row!,selectedCells[0].column?.col!)!;
        console.log(cell)
      }
    }
    const target_cell = this.getCell(selectedCells[0].row?.row!,selectedCells[0].column?.col!)!;
    target_cell.firstRowHeaderCell = selectedCells[0].row;
    target_cell.firstColumnHeaderCell =  selectedCells[0].column ;
    target_cell.lastRowHeaderCell = selectedCells[selectedCells.length - 1].row;
    target_cell.lastColumnHeaderCell = selectedCells[selectedCells.length - 1].column;
  }
}
