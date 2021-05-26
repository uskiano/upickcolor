var udragger;
(function (udragger) {
    class UGrid {
        constructor(board, options) {
            this.board = board;
            this.options = options;
            this.cells = [];
            this.gridRowElems = [];
            this.gridColElems = [];
            this.shadowDrag = null;
            this.shadowDest = null;
            this.shadowDestCellRect = null;
            let b = board.getBoundingClientRect();
            if (b.width == 0 || b.height == 0) {
                throw Error('Can not create grid because the container has width and height are zero');
            }
            this.width = b.width;
            this.height = b.height;
            this.rows = options.GridSize ? options.GridSize.Rows : -1;
            this.cols = options.GridSize ? options.GridSize.Cols : -1;
            if (this.options.ConstraintPosition) {
                // if not allowed elem overlapping then create a matrix to store elem positions
                this.createCells();
                this.createShadowElems();
                window.cells = this.cells;
            }
            if (options.Visible) {
                this.drawGridLines();
            }
        }
        getShadowDragElem() {
            return this.shadowDrag;
        }
        getShadowDestElem() {
            return this.shadowDest;
        }
        createCells() {
            let cellWidth = +(this.width / this.cols).toFixed(2);
            let cellHeight = +(this.height / this.rows).toFixed(2);
            let gap = this.options.Thickness;
            for (let row = 0; row < this.rows; row++) {
                this.cells[row] = [];
                for (let col = 0; col < this.cols; col++) {
                    this.cells[row][col] = {
                        Row: row,
                        Col: col,
                        Rect: {
                            X1: col * cellWidth,
                            Y1: row * cellHeight,
                            X2: col * cellWidth + cellWidth,
                            Y2: row * cellHeight + cellHeight,
                        },
                        Size: {
                            Width: cellWidth,
                            Height: cellHeight
                        },
                        Ids: []
                    };
                }
            }
            window.cells = this.cells; // TODO: remove
            //console.log(this.cells);
            window.printcells = () => { this.printCells(); };
        }
        printCells() {
            let strCells = '';
            for (let row = 0; row < this.rows; row++) {
                for (let col = 0; col < this.cols; col++) {
                    let num = this.cells[row][col].Ids.length;
                    strCells += `, ${num}`;
                }
                strCells += '\n';
            }
            console.log(strCells);
            return 0;
        }
        drawGridLines() {
            let cellWidth = +(this.width / this.cols).toFixed(2);
            let cellHeight = +(this.height / this.rows).toFixed(2);
            for (let row = 0; row <= this.rows; row++) {
                if (this.gridRowElems[row] == undefined) {
                    let lineElem = util.html.createElem('div', '', 'ugrid-line');
                    this.gridRowElems.push(lineElem);
                    this.board.append(lineElem);
                }
                let line = this.gridRowElems[row];
                line.style.left = `0px`;
                line.style.top = `${row * cellHeight}px`;
                line.style.width = `${this.width}px`;
                line.style.height = `${this.options.Thickness}px`;
            }
            for (let col = 0; col <= this.cols; col++) {
                if (this.gridColElems[col] == undefined) {
                    let lineElem = util.html.createElem('div', '', 'ugrid-line');
                    this.gridColElems.push(lineElem);
                    this.board.append(lineElem);
                }
                let line = this.gridColElems[col];
                line.style.left = `${col * cellWidth}px`;
                line.style.top = `0px`;
                line.style.width = `${this.options.Thickness}px`;
                line.style.height = `${this.height}px`;
            }
        }
        createShadowElems() {
            this.shadowDest = util.html.createElem('div', '', 'ucells-shadow-dest');
            this.shadowDrag = util.html.createElem('div', '', 'ucells-shadow-drag');
            this.board.appendChild(this.shadowDest);
            this.board.appendChild(this.shadowDrag);
        }
        drawDragShadowByXYandDim(x, y, width, height) {
            this.shadowDrag.classList.add('active');
            util.html.setElemPositionAndSize(this.shadowDrag, x, y, width, height);
        }
        getShadowDestCellRect() {
            return this.shadowDestCellRect;
        }
        drawDestShadowByUCellRect(cellRect, isAccepted) {
            let className = isAccepted ? 'ucells-shadow-drag active accepted' : 'ucells-shadow-drag active denied';
            this.shadowDest.className = className;
            this.shadowDestCellRect = util.html.cloneObjectJson(cellRect);
            let cellFirst = this.cells[cellRect.Row][cellRect.Col];
            let cellLast = this.cells[cellRect.Row + cellRect.RowLength - 1][cellRect.Col + cellRect.ColLength - 1];
            let width = cellLast.Rect.X2 - cellFirst.Rect.X1;
            let height = cellLast.Rect.Y2 - cellFirst.Rect.Y1;
            let gap = this.options.Thickness;
            util.html.setElemPositionAndSize(this.shadowDest, cellFirst.Rect.X1 + gap, cellFirst.Rect.Y1 + gap, width - gap, height - gap);
        }
        eraseAllShadows() {
            this.eraseShadow(this.shadowDrag);
            this.eraseShadow(this.shadowDest);
        }
        eraseShadow(shadowElem) {
            if (shadowElem) {
                shadowElem.classList.remove('active');
            }
        }
        getRectFromSortedCells(cells) {
            return {
                X1: cells[0].Rect.X1,
                Y1: cells[0].Rect.Y1,
                X2: cells[cells.length - 1].Rect.X2,
                Y2: cells[cells.length - 1].Rect.Y2,
            };
        }
        getRectByRowColAndXY(rowLength, colLength, xPixel, yPixel) {
            let cells = this.getCellsByRowColAndXY(rowLength, colLength, xPixel, yPixel);
            return this.getRectFromSortedCells(cells);
        }
        getCellsByRowColAndXY(rowLength, colLength, xPixel, yPixel) {
            let cellContainingPoint = this.getCellAt(xPixel, yPixel);
            return this.getCellsByRowCol(cellContainingPoint, rowLength, colLength);
        }
        getCellsByRowCol(cell, rowLength, colLength) {
            let currentRow = cell.Row;
            let currentCol = cell.Col;
            let totalRows = cell.Row + rowLength;
            let totalCols = cell.Col + colLength;
            let cells = [];
            for (let row = currentRow; row < totalRows; row++) {
                for (let col = currentCol; col < totalCols; col++) {
                    if (row >= this.cells.length || col >= this.cells[0].length) {
                        return [];
                    }
                    else {
                        cells.push(this.cells[row][col]);
                    }
                }
            }
            return cells;
        }
        getRectByRowCol(row, col) {
            return this.cells[row][col].Rect;
        }
        getCell(row, col) {
            return this.cells[row][col];
        }
        addIdByUCellRect(id, cellRect) {
            let cells = this.getCellsByURect(cellRect);
            cells[0].Ids.push(id); // cell at 0, is the leader cell
            cells.forEach(cell => { cell.Ids = cells[0].Ids; }); // copy the reference to all cells
            return cells;
        }
        transferIdByUCellRects(id, fromCellRect, toCellRect) {
            this.removeIdByUCellRect(id, fromCellRect);
            this.addIdByUCellRect(id, toCellRect);
        }
        getIdsInUCellRect(cellRect) {
            let cells = this.getCellsByURect(cellRect);
            return this.getIdsInCells(cells);
        }
        getIdsInCells(cells) {
            let ids = [];
            for (let i = 0; i < cells.length; i++) {
                let cell = cells[i];
                if (cell.Ids.length > 0) {
                    cell.Ids.forEach(id => {
                        let idDoesNotExist = ids.indexOf(id) == -1;
                        if (idDoesNotExist) {
                            ids.push(id);
                        }
                    });
                }
            }
            return ids;
        }
        cellsHasAnyId(row, col) {
            if (this.cells[row][col].Ids.length == 0) {
                return false;
            }
            else {
                return true;
            }
        }
        removeId(id) {
            for (let row = 0; row < this.rows; row++) {
                for (let col = 0; col < this.cols; col++) {
                    let cell = this.cells[row][col];
                    cell.Ids = cell.Ids.filter(cellId => cellId != id);
                }
            }
        }
        removeIdByUCellRect(id, cellRect) {
            let cells = this.getCellsByURect(cellRect);
            cells.forEach(cell => {
                cell.Ids = cell.Ids.filter(cellId => cellId != id);
            });
            return cells;
        }
        isValidUCellRect(cellRect) {
            if (cellRect.Row < 0 || cellRect.Col < 0)
                return false;
            if (cellRect.Col + cellRect.ColLength >= this.cols || cellRect.Row + cellRect.RowLength >= this.rows)
                return false;
            return true;
        }
        getRect(row, col, rowLength, colLength) {
            let cell = this.getCell(row, col);
            let cells = this.getCellsByRowCol(cell, rowLength, colLength);
            if (cells.length == 0)
                return null;
            return this.getRectFromSortedCells(cells);
        }
        getCellsByURect(rect) {
            let cell = this.getCell(rect.Row, rect.Col);
            return this.getCellsByRowCol(cell, rect.RowLength, rect.ColLength);
        }
        getCells(row, col, rowLength, colLength) {
            let cell = this.getCell(row, col);
            return this.getCellsByRowCol(cell, rowLength, colLength);
        }
        getSnapCellLeader(x, y, w, h, rowLength, colLength) {
            if (x < 0) {
                x = 0;
            }
            if (y < 0) {
                y = 0;
            }
            let bb = this.board.getBoundingClientRect();
            //console.log(bb.width, bb.height);
            if (x + w >= bb.width) {
                x = bb.width - this.cells[0][0].Size.Width * colLength;
            }
            if (y + h >= bb.height) {
                y = bb.height - this.cells[0][0].Size.Height * rowLength;
            }
            let cell = this.getCellAt(x, y);
            let midX = (cell.Rect.X2 - cell.Rect.X1) / 2 + cell.Rect.X1;
            let midY = (cell.Rect.Y2 - cell.Rect.Y1) / 2 + cell.Rect.Y1;
            if (x > midX && cell.Col < this.cols - 1) {
                cell = this.getCell(cell.Row, cell.Col + 1);
            }
            if (y > midY && cell.Row < this.rows - 1) {
                cell = this.getCell(cell.Row + 1, cell.Col);
            }
            return cell;
        }
        getRowsToFitHeight(elemHeight) {
            let cellHeight = this.cells[0][0].Size.Height;
            let halfCellHeight = cellHeight / 2;
            return Math.floor((elemHeight + halfCellHeight) / cellHeight);
        }
        getColsToFitWidth(elemWidth) {
            let cellWidth = this.cells[0][0].Size.Width;
            let halfCellWidth = cellWidth / 2;
            return Math.floor((elemWidth + halfCellWidth) / cellWidth);
        }
        getCellAt(xPixel, yPixel) {
            for (let row = 0; row < this.rows; row++) {
                for (let col = 0; col < this.cols; col++) {
                    let result = this.isInsideURect(xPixel, yPixel, this.cells[row][col].Rect);
                    if (result) {
                        return this.cells[row][col];
                    }
                }
            }
            throw Error(`getCellAt - Value (${xPixel},${yPixel}) is out of the range of the virtual grid.`);
        }
        // right-bottom boundaries are not inclusive
        isInsideURect(x, y, rect) {
            if (x >= rect.X1 && x < rect.X2 && y >= rect.Y1 && y < rect.Y2) {
                return true;
            }
            else {
                return false;
            }
        }
    }
    udragger.UGrid = UGrid;
})(udragger || (udragger = {}));
//# sourceMappingURL=UGrid.js.map