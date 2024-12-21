class Node {
    constructor(
        public rowValue: number,
        public colValue: number,
        public value: any,
        public nextRow: Node | undefined = undefined,
        public nextCol: Node | undefined = undefined,
        public prevRow: Node | undefined = undefined,
        public prevCol: Node | undefined = undefined,
        public textAlign = 'center',
        public textBaseline = 'middle',
        public fontSize = 14,
        public fontFamily = 'Arial',
        public color = 'black'
    ) {}
}

export class SparseMatrix {
    rowHeaders: { [key: number]: Node | undefined } = {};
    colHeaders: { [key: number]: Node | undefined } = {};

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

    private _insertNodeInRow(row: number, newNode: Node): void {
        let current = this.rowHeaders[row];
        let prev: Node | undefined = undefined;

        while (current && current.colValue < newNode.colValue) {
            prev = current;
            current = current.nextCol;
        }

        if (prev) {
            prev.nextCol = newNode;
            newNode.prevCol = prev;
        } else {
            this.rowHeaders[row] = newNode;
        }

        if (current) {
            newNode.nextCol = current;
            current.prevCol = newNode;
        }
    }

    private _insertNodeInColumn(col: number, newNode: Node): void {
        let current = this.colHeaders[col];
        let prev: Node | undefined = undefined;

        while (current && current.rowValue < newNode.rowValue) {
            prev = current;
            current = current.nextRow;
        }

        if (prev) {
            prev.nextRow = newNode;
            newNode.prevRow = prev;
        } else {
            this.colHeaders[col] = newNode;
        }

        if (current) {
            newNode.nextRow = current;
            current.prevRow = newNode;
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

    addRowInBetween(newRow: number): void {
        Object.keys(this.rowHeaders)
            .map(Number)
            .sort((a, b) => b - a)
            .forEach(row => {
                if (row >= newRow) this._shiftRow(row, row + 1);
            });

        for (let col in this.colHeaders) {
            const newNode = new Node(newRow, parseInt(col), null);
            this._insertNodeInColumn(parseInt(col), newNode);
        }
    }

    addColumnInBetween(newCol: number): void {
        Object.keys(this.colHeaders)
            .map(Number)
            .sort((a, b) => b - a)
            .forEach(col => {
                if (col >= newCol) this._shiftColumn(col, col + 1);
            });

        for (let row in this.rowHeaders) {
            const newNode = new Node(parseInt(row), newCol, null);
            this._insertNodeInRow(parseInt(row), newNode);
            this._insertNodeInColumn(newCol, newNode);
        }
    }

    deleteRow(rowToDelete: number): void {
        let current = this.rowHeaders[rowToDelete];
        while (current) {
            this._removeNodeFromColumn(current.colValue, rowToDelete);
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

    deleteColumn(colToDelete: number): void {
        let current = this.colHeaders[colToDelete];
        while (current) {
            this._removeNodeFromRow(current.rowValue, colToDelete);
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

    private _removeNodeFromRow(row: number, col: number): void {
        let current = this.rowHeaders[row];
        let prev: Node | undefined = undefined;

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

    private _removeNodeFromColumn(row: number, col: number): void {
        let current = this.colHeaders[col];
        let prev: Node | undefined = undefined;

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
}
