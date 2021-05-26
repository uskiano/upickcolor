"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.elemToRect = exports.elemToRectRelativeParent = exports.addClassesTo = exports.removeClassStartsWith = exports.toParentRelativePos = exports.getRelativeParentPos = exports.cloneObjectJson = exports.setElemSize = exports.setElemPositionAndSize = exports.setElemPosition = exports.createElem = exports.toHtmlWrapper = exports.toHtmlMany = exports.toHtml = exports.getDataset = exports.getDatasets = exports.getAttribute = exports.getAttributes = exports.getIdAttribute = exports.getClassAttribute = exports.getHtmlAttributes = void 0;
const utilid = require("./id");
function getHtmlAttributes(props, extraClass = '') {
    return `${getIdAttribute(props.Id, props.AutoId)}${getClassAttribute([props.Classes, extraClass].join(' '))}${getAttributes(props.Attributes)}${getDatasets(props.Datasets)}`;
}
exports.getHtmlAttributes = getHtmlAttributes;
function getClassAttribute(classes) {
    if (!classes) {
        return '';
    }
    else {
        return `${' '}class='${classes}'`;
    }
}
exports.getClassAttribute = getClassAttribute;
function getIdAttribute(id, autoId) {
    if (id) {
        return `${' '}id='${id}'`;
    }
    if (autoId) {
        return `${' '}id='id-${utilid.newGuid()}'`;
    }
    return '';
}
exports.getIdAttribute = getIdAttribute;
function getAttributes(attributes) {
    if (!attributes) {
        return '';
    }
    ;
    return attributes.map(attr => getAttribute(attr.Name, attr.Value)).join(' ');
}
exports.getAttributes = getAttributes;
function getAttribute(name, value) {
    return `${' '}${name}='${value}'`;
}
exports.getAttribute = getAttribute;
function getDatasets(datasets) {
    if (!datasets) {
        return '';
    }
    ;
    return datasets.map(dataset => getDataset(dataset.Name, dataset.Value)).join(' ');
}
exports.getDatasets = getDatasets;
function getDataset(name, value) {
    return `${' '}data-${name}='${value}'`;
}
exports.getDataset = getDataset;
function toHtml(value) {
    var div = document.createElement('div');
    div.innerHTML = value.replace(/(\r\n|\n|\r)/gm, "").trim();
    return div.firstElementChild;
}
exports.toHtml = toHtml;
function toHtmlMany(value) {
    var div = document.createElement('div');
    div.innerHTML = value.replace(/(\r\n|\n|\r)/gm, "").trim();
    return [...div.children];
}
exports.toHtmlMany = toHtmlMany;
function toHtmlWrapper(value, wrapperElem = 'div') {
    var wrapper = document.createElement(wrapperElem);
    wrapper.innerHTML = value.replace(/(\r\n|\n|\r)/gm, "").trim();
    if (wrapper.children.length == 1) {
        return wrapper.firstElementChild;
    }
    else {
        return wrapper;
    }
}
exports.toHtmlWrapper = toHtmlWrapper;
function createElem(tag, id = '', classes = '') {
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
exports.createElem = createElem;
function setElemPosition(elem, left, top) {
    elem.style.left = `${left}px`;
    elem.style.top = `${top}px`;
}
exports.setElemPosition = setElemPosition;
function setElemPositionAndSize(elem, left, top, width, height) {
    elem.style.left = `${left}px`;
    elem.style.top = `${top}px`;
    elem.style.width = `${width}px`;
    elem.style.height = `${height}px`;
}
exports.setElemPositionAndSize = setElemPositionAndSize;
function setElemSize(elem, width, height) {
    elem.style.width = `${width}px`;
    elem.style.height = `${height}px`;
}
exports.setElemSize = setElemSize;
function cloneObjectJson(obj) {
    return JSON.parse(JSON.stringify(obj));
}
exports.cloneObjectJson = cloneObjectJson;
function getRelativeParentPos(elem) {
    let parentBB = elem.getBoundingClientRect();
    let bb = elem.getBoundingClientRect();
    return {
        x: bb.x - parentBB.x,
        y: bb.y - parentBB.y
    };
}
exports.getRelativeParentPos = getRelativeParentPos;
function toParentRelativePos(elem, x, y) {
    let bbParent = elem.parentElement.getBoundingClientRect();
    return {
        x: x - bbParent.x,
        y: y - bbParent.y
    };
}
exports.toParentRelativePos = toParentRelativePos;
function removeClassStartsWith(elem, startsWith) {
    for (let i = 0; i < elem.classList.length; i++) {
        const className = elem.classList[i];
        if (className.startsWith(startsWith)) {
            elem.classList.remove(className);
        }
    }
}
exports.removeClassStartsWith = removeClassStartsWith;
function addClassesTo(classList, elem) {
    if (classList) {
        let classes = classList.split(' ');
        classes.forEach(c => elem.classList.add(c));
    }
}
exports.addClassesTo = addClassesTo;
function elemToRectRelativeParent(elem) {
    let bb = elem.getBoundingClientRect();
    let bbParent = elem.parentElement.getBoundingClientRect();
    return {
        x: bb.left - bbParent.x,
        y: bb.top - bbParent.y,
        w: bb.width,
        h: bb.height
    };
}
exports.elemToRectRelativeParent = elemToRectRelativeParent;
function elemToRect(elem) {
    let bb = elem.getBoundingClientRect();
    return {
        x: bb.left,
        y: bb.top,
        w: bb.width,
        h: bb.height
    };
}
exports.elemToRect = elemToRect;
