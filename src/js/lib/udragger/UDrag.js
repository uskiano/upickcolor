"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UDrag = void 0;
const html = require("../../util/html");
const utilid = require("../../util/id");
const ud = require("./UDragger");
class UDrag {
    constructor(state, uselectObject, options) {
        this.uselect = null;
        this.onMouseMoveFunc = e => this.onMouseMove(e);
        this.onMouseUpFunc = e => this.onMouseUp(e);
        this.onFocusFunc = e => this.cancelDrag();
        this.addUSelect(uselectObject);
        this.state = state;
        this.options = options;
        this.instanceId = `udrag-${utilid.newGuid8()}`;
        document.addEventListener('mousemove', this.onMouseMoveFunc, false);
        document.addEventListener('mouseup', this.onMouseUpFunc, false);
        window.addEventListener('focus', e => this.onFocusFunc, false);
        UDrag.instances.push(this);
    }
    destroy() {
        document.removeEventListener('mousemove', this.onMouseMoveFunc, false);
        document.removeEventListener('mouseup', this.onMouseUpFunc, false);
        window.removeEventListener('focus', this.onFocusFunc, false);
    }
    removeElementsListeners(elems) {
        if (this.uselect) {
            elems.forEach(elem => this.uselect.removeListener(elem));
        }
    }
    udrag(elem, options) {
        elem.addEventListener('mousedown', e => this.onMouseDown(e), false);
        if (options && options.DragHandlerSelectors && options.DragHandlerSelectors.length > 0) {
            options.DragHandlerSelectors.forEach(s => elem.querySelector(s).classList.add('udrag-handler'));
        }
    }
    getCurrentUElem() {
        return this.currentUElem;
    }
    onExternalDrag(e) {
        // e.preventDefault();
        // if (this.currentUElem == null) { return; }
        // let bbElem = this.currentUElem.Elem.getBoundingClientRect();
        // let bbBoard = this.state.grid.board.getBoundingClientRect();
        // let midX = bbElem.width/2;
        // let midY = bbElem.height / 2;
        // let offsetX = e.pageX - bbBoard.left;
        // let offsetY = e.pageY - bbBoard.top;
        // this.moveElem(this.currentUElem, offsetX - midX, offsetY - midY);
    }
    startDraggingExternal(externalElem) {
        // this.currentUElem = UDragger.getNewUElement(externalElem);
        // this.state.isDragging = true;
        // this.state.isDragMouseDown = true;
        // this.currentUElem.Elem.classList.add('is-dragging');
    }
    addUSelect(uselectObject) {
        if (uselectObject !== undefined) {
            this.uselect = uselectObject;
        }
    }
    onMouseDown(event) {
        if (event.which != 1) {
            this.cancelDrag();
            return;
        } // exit if click is not a left click
        let currentTarget = event.currentTarget;
        if (currentTarget.id != event.target.id) {
            if (event.target.classList.contains('udrag-handler')) {
                currentTarget = event.target.closest('.udrag'); // allow custom drag handlers
            }
            else {
                return;
            }
        }
        if (!currentTarget.Options.Draggable)
            return;
        this.currentUElem = ud.UDragger.getNewUElement(currentTarget);
        this.pointOrigin = {
            x: event.pageX,
            y: event.pageY
        };
        this.state.isDragging = false;
        this.state.isDragMouseDown = true;
        this.currentUElem.Elem.classList.add('is-mouse-down');
        this.currentUElem.Elem.classList.remove('is-dragging');
        // avoid drag events (they will screw it up the mouseup event)
        event.preventDefault();
    }
    triggerMouseDown(elem, px, py) {
    }
    onMouseMove(event) {
        if (this.state.isResizing || this.state.isSelectingBox) {
            return;
        }
        if (this.state.isDragMouseDown) {
            if (event.buttons == 0) {
                return;
            } // prevents dragging while no buttons pressed
            if (this.state.isDragging) {
                if (!this.pointOrigin) {
                    console.warn(`dragging started with no origin point`);
                }
                this.onDrag(event, this.currentUElem.Elem);
            }
            else {
                this.onDragStart(event);
                this.state.isDragging = true;
                this.currentUElem.Elem.classList.add('is-dragging');
            }
        }
    }
    static cancelDragAllInstances() {
        UDrag.instances.forEach(instance => instance.cancelDrag());
    }
    cancelDrag(log = false) {
        if (log)
            console.log('cancelDrag');
        if (this.currentUElem) {
            this.currentUElem.Elem.classList.remove('is-dragging');
            this.currentUElem.Elem.classList.remove('is-mouse-down');
        }
        this.currentUElem = null;
        this.state.isDragging = false;
        this.state.isDragMouseDown = false;
        if (this.uselect) {
            this.uselect.updateSelectionOrigins();
        }
    }
    log(str) {
        let logDiv = html.toHtml(`<div>${str}</div>`);
        document.querySelector('.left-section').append(logDiv);
    }
    onMouseUp(event) {
        this.state.isDragMouseDown = false;
        if (this.currentUElem)
            this.currentUElem.Elem.classList.remove('is-mouse-down');
        if (this.state.isResizing || this.state.isSelectingBox) {
            return;
        }
        if (this.state.isDragging) {
            this.onDragEnd(event);
            UDrag.cancelDragAllInstances();
        }
    }
    // drag events
    onDragStart(event) {
        if (this.state.events && this.state.events.OnDragStart) {
            this.state.events.OnDragStart(null, event);
        }
        if (this.uselect != null) {
            if (this.uselect.getSelection().length > 1) {
                // multi drag here
                if (this.uselect.isInSelection(this.currentUElem.Elem.id)) {
                    // multi drag here
                }
                else {
                    if (this.currentUElem.Elem.Options.Selectable)
                        this.uselect.selectSingle(this.currentUElem.Elem);
                }
            }
            else {
                if (this.currentUElem.Elem.Options.Selectable)
                    this.uselect.selectSingle(this.currentUElem.Elem);
            }
        }
    }
    onDrag(event, target) {
        let deltaX = event.pageX - this.pointOrigin.x;
        let deltaY = event.pageY - this.pointOrigin.y;
        if (false) { // snap function
            let snap = this.getElemSnap(this.currentUElem, deltaX, deltaY, 24);
            let x = this.currentUElem.PointOrigin.x + deltaX;
            let y = this.currentUElem.PointOrigin.y + deltaY;
            deltaX = deltaX + snap.x - x;
            deltaY = deltaY + snap.y - y;
        }
        let welem = this.currentUElem.Elem;
        if (!welem.Options.Selectable) {
            this.moveCurrElem(deltaX, deltaY);
        }
        else {
            let elems = this.uselect.getSelection(true);
            elems.forEach(selElem => {
                if (selElem.Elem.Options.Draggable)
                    this.moveElem(selElem, deltaX, deltaY);
            });
        }
    }
    snapValue(value, gridSize) {
        let force = 7;
        let reminder = value % gridSize;
        //console.log('reminder', reminder)
        let snap = 0;
        if (reminder >= force && gridSize - reminder >= force)
            return value;
        if (reminder < gridSize / 2) {
            snap = value - reminder;
        }
        else {
            snap = value - reminder + gridSize;
        }
        return snap;
    }
    getConstraintPosition(x, y) {
        if (this.options.DragConstraints.ConstraintX) {
            y = 0;
        }
        if (this.options.DragConstraints.ConstraintY) {
            x = 0;
        }
        if (this.options.DragConstraints.MinDragX !== undefined && x < this.options.DragConstraints.MinDragX) {
            x = this.options.DragConstraints.MinDragX;
        }
        if (this.options.DragConstraints.MinDragY !== undefined && y < this.options.DragConstraints.MinDragY) {
            y = this.options.DragConstraints.MinDragY;
        }
        if (this.options.DragConstraints.MaxDragX !== undefined && x > this.options.DragConstraints.MaxDragX) {
            x = this.options.DragConstraints.MaxDragX;
        }
        if (this.options.DragConstraints.MaxDragY !== undefined && y > this.options.DragConstraints.MaxDragY) {
            y = this.options.DragConstraints.MaxDragY;
        }
        return {
            x: x, y: y
        };
    }
    moveElem(selElem, deltaX, deltaY) {
        let x = selElem.PointOrigin.x + deltaX;
        let y = selElem.PointOrigin.y + deltaY;
        if (this.options && this.options.DragConstraints) {
            let pos = this.getConstraintPosition(x, y);
            x = pos.x;
            y = pos.y;
        }
        this.updatePosition(selElem.Elem, x, y);
        this.notifyOnMoving(selElem.Elem);
    }
    moveCurrElem(deltaX, deltaY) {
        let x = this.currentUElem.DimensionOrigin.left + deltaX;
        let y = this.currentUElem.DimensionOrigin.top + deltaY;
        if (this.options && this.options.DragConstraints) {
            let pos = this.getConstraintPosition(x, y);
            x = pos.x;
            y = pos.y;
        }
        this.updatePosition(this.currentUElem.Elem, x, y);
        this.notifyOnMoving(this.currentUElem.Elem);
    }
    getElemSnap(selElem, deltaX, deltaY, snap) {
        let x = selElem.PointOrigin.x + deltaX;
        let y = selElem.PointOrigin.y + deltaY;
        x = this.snapValue(x, 24);
        y = this.snapValue(y, 24);
        return { x: x, y: y };
    }
    updatePosition(elem, x, y) {
        let widgetElement = elem;
        let gridOptions = widgetElement.Options.GridOptions;
        if (gridOptions) {
            // let bb = elem.getBoundingClientRect();
            // // draw drag shadow
            // this.state.grid.drawDragShadowByXYandDim(x, y, bb.width, bb.height);
            // // draw dest shadow
            // let currRect =  widgetElement.CellRect;
            // let snapCell = this.state.grid.getSnapCellLeader(x, y, bb.width, bb.height, currRect.RowLength, currRect.ColLength);
            // let shadowDestCellRect: UCellRect = {
            //     Row: snapCell.Row,
            //     Col: snapCell.Col,
            //     RowLength: currRect.RowLength,
            //     ColLength: currRect.ColLength
            // };
            // let ids = this.state.grid.getIdsInUCellRect(shadowDestCellRect);
            // let canMove = false; 
            // if (ids.length == 0 || (ids.length == 1 && ids[0] == widgetElement.id)) {
            //     canMove = true;
            // }
            // this.state.grid.drawDestShadowByUCellRect(shadowDestCellRect, canMove);
        }
        else {
            html.setElemPosition(elem, x, y);
        }
    }
    onDragEnd(event) {
        let grid = null; //this.state.grid;
        if (this.state.events && this.state.events.OnDragEnd) {
            this.state.events.OnDragEnd(null, event);
        }
        if (grid) {
            // let widget = this.currentUElem.Elem as UWidgetElement;
            // let newCellRect = html.cloneObjectJson(grid.getShadowDestCellRect()) as UCellRect;
            // if (!newCellRect) { return;}
            // let ids = this.state.grid.getIdsInUCellRect(newCellRect);
            // if (ids.length == 0 || (ids.length == 1 && ids[0] == widget.id)) {
            //     grid.removeId(widget.id);
            //     grid.addIdByUCellRect(widget.id, newCellRect);
            //     widget.CellRect = newCellRect;
            //     let cell = grid.getCell(newCellRect.Row, newCellRect.Col);
            //     let gap = this.state.grid.options.Thickness;
            //     util.html.setElemPosition(widget, cell.Rect.X1 + gap, cell.Rect.Y1 + gap);
            //     widget.classList.add('udrag-smooth');
            // }
            // grid.eraseAllShadows();
        }
        this.notify();
    }
    notify() {
        if (this.state.events) {
            if (this.state.events.OnMoved) {
                let selectedElems = this.uselect.getSelection().map(uelem => uelem.Elem);
                this.state.events.OnMoved(selectedElems);
            }
        }
    }
    notifyOnMoving(elem) {
        if (this.state.events && this.state.events.OnMoving) {
            this.state.events.OnMoving([elem]);
        }
    }
}
exports.UDrag = UDrag;
UDrag.instances = [];
