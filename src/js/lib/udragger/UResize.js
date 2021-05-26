var udragger;
(function (udragger) {
    let EResizeHandlers;
    (function (EResizeHandlers) {
        EResizeHandlers["se"] = "uresize-se";
        EResizeHandlers["sw"] = "uresize-sw";
        EResizeHandlers["nw"] = "uresize-nw";
        EResizeHandlers["ne"] = "uresize-ne";
        EResizeHandlers["e"] = "uresize-e";
        EResizeHandlers["w"] = "uresize-w";
        EResizeHandlers["n"] = "uresize-n";
        EResizeHandlers["s"] = "uresize-s";
    })(EResizeHandlers || (EResizeHandlers = {}));
    class UResize {
        constructor(state, uselectObject) {
            this.MIN_WIDTH = 10;
            this.MIN_HEIGHT = 10;
            this.uselect = null;
            this.shadowDestCellRect = null;
            this.onMouseDownFunc = e => this.onMouseDown(e);
            this.onMouseMoveFunc = e => this.onMouseMove(e);
            this.onMouseUpFunc = e => this.onMouseUp(e);
            this.onWindowsFocus = e => this.cancelResize();
            this.addUSelect(uselectObject);
            this.state = state;
            document.addEventListener('mousemove', this.onMouseMoveFunc, false);
            document.addEventListener('mouseup', this.onMouseUpFunc, false);
            window.addEventListener('focus', this.onWindowsFocus, false);
        }
        addUSelect(uselectObject) {
            if (uselectObject !== undefined) {
                this.uselect = uselectObject;
            }
        }
        uresize(elem, handlerCount = 8) {
            if (!elem.Options.Resizable)
                return;
            let fragment = document.createDocumentFragment();
            let handlers = [];
            if (handlerCount == 8) {
                handlers = [EResizeHandlers.se, EResizeHandlers.sw, EResizeHandlers.nw, EResizeHandlers.ne,
                    EResizeHandlers.n, EResizeHandlers.w, EResizeHandlers.s, EResizeHandlers.e];
            }
            else if (handlerCount == 1) {
                handlers = [EResizeHandlers.se];
            }
            else if (handlerCount == 0) {
                return;
            }
            let handlerHtmls = handlers.map(handler => this.getHandlerHtml(handler));
            handlerHtmls.forEach(el => fragment.prepend(el));
            elem.classList.add('uresize');
            elem.prepend(fragment);
        }
        getHandlerHtml(resizeHandler) {
            let divHandler = document.createElement('div');
            divHandler.classList.add(resizeHandler);
            divHandler.classList.add('uresize-handler');
            divHandler.dataset.resizeType = resizeHandler;
            divHandler.addEventListener('mousedown', this.onMouseDownFunc, false);
            return divHandler;
        }
        destroy() {
            document.removeEventListener('mousemove', this.onMouseMoveFunc, false);
            document.removeEventListener('mouseup', this.onMouseUpFunc, false);
            window.removeEventListener('focus', this.onWindowsFocus, false);
        }
        destroyElem(elem) {
            let handlers = [];
            [...elem.children].forEach((el) => {
                if (el.classList.contains('uresize-handler')) {
                    handlers.push(el);
                }
            });
            handlers.forEach(element => {
                element.removeEventListener('mousedown', this.onMouseDownFunc, false);
                element.remove();
            });
        }
        onMouseDown(event) {
            if (event.which != 1) {
                this.cancelResize();
                return;
            } // exit if click is not a left click
            if (event.currentTarget != event.target) {
                return;
            } // only mouse down of the currentTarget
            this.currentUElem = udragger.UDragger.getNewUElement(event.currentTarget.parentElement);
            if (this.currentUElem.Elem.classList.contains('uresize')) {
                this.currentHandler = event.target.dataset.resizeType;
            }
            this.currentUElem.PointOrigin = {
                x: event.pageX,
                y: event.pageY
            };
            this.state.isResizing = false;
            this.state.isResizeMouseDown = true;
            this.currentUElem.Elem.classList.remove('is-resizing');
            // avoid drag events (they will screw it up the mouseup event)
            event.preventDefault();
        }
        onMouseMove(event) {
            if (this.state.isDragging || this.state.isSelectingBox) {
                return;
            }
            if (this.state.isResizeMouseDown) {
                if (event.buttons == 0) {
                    this.cancelResize();
                    return;
                } // prevents dragging while no buttons pressed
                if (this.state.isResizing) {
                    this.onResize(event, this.currentHandler, this.currentUElem.Elem);
                }
                else {
                    this.onResizeStart(event, this.currentHandler, this.currentUElem.Elem);
                }
            }
        }
        cancelResize(log = false) {
            if (log) {
                console.log('cancelResize');
            }
            this.state.isResizing = false;
            this.state.isResizeMouseDown = false;
            if (this.currentUElem)
                this.currentUElem.Elem.classList.remove('is-resizing');
            document.body.classList.remove(this.currentHandler);
            if (this.uselect != null) {
                this.uselect.updateSelectionOrigins();
            }
        }
        onMouseUp(event) {
            if (this.state.isDragging || this.state.isSelectingBox) {
                return;
            }
            if (this.state.isResizing) {
                this.cancelResize(false);
                this.onResizeEnd(event);
            }
        }
        // resize events
        onResizeStart(event, handler, elem) {
            this.state.isResizing = true;
            this.currentUElem.Elem.classList.add('is-resizing');
            udragger.UDragger.updateDimensionOrigin(this.currentUElem);
            if (this.uselect != null) {
                this.uselect.getSelection().forEach(uele => {
                    udragger.UDragger.updateDimensionOrigin(uele);
                });
            }
            document.body.classList.add(handler);
        }
        onResize(event, handler, target) {
            let deltaX = event.pageX - this.currentUElem.PointOrigin.x;
            let deltaY = event.pageY - this.currentUElem.PointOrigin.y;
            if (this.uselect != null) {
                let selection = this.uselect.getSelection();
                selection.forEach(uele => {
                    if (uele.Elem.Options.Resizable)
                        this.resizeElem(handler, uele, deltaX, deltaY);
                });
            }
            else {
                this.resizeElem(handler, this.currentUElem, deltaX, deltaY);
            }
        }
        resizeElem(handler, uele, deltaX, deltaY) {
            if (this.state.grid) {
                let shadoowElem = this.state.grid.getShadowDragElem();
                shadoowElem.classList.add('active');
                let shadowUele = this.cloneUElementForShadows(uele, shadoowElem);
                uele = shadowUele;
            }
            if (handler == EResizeHandlers.se) {
                this.resizeS(uele, deltaY);
                this.resizeE(uele, deltaX);
            }
            else if (handler == EResizeHandlers.sw) {
                this.resizeS(uele, deltaY);
                this.resizeW(uele, deltaX);
            }
            else if (handler == EResizeHandlers.nw) {
                this.resizeN(uele, deltaY);
                this.resizeW(uele, deltaX);
            }
            else if (handler == EResizeHandlers.ne) {
                this.resizeE(uele, deltaX);
                this.resizeN(uele, deltaY);
            }
            else if (handler == EResizeHandlers.e) {
                this.resizeE(uele, deltaX);
            }
            else if (handler == EResizeHandlers.w) {
                this.resizeW(uele, deltaX);
            }
            else if (handler == EResizeHandlers.n) {
                this.resizeN(uele, deltaY);
            }
            else if (handler == EResizeHandlers.s) {
                this.resizeS(uele, deltaY);
            }
            if (this.state.grid) {
                // draw dest shadow
                let cellRect = this.getSnapRects(uele, this.currentUElem, handler);
                let ids = this.state.grid.getIdsInUCellRect(cellRect);
                let canMove = false;
                if (ids.length == 0 || (ids.length == 1 && ids[0] == this.currentUElem.Elem.id)) {
                    canMove = true;
                }
                this.state.grid.drawDestShadowByUCellRect(cellRect, canMove);
            }
        }
        getSnapRects(resizingShadowElem, currentElement, handler) {
            let bb = resizingShadowElem.Elem.getBoundingClientRect();
            let cr = currentElement.Elem.CellRect;
            let newCellRect = {};
            if (handler == EResizeHandlers.n || handler == EResizeHandlers.ne || handler == EResizeHandlers.nw) {
                let originalRowBottom = cr.Row + cr.RowLength;
                let newRowLength = this.state.grid.getRowsToFitHeight(bb.height);
                if (newRowLength < 1)
                    newRowLength = 1; // check min size
                if (newRowLength > originalRowBottom)
                    newRowLength = originalRowBottom; // check overflow
                let rowTop = originalRowBottom - newRowLength;
                newCellRect.Row = rowTop;
                newCellRect.RowLength = newRowLength;
            }
            else {
                let originalRowTop = cr.Row;
                let newRowLength = this.state.grid.getRowsToFitHeight(bb.height);
                if (newRowLength < 1)
                    newRowLength = 1; // check min size
                if (originalRowTop + newRowLength >= this.state.grid.options.GridSize.Rows)
                    newRowLength = this.state.grid.options.GridSize.Rows - originalRowTop; // check overflow
                newCellRect.Row = originalRowTop;
                newCellRect.RowLength = newRowLength;
            }
            if (handler == EResizeHandlers.w || handler == EResizeHandlers.sw || handler == EResizeHandlers.nw) {
                let originalColRight = cr.Col + cr.ColLength;
                let newColLength = this.state.grid.getColsToFitWidth(bb.width);
                if (newColLength < 1)
                    newColLength = 1; // check min size
                if (newColLength > originalColRight)
                    newColLength = originalColRight; // check overflow
                let colLeft = originalColRight - newColLength;
                newCellRect.Col = colLeft;
                newCellRect.ColLength = newColLength;
            }
            else {
                let originalColLeft = cr.Col;
                let newColLength = this.state.grid.getColsToFitWidth(bb.width);
                if (newColLength < 1)
                    newColLength = 1; // check min size
                if (originalColLeft + newColLength >= this.state.grid.options.GridSize.Cols)
                    newColLength = this.state.grid.options.GridSize.Cols - originalColLeft; // check overflow
                newCellRect.Col = originalColLeft;
                newCellRect.ColLength = newColLength;
            }
            return newCellRect;
        }
        cloneUElementForShadows(uele, newElem) {
            let boardBB = this.state.container.getBoundingClientRect();
            let bb = uele.Elem.getBoundingClientRect();
            util.html.setElemPositionAndSize(newElem, bb.left - boardBB.left, bb.top - boardBB.top, bb.width, bb.height);
            return {
                DimensionOrigin: {
                    left: uele.DimensionOrigin.left,
                    top: uele.DimensionOrigin.top,
                    width: uele.DimensionOrigin.width,
                    height: uele.DimensionOrigin.height
                },
                PointOrigin: {
                    x: uele.PointOrigin.x,
                    y: uele.PointOrigin.y
                },
                Elem: newElem,
                HasAncestorInSelection: uele.HasAncestorInSelection,
                Options: null
            };
        }
        resizeS(uele, deltaY) {
            uele.Elem.style.height = `${this.getValidatedHeight(uele.DimensionOrigin.height + deltaY)}px`;
        }
        resizeN(uele, deltaY) {
            let height = this.getValidatedHeight(uele.DimensionOrigin.height - deltaY);
            uele.Elem.style.height = `${height}px`;
            if (!uele.HasAncestorInSelection) {
                if (height > this.MIN_HEIGHT) {
                    uele.Elem.style.top = `${uele.DimensionOrigin.top + deltaY}px`;
                }
                else {
                    uele.Elem.style.top = `${uele.DimensionOrigin.top + uele.DimensionOrigin.height - this.MIN_HEIGHT}px`;
                }
            }
        }
        resizeW(uele, deltaX) {
            let width = this.getValidatedWidth(uele.DimensionOrigin.width - deltaX);
            uele.Elem.style.width = `${width}px`;
            if (!uele.HasAncestorInSelection) {
                if (width > this.MIN_WIDTH) {
                    uele.Elem.style.left = `${uele.DimensionOrigin.left + deltaX}px`;
                }
                else {
                    uele.Elem.style.left = `${uele.DimensionOrigin.left + uele.DimensionOrigin.width - this.MIN_WIDTH}px`;
                }
            }
        }
        resizeE(uele, deltaX) {
            uele.Elem.style.width = `${this.getValidatedWidth(uele.DimensionOrigin.width + deltaX)}px`;
        }
        getValidatedHeight(height) {
            if (height < this.MIN_HEIGHT) {
                return this.MIN_HEIGHT;
            }
            else {
                return height;
            }
        }
        getValidatedWidth(width) {
            if (width < this.MIN_WIDTH) {
                return this.MIN_WIDTH;
            }
            else {
                return width;
            }
        }
        onResizeEnd(event) {
            let grid = this.state.grid;
            if (grid) {
                let cellRect = util.html.cloneObjectJson(this.state.grid.getShadowDestCellRect());
                let ids = grid.getIdsInUCellRect(cellRect);
                let canMove = false;
                if (ids.length == 0 || (ids.length == 1 && ids[0] == this.currentUElem.Elem.id)) {
                    canMove = true;
                }
                if (canMove) {
                    let rect = this.state.grid.getRect(cellRect.Row, cellRect.Col, cellRect.RowLength, cellRect.ColLength);
                    let widgetElem = this.currentUElem.Elem;
                    grid.removeId(widgetElem.id);
                    grid.addIdByUCellRect(widgetElem.id, cellRect);
                    widgetElem.CellRect = cellRect;
                    let gap = this.state.grid.options.Thickness;
                    util.html.setElemPositionAndSize(widgetElem, rect.X1 + gap, rect.Y1 + gap, rect.X2 - rect.X1 - gap, rect.Y2 - rect.Y1 - gap);
                }
                this.state.grid.eraseAllShadows();
            }
            //console.log('resize ended..');
            this.notify();
        }
        notify() {
            if (this.state.events) {
                if (this.state.events.OnResized) {
                    let selectedElems = this.uselect.getSelection().map(uelem => uelem.Elem);
                    this.state.events.OnResized(selectedElems);
                }
            }
        }
    }
    udragger.UResize = UResize;
})(udragger || (udragger = {}));
//# sourceMappingURL=UResize.js.map