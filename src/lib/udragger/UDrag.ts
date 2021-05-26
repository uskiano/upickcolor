import * as html from "../../util/html";
import * as utilid from "../../util/id";
import * as ud from "./UDragger";
    
    export class UDrag {

        public static instances: UDrag[] = [];

        private currentUElem: ud.UElement;
        private pointOrigin: ud.DraggerPoint;

        private uselect: any = null;
        private options: ud.UDraggerOptions
        private state: ud.UDraggerState;
        private instanceId: string;
        private onMouseMoveFunc = e => this.onMouseMove(e);
        private onMouseUpFunc = e => this.onMouseUp(e);
        private onFocusFunc = e => this.cancelDrag();


        constructor(state: ud.UDraggerState, uselectObject?: any, options?: ud.UDraggerOptions ) {
            this.addUSelect(uselectObject);
            this.state = state;
            this.options = options;
            this.instanceId = `udrag-${utilid.newGuid8()}`;
            
            document.addEventListener('mousemove', this.onMouseMoveFunc, false);
            document.addEventListener('mouseup', this.onMouseUpFunc, false);
            window.addEventListener('focus', e => this.onFocusFunc, false);
            UDrag.instances.push(this);
        }

        public destroy() {
            document.removeEventListener('mousemove', this.onMouseMoveFunc, false);
            document.removeEventListener('mouseup', this.onMouseUpFunc, false);
            window.removeEventListener('focus', this.onFocusFunc, false);
        }

        public removeElementsListeners(elems: HTMLElement[]) {
            if (this.uselect) {
                elems.forEach(elem => this.uselect.removeListener(elem));
            }
        }

        public udrag(elem: HTMLElement, options?: ud.UDraggerOptions) {
            elem.addEventListener('mousedown', e => this.onMouseDown(e), false);
            
            if (options && options.DragHandlerSelectors && options.DragHandlerSelectors.length > 0) {
                options.DragHandlerSelectors.forEach(s => elem.querySelector(s).classList.add('udrag-handler'));
            }
        }

        public getCurrentUElem() {
            return this.currentUElem;
        }

        public onExternalDrag(e: MouseEvent) {
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

        public startDraggingExternal(externalElem: any) {
            // this.currentUElem = UDragger.getNewUElement(externalElem);
            
            // this.state.isDragging = true;
            // this.state.isDragMouseDown = true;
            // this.currentUElem.Elem.classList.add('is-dragging');
        }

        public addUSelect(uselectObject: any) {
            if (uselectObject !== undefined) {
                this.uselect = uselectObject;
            }
        }

        private onMouseDown(event: MouseEvent) {
            if (event.which != 1) { this.cancelDrag(); return; } // exit if click is not a left click
            let currentTarget = (event.currentTarget as HTMLElement);
            if (currentTarget.id != (event.target as any).id) {
                if ((event.target as HTMLElement).classList.contains('udrag-handler')) {
                    currentTarget = (event.target as HTMLElement).closest('.udrag'); // allow custom drag handlers
                }
                else { return; }
            }
            
            if (!(currentTarget as any).Options.Draggable) return;

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

        private triggerMouseDown(elem: HTMLElement, px: number, py: number) {
            
        }

        private onMouseMove(event: MouseEvent) {
            if (this.state.isResizing || this.state.isSelectingBox) { return; }
            
            if (this.state.isDragMouseDown) {
                if (event.buttons == 0) { return; } // prevents dragging while no buttons pressed
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

        public static cancelDragAllInstances() {
            UDrag.instances.forEach(instance => instance.cancelDrag());
        }

        public cancelDrag(log:boolean=false) {
            if (log) console.log('cancelDrag');
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

        private log(str: string) { //TODO: remove, its only for debugging
            let logDiv = html.toHtml(`<div>${str}</div>`);
            document.querySelector('.left-section').append(logDiv);
        }

        private onMouseUp(event: MouseEvent) {
            this.state.isDragMouseDown = false;
            if (this.currentUElem)this.currentUElem.Elem.classList.remove('is-mouse-down');
            if (this.state.isResizing || this.state.isSelectingBox) { return; }

            if (this.state.isDragging) {
                this.onDragEnd(event);
                UDrag.cancelDragAllInstances();
            }
        }

        // drag events
        private onDragStart(event: MouseEvent) {

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
                        if ((this.currentUElem.Elem as any).Options.Selectable) this.uselect.selectSingle(this.currentUElem.Elem);
                    }
                }
                else {
                    if ((this.currentUElem.Elem as any).Options.Selectable) this.uselect.selectSingle(this.currentUElem.Elem);
                }
            }

        }

        private onDrag(event: MouseEvent, target: HTMLElement) {
            let deltaX = event.pageX - this.pointOrigin.x;
            let deltaY = event.pageY - this.pointOrigin.y;
            
            if (false) { // snap function
                let snap = this.getElemSnap(this.currentUElem, deltaX, deltaY, 24);
                let x = this.currentUElem.PointOrigin.x + deltaX;
                let y = this.currentUElem.PointOrigin.y + deltaY;
                deltaX = deltaX + snap.x - x;
                deltaY = deltaY + snap.y - y;
            }
            let welem = (this.currentUElem.Elem as any);
            if (!welem.Options.Selectable) {
                this.moveCurrElem(deltaX, deltaY);
            }
            else {
                let elems = this.uselect.getSelection(true);
                elems.forEach(selElem => {
                    if ((selElem.Elem as any).Options.Draggable) this.moveElem(selElem, deltaX, deltaY);
                });
            }
        }

        private snapValue(value: number, gridSize: number) {
            
            let force = 7;
            let reminder = value % gridSize;
            //console.log('reminder', reminder)
            let snap = 0;
            if (reminder >= force && gridSize - reminder >= force) return value;
            

            if (reminder < gridSize / 2) {
                snap = value - reminder;
            }
            else {
                snap = value - reminder + gridSize;
            }
            return snap;
        }

        private getConstraintPosition(x: number, y: number): {x:number, y:number} {
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
            }
        }

        private moveElem(selElem: ud.UElement, deltaX: number, deltaY: number) {
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

        private moveCurrElem(deltaX: number, deltaY: number) {
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

        private getElemSnap(selElem: ud.UElement, deltaX: number, deltaY: number, snap: number): {x:number, y: number} {
            let x = selElem.PointOrigin.x + deltaX;
            let y = selElem.PointOrigin.y + deltaY;
            x = this.snapValue(x, 24);
            y = this.snapValue(y, 24);
            return { x: x, y: y };
        }


        private updatePosition(elem: HTMLElement, x: number, y: number) {
            
            let widgetElement = elem as ud.UWidgetElement;
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
            else
            {
                html.setElemPosition(elem, x, y);
            }
        }

        private onDragEnd(event: MouseEvent) {
            
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

        private notify() {
            if (this.state.events) {
                if (this.state.events.OnMoved) {
                    let selectedElems = this.uselect.getSelection().map(uelem => uelem.Elem);
                    this.state.events.OnMoved(selectedElems);
                }
            }
        }

        private notifyOnMoving(elem: HTMLElement) {
            if (this.state.events && this.state.events.OnMoving) {
                this.state.events.OnMoving([elem]);
            }
        }

    }

