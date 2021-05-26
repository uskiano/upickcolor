
import * as html from "../../util/html";
import * as ud from "./UDrag";

    export enum UDraggerEvent {
        OnSelected = 'on_selected',
        OnResized = 'on_resized',
        OnMoved = 'on_moved',
        OnAdded = 'on_added',
        onMoving = 'on_moving',
        OnDragStart = 'on_drag_start',
        OnDragEnd = 'on_drag_start'
    }

    export interface UDragConstraints {
        ConstraintX?: boolean,
        ConstraintY?: boolean,
        MinDragX?: number,
        MinDragY?: number,
        MaxDragX?: number,
        MaxDragY?: number,
    }

    export interface UDraggerOptions{
        Resizable?: boolean,
        Draggable?: boolean,
        Selectable?: boolean,
        SelectBox?: boolean,
        GridOptions?: UGridOptions,
        DragHandlerSelectors?: string[],
        DragConstraints?: UDragConstraints
    }

    export interface UGridSize {
        Rows: number,
        Cols: number
    }

    export interface UCellSize {
        Width: number,
        Height: number
    }

    export interface UGridOptions {
        Fixed?: boolean, // false: the width/height of the cells is constant, true: the width/height of the cells depends on the board width/height
        GridSize: UGridSize, // size given in rows and cols. The size of the elements depends on the container's dimension. Scroll will never happen.
        CellSize?: UCellSize, // size given in pixels, the elements have always the same size regardless the size of the container. Scroll will happen.
        Visible?: boolean,
        Thickness?: number,
        ConstraintPosition?: boolean // user can not add elements that overlap each other
    }

    export interface UElement {
        Elem: HTMLElement,
        PointOrigin: DraggerPoint,
        DimensionOrigin: DraggerRect,
        HasAncestorInSelection: boolean,
        Options?: UDraggerOptions,
    }

    export interface UDraggerState {
        isResizing: boolean,
        isDragging: boolean,
        isSelectingBox: boolean
        isDragMouseDown: boolean,
        isResizeMouseDown: boolean,
        // grid: UGrid,
        events: UDraggerEvents,
        container: HTMLElement
    }

    export interface UDraggerEvents{
        OnAdded: (elems: HTMLElement[] | UWidgetElement[]) => void,
        OnMoved: (elems: HTMLElement[] | UWidgetElement[]) => void,
        OnMoving: (elems: HTMLElement[] | UWidgetElement[]) => void,
        OnResized: (elems: HTMLElement[] | UWidgetElement[]) => void,
        OnSelected: (elems: HTMLElement[] | UWidgetElement[]) => void,
        OnDragStart: (elems: HTMLElement[] | UWidgetElement[], e: MouseEvent) => void,
        OnDragEnd: (elems: HTMLElement[] | UWidgetElement[], e: MouseEvent) => void,
    }

    export interface DraggerPoint {
        x: number,
        y: number
    }

    export interface DraggerRect {
        left: number,
        top: number,
        width: number,
        height: number,
    }

    export interface UCellRect {
        Row: number,
        Col: number,
        RowLength: number,
        ColLength: number
    }

    export class UWidgetElement extends HTMLElement {
        public CellRect: UCellRect;
        public Options: UDraggerOptions;
    }

    export class UDragger {

        private udrag: ud.UDrag;
        private uselect: any; //USelect;

        private defaultOptions: UDraggerOptions = {
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
        }

        private state: UDraggerState = {
            isDragging: false,
            isResizing: false,
            isDragMouseDown: false,
            isSelectingBox: false,
            isResizeMouseDown: false,
            //grid: null,
            events: null,
            container: null
        }

        constructor(public container: HTMLElement, options?: UDraggerOptions) {
            
            this.defaultOptions = { ...this.defaultOptions, ...options };

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

            (window as any).state = this.state;
        }

        public getDefaultOptions(): UDraggerOptions {
            return this.defaultOptions;
        }

        //public addMany(templates: string[]) {
        //    templates.forEach(template => {
        //        this.add(template);
        //    });
        //}

        public destroyElements(elems: HTMLElement[]) {
            if (this.udrag) this.udrag.removeElementsListeners(elems);
        }

        public destroy() {
            if (this.udrag) this.udrag.destroy();
            if (this.uselect) this.uselect.destroy();
        }

        private createWidgetElem(id:string, template: string, options?: UDraggerOptions): UWidgetElement {
            let userOptions = { ...this.defaultOptions, ...options };

            let elem = html.toHtml(template) as HTMLElement;
            let widgetElem = elem as UWidgetElement;
            widgetElem.Options = userOptions;
            widgetElem.id = id;
            elem.classList.add('udrag');
            return widgetElem;
        }

        public onDropExternal(e: MouseEvent) { // Add
            
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

        private notifyOnAdded() {
            if (this.state.events) {
                if (this.state.events.OnAdded) {
                    // let selectedElems = this.uselect.getSelection().map(uelem => uelem.Elem);
                    // this.state.events.OnAdded(selectedElems);
                }
            }
        }

        public startDragExternal(id: string, template: string, rowLength: number, colLength: number, options?: UDraggerOptions) {
            
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

        public cancelDrag() {
            ud.UDrag.cancelDragAllInstances();
        }

        public removeResizeHandlers(elem: HTMLElement) { // this doesnt belong to this class: TODO: relocate!
            let handlers = elem.querySelectorAll("[class^=uresize]");
            handlers.forEach(elem => elem.remove());
        }

        public addResizeHandlers(elem: HTMLElement) {
            // if (this.uselect) this.uselect.addResizeHandler(elem);
        }

        public addElemOnlyHandlers(elem: HTMLElement, options?: UDraggerOptions) {
            let widgetElem = elem as UWidgetElement;
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

        public setDraggerOptions(elem: HTMLElement, options: UDraggerOptions) {
            let uelem = elem as UWidgetElement;
            if (options.Draggable) {
                elem.classList.add('udrag');
            }
            else {
                elem.classList.remove('udrag');
            }
            uelem.Options = options;
        }

        public addElem(elem: HTMLElement, options?: UDraggerOptions): UWidgetElement {

            let userOptions = { ...this.defaultOptions, ...options };

            let widgetElem = elem as UWidgetElement;
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

        public add(id: string, template: string, options?: UDraggerOptions): UWidgetElement {

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

        public addByRowCol(id: string, template: string, row: number, col: number, rowLength: number, colLength: number, options?: UDraggerOptions): UWidgetElement {

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

        public removeById(id: string) {
            let elem = document.getElementById(id);
            elem.parentNode.removeChild(elem);
            // if (this.state.grid) {
            //     let grid = this.state.grid;
            //     grid.removeId(id);
            // }
        }

        public selectMany(elems: HTMLElement[]) {
            // this.uselect.selectMany(elems, false);
            // this.uselect.updateHasAncestorInSelection();
        }

        public select(elem: HTMLElement) {
            // this.uselect.selectMany([elem], false);
        }

        public unselectAll() {
            // this.uselect.unselectAll();
        }

        public selectAll() {
            throw 'not implemented';
        }

        public getSelection(): HTMLElement[] {
            throw 'not implemented';
            // return this.uselect.getSelection().map(item => item.Elem);
        }

        public getSelectionUElement(): UElement[] {
            throw 'not implemented';
            // return this.uselect.getSelection();
        }


        public addEventListener(event: UDraggerEvent, callback: (elems: HTMLElement[] | UWidgetElement[], e?: MouseEvent) => void) {
            if (!this.state.events) { this.createEventsObject(); }
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

        public createEventsObject() {
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

        public validateContainer(container: HTMLElement) {
            if (container.id == undefined || container.id == null || container.id == '') {
                throw Error(`UDragger.validateContainer: container element must have an id`);
            }
        }

        public static getNewUElement(elem: HTMLElement): UElement {
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

        public static updateDimensionOrigin(uelem: UElement) {
            let elem = uelem.Elem;
            uelem.DimensionOrigin = {
                width: elem.offsetWidth,
                height: elem.offsetHeight,
                left: elem.offsetLeft,
                top: elem.offsetTop
            }
        }

 

    }


