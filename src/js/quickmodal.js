"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuickModal = void 0;
const html = require("./util/html");
class QuickModal {
    constructor(info) {
        this.info = info;
        this.create();
        document.body.append(this.html);
    }
    create() {
        this.html = html.toHtml(`<div class='quick-modal'></div>`);
        this.html.append(this.info.Content);
        if (this.info.Position) {
            html.setElemPosition(this.html, this.info.Position.x, this.info.Position.y);
        }
        else {
            let bbp = document.body.getBoundingClientRect();
            let bb = this.html.getBoundingClientRect();
            html.setElemPosition(this.html, bbp.width / 2 - bb.width / 2, bbp.height / 2 - bb.height / 2);
        }
    }
}
exports.QuickModal = QuickModal;
