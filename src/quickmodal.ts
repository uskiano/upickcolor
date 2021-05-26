import * as types from "./types";
import * as html from "./util/html";

    export interface IQuickModal {
        Content: HTMLElement,
        Position?: types.IPoint
    }

    export class QuickModal {

        private html: HTMLElement;

        constructor(public info: IQuickModal) {
            this.create();
            document.body.append(this.html);
        }

        private create() {
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

