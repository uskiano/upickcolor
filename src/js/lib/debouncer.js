"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Debouncer = void 0;
class Debouncer {
    constructor() {
        this.clickCounter = 0;
        this.timerId = null;
    }
    debounce(fn, delay) {
        window.clearTimeout(this.debounceTimer);
        this.debounceTimer = setTimeout(fn, delay);
    }
    cancel() {
        window.clearTimeout(this.debounceTimer);
    }
    debounceClicks(e, fn1, fn2, delay) {
        this.clickCounter++;
        window.clearTimeout(this.debounceTimer);
        this.debounceTimer = setTimeout(p => {
            if (this.clickCounter === 1) {
                fn1(e);
            }
            else {
                fn2(e);
            }
            this.clickCounter = 0;
        }, delay);
    }
    throttle(func, delay) {
        if (this.timerId) {
            return;
        }
        this.timerId = setTimeout(() => {
            func();
            this.timerId = undefined;
        }, delay);
    }
}
exports.Debouncer = Debouncer;
