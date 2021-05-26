import * as types from "../types";
import * as utilid from "./id";

    export interface IDataset {
        Name: string,
        Value: string
    }

    export interface IAttribute {
        Name: string,
        Value: string
    }

    export interface IHtmlProperties {
        Id?: string,
        Name?: string,
        Classes?: string,
        Attributes?: IAttribute[],
        Datasets?: IDataset[],
        AutoId?: boolean
    }

    export function getHtmlAttributes(props: IHtmlProperties, extraClass: string = ''): string {
        return `${getIdAttribute(props.Id, props.AutoId)}${getClassAttribute([props.Classes, extraClass].join(' '))}${getAttributes(props.Attributes)}${getDatasets(props.Datasets)}`;
    }

    export function getClassAttribute(classes: string) {
        if (!classes) {
            return '';
        }
        else {
            return `${' '}class='${classes}'`;
        }
    }

    export function getIdAttribute(id: string, autoId: boolean): string {
        if (id) {
            return `${' '}id='${id}'`;
        }
        if (autoId) {
            return `${' '}id='id-${utilid.newGuid()}'`;
        }
        return '';
    }

    export function getAttributes(attributes: IAttribute[]) {
        if (!attributes) { return '' };
        return attributes.map(attr => getAttribute(attr.Name, attr.Value)).join(' ');
    }

    export function getAttribute(name: string, value: string): string {
        return `${' '}${name}='${value}'`;
    }

    export function getDatasets(datasets: IDataset[]) {
        if (!datasets) { return '' };
        return datasets.map(dataset => getDataset(dataset.Name, dataset.Value)).join(' ');
    }

    export function getDataset(name: string, value: string): string {
        return `${' '}data-${name}='${value}'`;
    }

    export function toHtml(value: string): HTMLDivElement {
        var div = document.createElement('div');
        div.innerHTML = value.replace(/(\r\n|\n|\r)/gm, "").trim();
        return div.firstElementChild as HTMLDivElement;
    }
    export function toHtmlMany(value: string): HTMLElement[] {
        var div = document.createElement('div');
        div.innerHTML = value.replace(/(\r\n|\n|\r)/gm, "").trim();
        return [...div.children] as HTMLElement[];
    }

    export function toHtmlWrapper(value: string, wrapperElem:string='div'): HTMLElement { // returns wrapper unless there is only one children
        var wrapper = document.createElement(wrapperElem);
        wrapper.innerHTML = value.replace(/(\r\n|\n|\r)/gm, "").trim();
        if (wrapper.children.length == 1) {
            return wrapper.firstElementChild as HTMLElement;
        }
        else {
            return wrapper;
        }
    } 

    export function createElem(tag: string, id: string = '', classes: string = ''): HTMLElement {
        let div = document.createElement(tag);
        if (id) {
            div.id = id;
        }
        if (classes.trim() !== '') {
            classes.trim().split(' ').forEach(className => {
                div.classList.add(className);
            });
        }
        return div;
    }

    export function setElemPosition(elem: HTMLElement, left: number, top: number) {
        elem.style.left = `${left}px`;
        elem.style.top = `${top}px`;
    }

    export function setElemPositionAndSize(elem: HTMLElement, left: number, top: number, width:number, height: number) {
        elem.style.left = `${left}px`;
        elem.style.top = `${top}px`;
        elem.style.width = `${width}px`;
        elem.style.height = `${height}px`;
    }

    export function setElemSize(elem: HTMLElement, width: number, height: number) {
        elem.style.width = `${width}px`;
        elem.style.height = `${height}px`;
    }

    export function cloneObjectJson(obj: Object): Object {
        return JSON.parse(JSON.stringify(obj));
    }

    export function getRelativeParentPos(elem: HTMLElement): { x: number, y: number } {
        let parentBB = elem.getBoundingClientRect();
        let bb = elem.getBoundingClientRect();
        return {
            x: bb.x - parentBB.x,
            y: bb.y - parentBB.y
        }
    }

    export function toParentRelativePos(elem: HTMLElement, x: number, y: number): { x: number, y: number } {
        let bbParent = elem.parentElement.getBoundingClientRect();
        return {
            x: x - bbParent.x,
            y: y - bbParent.y
        }
    }

    export function removeClassStartsWith(elem: HTMLElement, startsWith: string) {
        for (let i = 0; i < elem.classList.length; i++) {
            const className = elem.classList[i];
            if ((className as any).startsWith(startsWith)) {
                elem.classList.remove(className);
            }
        }
    }

    export function addClassesTo(classList: string, elem: HTMLElement) {
        if (classList) {
            let classes = classList.split(' ');
            classes.forEach(c => elem.classList.add(c));
        }
    }

    export function elemToRectRelativeParent(elem: HTMLElement): types.IRect {
        let bb = elem.getBoundingClientRect();
        let bbParent = elem.parentElement.getBoundingClientRect();
        return {
            x: bb.left - bbParent.x,
            y: bb.top - bbParent.y,
            w: bb.width,
            h: bb.height
        };
    }

    export function elemToRect(elem: HTMLElement): types.IRect {
        let bb = elem.getBoundingClientRect();
        return {
            x: bb.left,
            y: bb.top,
            w: bb.width,
            h: bb.height
        };
    }
