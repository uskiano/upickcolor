var udragger;
(function (udragger) {
    class USelectBox {
        constructor(board, selectionBoxId, uselect, state) {
            this.addOrRemoveActive = false;
            this.onBoardMouseDownFunc = e => this.onBoardMouseDown(e);
            this.onDocumentMouseMoveFunc = e => this.onDocumentMouseMove(e);
            this.onDocumentMouseUpFunc = e => this.onDocumentMouseUp(e);
            this.selectBoxRect = this.getSelectBoxRect(0, 0, 0, 0);
            this.board = board;
            this.uselect = uselect;
            this.state = state;
            this.createSelectionBoxDiv(selectionBoxId);
            this.setupHandlers();
        }
        createSelectionBoxDiv(selectionBoxId) {
            this.selectionBox = document.createElement('div');
            this.selectionBox.id = selectionBoxId;
            this.selectionBox.classList.add('selection-box');
            this.board.appendChild(this.selectionBox);
        }
        updateSelectionBox() {
            let x1 = Math.min(this.selectBoxRect.left, this.selectBoxRect.right);
            let x2 = Math.max(this.selectBoxRect.left, this.selectBoxRect.right);
            let y1 = Math.min(this.selectBoxRect.top, this.selectBoxRect.bottom);
            let y2 = Math.max(this.selectBoxRect.top, this.selectBoxRect.bottom);
            this.selectionBox.style.left = `${x1}px`;
            this.selectionBox.style.top = `${y1}px`;
            this.selectionBox.style.width = `${x2 - x1}px`;
            this.selectionBox.style.height = `${y2 - y1}px`;
        }
        setupHandlers() {
            this.board.addEventListener('mousedown', this.onBoardMouseDownFunc);
            document.addEventListener('mousemove', this.onDocumentMouseMoveFunc, false);
            document.addEventListener('mouseup', this.onDocumentMouseUpFunc, false);
        }
        destroy() {
            this.board.removeEventListener('mousedown', this.onBoardMouseDownFunc);
            document.removeEventListener('mousemove', this.onDocumentMouseMoveFunc, false);
            document.removeEventListener('mouseup', this.onDocumentMouseUpFunc, false);
        }
        onBoardMouseDown(e) {
            if (this.state.isResizing || this.state.isDragging) {
                return;
            }
            if (e.button != 0) {
                return;
            } // only left click
            if (e.target.id == this.board.id) {
                if (e.shiftKey == true) {
                    this.addOrRemoveActive = true;
                }
                this.selectionBox.classList.add('active');
                let boardBox = this.board.getBoundingClientRect();
                this.selectBoxRect.left = e.pageX + this.board.scrollLeft - boardBox.x;
                this.selectBoxRect.top = e.pageY + this.board.scrollTop - boardBox.y;
                this.selectBoxRect.right = e.pageX + this.board.scrollLeft - boardBox.x;
                this.selectBoxRect.bottom = e.pageY + this.board.scrollTop - boardBox.y;
                this.updateSelectionBox();
                this.state.isSelectingBox = true;
                e.preventDefault();
            }
        }
        onDocumentMouseMove(e) {
            if (this.state.isResizing || this.state.isDragging) {
                return;
            }
            if (!this.state.isSelectingBox) {
                return;
            }
            let boardBox = this.board.getBoundingClientRect();
            this.selectBoxRect.right = e.pageX + this.board.scrollLeft - boardBox.x;
            this.selectBoxRect.bottom = e.pageY + this.board.scrollTop - boardBox.y;
            this.updateSelectionBox();
        }
        onDocumentMouseUp(e) {
            if (this.state.isResizing || this.state.isDragging) {
                return;
            }
            if (e.button != 0) {
                return;
            } // only left click
            if (this.state.isSelectingBox) {
                if (this.selectionHasValidDimension()) {
                    //let elems = Array.prototype.slice.call(document.querySelectorAll('.udrag')); // TODO: can be optimized 
                    let elems = [];
                    document.querySelectorAll('.udrag').forEach(elem => elems.push(elem));
                    let filteredSelection = this.getSelectedInsideSelectionBox(elems);
                    //console.log(`found ${filteredSelection.length} selected items in selected box`);
                    if (this.addOrRemoveActive) {
                        this.uselect.addOrRemove(filteredSelection);
                        this.uselect.updateHasAncestorInSelection();
                    }
                    else {
                        this.uselect.selectMany(filteredSelection);
                    }
                }
                else {
                    if (e.target.id == this.board.id)
                        this.unselectAllAndNotify();
                }
            }
            else {
                if (e.target.id == this.board.id)
                    this.unselectAllAndNotify();
            }
            this.state.isSelectingBox = false;
            this.finishSelectionBox();
        }
        unselectAllAndNotify() {
            this.uselect.unselectAll();
            if (this.state.events) {
                if (this.state.events.OnSelected) {
                    this.state.events.OnSelected([]);
                }
            }
        }
        getSelectedInsideSelectionBox(elems) {
            let elementsInsideBox = [];
            let divSelectionBox = this.getSelectBoxRectForElem(this.selectionBox);
            elems.forEach(elem => {
                let elemRect = this.getSelectBoxRectForElem(elem);
                let isIntersected = this.intersectRect(divSelectionBox, elemRect);
                if (isIntersected) {
                    elementsInsideBox.push(elem);
                }
            });
            return elementsInsideBox;
        }
        getSelectBoxRectForElem(elem) {
            let boundingRect = elem.getBoundingClientRect();
            return {
                left: boundingRect.left,
                right: boundingRect.right,
                top: boundingRect.top,
                bottom: boundingRect.bottom
            };
        }
        intersectRect(r1, r2) {
            return !(r2.left > r1.right ||
                r2.right < r1.left ||
                r2.top > r1.bottom ||
                r2.bottom < r1.top);
        }
        finishSelectionBox() {
            this.selectionBox.classList.remove('active');
            this.addOrRemoveActive = false;
        }
        selectionHasValidDimension() {
            if (this.selectionBox.clientWidth > 3 && this.selectionBox.clientHeight > 3) {
                return true;
            }
            else {
                return false;
            }
        }
        getSelectBoxRect(left, right, top, bottom) {
            return {
                left: left,
                top: top,
                right: right,
                bottom: bottom
            };
        }
    }
    udragger.USelectBox = USelectBox;
})(udragger || (udragger = {}));
//# sourceMappingURL=USelectBox.js.map