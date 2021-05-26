import * as types from "../types";


    export function getPoint(mouseEvent: MouseEvent): types.IPoint {
        return {
            x: mouseEvent.clientX,
            y: mouseEvent.clientY
        };
    }

    export function dispatch(elem: HTMLElement,eventType:string, pageX: number, pageY:number, which:number) {
        let ev = new Event(eventType) as any;
        (ev as any).pageX = pageX;
        (ev as any).pageY = pageY;
        (ev as any).which = which;
        Object.defineProperty(ev, 'currentTarget', { value: elem, enumerable: true });
        elem.dispatchEvent(ev);
    }
