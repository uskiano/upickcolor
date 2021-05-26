"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hslToHsv = exports.hsvToHsl = void 0;
function hsvToHsl(h, s, v) {
    s /= 100;
    v /= 100;
    const l = (2 - s) * v / 2;
    if (l !== 0) {
        if (l === 1) {
            s = 0;
        }
        else if (l < 0.5) {
            s = s * v / (l * 2);
        }
        else {
            s = s * v / (2 - l * 2);
        }
    }
    return [
        h,
        s * 100,
        l * 100
    ];
}
exports.hsvToHsl = hsvToHsl;
function hslToHsv(h, s, l) {
    s /= 100;
    l /= 100;
    s *= l < 0.5 ? l : 1 - l;
    const ns = (2 * s / (l + s)) * 100;
    const v = (l + s) * 100;
    return [h, isNaN(ns) ? 0 : ns, v];
}
exports.hslToHsv = hslToHsv;
