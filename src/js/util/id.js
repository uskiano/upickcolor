"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractNumberFromString = exports.getNamePrefixTakenList = exports.idPrefixConseq = exports.newGuid8 = exports.newGuid = exports.getIdCounter = void 0;
function getIdCounter() {
    if (!window.ConsecutiveId) {
        window.ConsecutiveId = 0;
    }
    return window.ConsecutiveId++;
}
exports.getIdCounter = getIdCounter;
function newGuid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}
exports.newGuid = newGuid;
function newGuid8() {
    return 'xxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}
exports.newGuid8 = newGuid8;
function idPrefixConseq(prefixNoDash, idsTaken) {
    let max = Math.max(...idsTaken.concat(`${prefixNoDash}-0`).map(idTaken => parseInt(idTaken.split('-')[1])));
    return `${prefixNoDash}-${max + 1}`;
}
exports.idPrefixConseq = idPrefixConseq;
function getNamePrefixTakenList(prefix, takenList) {
    if (!takenList || takenList.length === 0)
        return `${prefix}1`;
    let takenNumbers = takenList.map(p => extractNumberFromString(p));
    let max = Math.max(...takenNumbers);
    let value = max + 1;
    return `${prefix}${value}`;
}
exports.getNamePrefixTakenList = getNamePrefixTakenList;
function extractNumberFromString(str) {
    let result = str.match(/(\d+)(?!.*\d)/);
    if (!result || result.length == 0) {
        return 0;
    }
    else {
        return +result[0];
    }
}
exports.extractNumberFromString = extractNumberFromString;
