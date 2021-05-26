"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UDragger = exports.UWidgetElement = exports.UDraggerEvent = void 0;
const html = require("../../util/html");
const ud = require("./UDrag");
var UDraggerEvent;
(function (UDraggerEvent) {
    UDraggerEvent["OnSelected"] = "on_selected";
    UDraggerEvent["OnResized"] = "on_resized";
    UDraggerEvent["OnMoved"] = "on_moved";
    UDraggerEvent["OnAdded"] = "on_added";
    UDraggerEvent["onMoving"] = "on_moving";
    UDraggerEvent["OnDragStart"] = "on_drag_start";
    UDraggerEvent["OnDragEnd"] = "on_drag_start";
})(UDraggerEvent = exports.UDraggerEvent || (exports.UDraggerEvent = {}));
class UWidgetElement extends HTMLElement {
}
exports.UWidgetElement = UWidgetElement;
class UDragger {
    constructor(container, options) {
        this.container = container;
        this.defaultOptions = {
            Draggable: true,
            Resizable: true,
            Selectable: true,
            SelectBox: true,
            GridOptions: {
                Fixed: false,
                Visible: true,
                GridSize: {
                    Rows: 18,
                    Cols: 24
                },
                CellSize: {
                    Height: 120,
                    Width: 120
                },
                Thickness: 5,
                ConstraintPosition: true
            }
        };
        this.state = {
            isDragging: false,
            isResizing: false,
            isDragMouseDown: false,
            isSelectingBox: false,
            isResizeMouseDown: false,
            //grid: null,
            events: null,
            container: null
        };
        this.defaultOptions = Object.assign(Object.assign({}, this.defaultOptions), options);
        this.state.container = container;
        this.validateContainer(container);
        // this.uselect = new USelect(this.state, container, this.defaultOptions.Resizable, this.defaultOptions.SelectBox);
        this.udrag = new ud.UDrag(this.state, this.uselect, this.defaultOptions);
        if (this.defaultOptions.GridOptions) {
            // this.state.grid = new UGrid(container, this.defaultOptions.GridOptions);
            this.container.ondragover = e => this.udrag.onExternalDrag(e);
            this.container.ondrop = e => this.onDropExternal(e);
            document.ondragend = e => { ud.UDrag.cancelDragAllInstances(); };
        }
        container.onmouseenter = e => container.classList.add('active');
        container.onmouseleave = e => container.classList.remove('active');
        window.state = this.state;
    }
    getDefaultOptions() {
        return this.defaultOptions;
    }
    //public addMany(templates: string[]) {
    //    templates.forEach(template => {
    //        this.add(template);
    //    });
    //}
    destroyElements(elems) {
        if (this.udrag)
            this.udrag.removeElementsListeners(elems);
    }
    destroy() {
        if (this.udrag)
            this.udrag.destroy();
        if (this.uselect)
            this.uselect.destroy();
    }
    createWidgetElem(id, template, options) {
        let userOptions = Object.assign(Object.assign({}, this.defaultOptions), options);
        let elem = html.toHtml(template);
        let widgetElem = elem;
        widgetElem.Options = userOptions;
        widgetElem.id = id;
        elem.classList.add('udrag');
        return widgetElem;
    }
    onDropExternal(e) {
        // let uelem = this.udrag.getCurrentUElem();
        // if (!uelem) { return;}
        // let widgetElem = uelem.Elem as UWidgetElement;
        // let cr = html.cloneObjectJson(this.state.grid.getShadowDestCellRect()) as UCellRect;
        // let ids = this.state.grid.getIdsInUCellRect(cr);
        // if (ids.length == 0 || (ids.length == 1 && ids[0] == widgetElem.id)) {
        //     this.state.grid.addIdByUCellRect(widgetElem.id, cr);
        //     let rect = this.state.grid.getRect(cr.Row, cr.Col, cr.RowLength, cr.ColLength);
        //     let gap = this.state.grid.options.Thickness;
        //     html.setElemPositionAndSize(widgetElem, rect.X1 + gap, rect.Y1 + gap, rect.X2 - rect.X1 - gap, rect.Y2 - rect.Y1 - gap);
        //     widgetElem.style.visibility = 'visible';
        //     widgetElem.CellRect = cr;
        //     if (this.defaultOptions.Draggable) {
        //         this.udrag.udrag(widgetElem, widgetElem.Options);
        //     }
        //     if (this.defaultOptions.Selectable) {
        //         this.uselect.uselect(widgetElem, widgetElem.Options);
        //     }
        //     this.uselect.selectSingle(uelem.Elem, false);
        //     this.notifyOnAdded();
        // }
    }
    notifyOnAdded() {
        if (this.state.events) {
            if (this.state.events.OnAdded) {
                // let selectedElems = this.uselect.getSelection().map(uelem => uelem.Elem);
                // this.state.events.OnAdded(selectedElems);
            }
        }
    }
    startDragExternal(id, template, rowLength, colLength, options) {
        // let widgetElem = this.createWidgetElem(id, template, options);
        // widgetElem.style.visibility = 'hidden';
        // widgetElem.CellRect = {
        //     Row: -1, // not assigned row yet
        //     Col: -1, // not assigned col yet
        //     RowLength: rowLength,
        //     ColLength: colLength
        // };
        // let rect = this.state.grid.getRect(0, 0, rowLength, colLength);
        // if (rect == null) {
        //     UDrag.cancelDragAllInstances();
        //     return;
        // }
        // html.setElemSize(widgetElem, rect.X2 - rect.X1, rect.Y2 - rect.Y1);
        // this.udrag.startDraggingExternal(widgetElem);
        // this.container.appendChild(widgetElem);
    }
    cancelDrag() {
        ud.UDrag.cancelDragAllInstances();
    }
    removeResizeHandlers(elem) {
        let handlers = elem.querySelectorAll("[class^=uresize]");
        handlers.forEach(elem => elem.remove());
    }
    addResizeHandlers(elem) {
        // if (this.uselect) this.uselect.addResizeHandler(elem);
    }
    addElemOnlyHandlers(elem, options) {
        let widgetElem = elem;
        if (options)
            widgetElem.Options = options;
        else
            widgetElem.Options = this.defaultOptions;
        elem.classList.add('udrag');
        if (widgetElem.Options.Draggable) {
            elem.classList.remove('drag-disabled');
            this.udrag.udrag(widgetElem, widgetElem.Options);
        }
        else {
            elem.classList.add('drag-disabled');
        }
        if (widgetElem.Options.Resizable) {
            elem.classList.remove('resize-disabled');
        }
        else {
            elem.classList.add('resize-disabled');
        }
        if (widgetElem.Options.Selectable) {
            // this.uselect.uselect(widgetElem, widgetElem.Options);
        }
    }
    setDraggerOptions(elem, options) {
        let uelem = elem;
        if (options.Draggable) {
            elem.classList.add('udrag');
        }
        else {
            elem.classList.remove('udrag');
        }
        uelem.Options = options;
    }
    addElem(elem, options) {
        let userOptions = Object.assign(Object.assign({}, this.defaultOptions), options);
        let widgetElem = elem;
        widgetElem.Options = userOptions;
        widgetElem.id = elem.id;
        elem.classList.add('udrag');
        this.container.appendChild(widgetElem);
        if (this.defaultOptions.Draggable) {
            this.udrag.udrag(widgetElem, options);
        }
        if (this.defaultOptions.Selectable) {
            // this.uselect.uselect(widgetElem, options);
        }
        return widgetElem;
    }
    add(id, template, options) {
        let widgetElem = this.createWidgetElem(id, template, options);
        this.container.appendChild(widgetElem);
        if (this.defaultOptions.Draggable) {
            this.udrag.udrag(widgetElem, options);
        }
        if (this.defaultOptions.Selectable) {
            // this.uselect.uselect(widgetElem, options);
        }
        return widgetElem;
    }
    addByRowCol(id, template, row, col, rowLength, colLength, options) {
        let widgetElem = this.createWidgetElem(id, template, options);
        widgetElem.CellRect = {
            Row: row,
            Col: col,
            RowLength: rowLength,
            ColLength: colLength
        };
        // if (this.state.grid != null) {
        //     let rect = this.state.grid.getRect(row, col, rowLength, colLength);
        //     this.state.grid.addIdByUCellRect(widgetElem.id, widgetElem.CellRect);
        //     let gap = this.state.grid.options.Thickness;
        //     html.setElemPositionAndSize(widgetElem, rect.X1 + gap, rect.Y1 + gap, rect.X2 - rect.X1 - gap, rect.Y2 - rect.Y1 - gap);
        // }
        this.container.appendChild(widgetElem);
        if (this.defaultOptions.Draggable) {
            this.udrag.udrag(widgetElem, options);
        }
        if (this.defaultOptions.Selectable) {
            // this.uselect.uselect(widgetElem, options);
        }
        return widgetElem;
    }
    removeById(id) {
        let elem = document.getElementById(id);
        elem.parentNode.removeChild(elem);
        // if (this.state.grid) {
        //     let grid = this.state.grid;
        //     grid.removeId(id);
        // }
    }
    selectMany(elems) {
        // this.uselect.selectMany(elems, false);
        // this.uselect.updateHasAncestorInSelection();
    }
    select(elem) {
        // this.uselect.selectMany([elem], false);
    }
    unselectAll() {
        // this.uselect.unselectAll();
    }
    selectAll() {
        throw 'not implemented';
    }
    getSelection() {
        throw 'not implemented';
        // return this.uselect.getSelection().map(item => item.Elem);
    }
    getSelectionUElement() {
        throw 'not implemented';
        // return this.uselect.getSelection();
    }
    addEventListener(event, callback) {
        if (!this.state.events) {
            this.createEventsObject();
        }
        switch (event) {
            case UDraggerEvent.OnAdded:
                this.state.events.OnAdded = callback;
                break;
            case UDraggerEvent.OnMoved:
                this.state.events.OnMoved = callback;
                break;
            case UDraggerEvent.OnResized:
                this.state.events.OnResized = callback;
                break;
            case UDraggerEvent.OnSelected:
                this.state.events.OnSelected = callback;
                break;
            case UDraggerEvent.onMoving:
                this.state.events.OnMoving = callback;
                break;
            case UDraggerEvent.OnDragStart:
                this.state.events.OnDragStart = callback;
                break;
            case UDraggerEvent.OnDragEnd:
                this.state.events.OnDragEnd = callback;
                break;
            default: throw Error(`UDragger.addEventListener: event: ${event} is not a valid option`);
        }
    }
    createEventsObject() {
        this.state.events = {
            OnAdded: null,
            OnMoved: null,
            OnResized: null,
            OnSelected: null,
            OnMoving: null,
            OnDragStart: null,
            OnDragEnd: null
        };
    }
    validateContainer(container) {
        if (container.id == undefined || container.id == null || container.id == '') {
            throw Error(`UDragger.validateContainer: container element must have an id`);
        }
    }
    static getNewUElement(elem) {
        return {
            Elem: elem,
            PointOrigin: {
                x: elem.offsetLeft,
                y: elem.offsetTop
            },
            DimensionOrigin: {
                width: elem.offsetWidth,
                height: elem.offsetHeight,
                left: elem.offsetLeft,
                top: elem.offsetTop
            },
            HasAncestorInSelection: false
        };
    }
    static updateDimensionOrigin(uelem) {
        let elem = uelem.Elem;
        uelem.DimensionOrigin = {
            width: elem.offsetWidth,
            height: elem.offsetHeight,
            left: elem.offsetLeft,
            top: elem.offsetTop
        };
    }
}
exports.UDragger = UDragger;
