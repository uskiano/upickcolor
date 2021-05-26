"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dispatch = exports.getPoint = void 0;
function getPoint(mouseEvent) {
    return {
        x: mouseEvent.clientX,
        y: mouseEvent.clientY
    };
}
exports.getPoint = getPoint;
function dispatch(elem, eventType, pageX, pageY, which) {
    let ev = new Event(eventType);
    ev.pageX = pageX;
    ev.pageY = pageY;
    ev.which = which;
    Object.defineProperty(ev, 'currentTarget', { value: elem, enumerable: true });
    elem.dispatchEvent(ev);
}
exports.dispatch = dispatch;
