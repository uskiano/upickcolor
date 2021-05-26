var udragger;
(function (udragger) {
    class USelect {
        constructor(state, board, isResizable, isSelectBox) {
            this.isResizable = isResizable;
            this.selectedElems = [];
            this.onMouseUpFunc = e => this.onMouseUp(e);
            if (isSelectBox) {
                this.selectBox = new udragger.USelectBox(board, `${board.id}-selectbox`, this, state);
            }
            this.state = state;
            this.uresize = new udragger.UResize(this.state, this);
        }
        uselect(elem, options) {
            elem.addEventListener('mouseup', this.onMouseUpFunc, false);
            if (options && options.DragHandlerSelectors && options.DragHandlerSelectors.length > 0) {
                options.DragHandlerSelectors.forEach(s => elem.querySelector(s).classList.add('udrag-handler'));
            }
        }
        destroy() {
            this.selectedElems.forEach(elem => this.uresize.destroyElem(elem.Elem));
            if (this.uresize)
                this.uresize.destroy();
            if (this.selectBox)
                this.selectBox.destroy();
        }
        removeListener(elem) {
            elem.removeEventListener('mouseup', this.onMouseUpFunc, false);
        }
        getSelection(excludeDescendants = false) {
            if (excludeDescendants) {
                return this.selectedElems.filter(p => p.HasAncestorInSelection == false);
            }
            else {
                return this.selectedElems;
            }
        }
        getState() {
            return this.state;
        }
        isInSelection(id) {
            return this.selectedElems.filter(p => p.Elem.id == id).length == 1;
        }
        unselectAll() {
            if (this.isResizable) {
                this.selectedElems.forEach(elem => this.uresize.destroyElem(elem.Elem));
            }
            while (this.selectedElems.length > 0) {
                let oldSelected = this.selectedElems.pop();
                //this.removeListener(oldSelected.Elem);
                oldSelected.Elem.classList.remove('uselected');
            }
        }
        unselect(elem) {
            if (this.isResizable) {
                this.uresize.destroyElem(elem);
            }
            //this.removeListener(elem);
            elem.classList.remove('uselected');
            this.removeElementFromList(elem.id);
        }
        addOrRemove(elems) {
            elems.forEach(elem => {
                let result = this.selectedElems.filter(p => p.Elem.id === elem.id);
                if (result.length == 1) {
                    this.unselect(elem);
                }
                else {
                    this.select(elem);
                }
            });
        }
        removeFromSelection(elems) {
            elems.forEach(elem => {
                this.unselect(elem);
            });
        }
        addToSelection(elems) {
            elems.forEach(elem => {
                this.select(elem);
            });
        }
        removeElementFromList(id) {
            for (var i = 0; i < this.selectedElems.length; i++) {
                if (this.selectedElems[i].Elem.id === id) {
                    this.selectedElems.splice(i, 1);
                    break;
                }
            }
        }
        addResizeHandler(elem) {
            let handlers = elem.querySelectorAll("[class^=uresize]");
            if (handlers.length == 0)
                this.uresize.uresize(elem);
        }
        select(elem, handlerCount = 8) {
            elem.classList.add('uselected');
            this.selectedElems.push(udragger.UDragger.getNewUElement(elem));
            if (this.isResizable) {
                this.uresize.uresize(elem, handlerCount);
            }
        }
        updateSelectionOrigins() {
            this.selectedElems.forEach(uelem => {
                uelem.PointOrigin.x = uelem.Elem.offsetLeft;
                uelem.PointOrigin.y = uelem.Elem.offsetTop;
            });
        }
        // check the nodes that have a parent in selection (for dragging purposes)
        updateHasAncestorInSelection() {
            this.selectedElems.forEach(elem => {
                elem.HasAncestorInSelection = false;
            });
            for (var i = 0; i < this.selectedElems.length; i++) {
                let ancestor = this.selectedElems[i];
                if (ancestor.HasAncestorInSelection) {
                    continue;
                }
                for (var j = 0; j < this.selectedElems.length; j++) {
                    if (i == j) {
                        continue;
                    }
                    let desc = this.selectedElems[j];
                    if (desc.HasAncestorInSelection) {
                        continue;
                    }
                    if (ancestor.Elem.contains(desc.Elem)) {
                        desc.HasAncestorInSelection = true;
                    }
                }
            }
        }
        onSelectionChanged(notify = true) {
            this.updateHasAncestorInSelection();
            //let listSelected = this.selectedElems.map(p => `${p.HasAncestorInSelection ? '-' : ''}${p.Elem.id}`).join(',');
            //console.log(`new selection: ${listSelected}`);
            this.notify();
            //console.log(this.selectedElems[0].Elem, (this.selectedElems[0].Elem as UWidgetElement).CellRect);
        }
        getResizeHandlerCounter(elems) {
            if (elems.length > 500) {
                return 0;
            }
            if (elems.length > 100) {
                return 1;
            }
            return 8;
        }
        selectMany(elems, notify = true) {
            this.unselectAll();
            let handlerCounter = this.getResizeHandlerCounter(elems);
            elems.forEach(elem => {
                this.select(elem, handlerCounter);
            });
            if (notify)
                this.onSelectionChanged();
        }
        selectSingle(elem, notify = true) {
            this.unselectAll();
            this.select(elem);
            this.onSelectionChanged(notify);
        }
        notify() {
            if (this.state.events) {
                if (this.state.events.OnSelected) {
                    let selectedElems = this.getSelection().map(uelem => uelem.Elem);
                    this.state.events.OnSelected(selectedElems);
                }
            }
        }
        onMouseUp(event) {
            if (this.state.isDragging || this.state.isResizing || this.state.isSelectingBox) {
                return;
            }
            //if (event.button != 0) { return;} // only left clicks
            let currentTarget = event.currentTarget;
            if (currentTarget.id != event.target.id) {
                if (event.target.classList.contains('udrag-handler')) {
                    currentTarget = event.target.closest('.udrag'); // allow custom drag handlers
                }
                else {
                    return;
                }
            }
            let elem = currentTarget;
            if (event.currentTarget.id != elem.id) {
                return;
            }
            if (event.ctrlKey == true) {
                let id = elem.id;
                if (this.selectedElems.filter(p => p.Elem.id == id).length == 0) {
                    this.select(elem);
                    this.onSelectionChanged();
                }
                else {
                    this.unselect(elem);
                    this.onSelectionChanged();
                }
            }
            else {
                if (this.selectedElems.length == 0) {
                    this.select(elem);
                    this.onSelectionChanged();
                }
                else { // multiselect
                    if (this.selectedElems.length == 1 && this.selectedElems[0].Elem.id == elem.id) {
                        // selected is the same, no action
                    }
                    else {
                        if (this.selectedElems.length == 1 && event.which != 1 || event.which == 1) {
                            this.unselectAll();
                            this.select(elem);
                            this.onSelectionChanged();
                        }
                        else {
                            // right click in multiselect doesnt have any action
                        }
                    }
                }
            }
        }
    }
    udragger.USelect = USelect;
})(udragger || (udragger = {}));
//# sourceMappingURL=USelect.js.map