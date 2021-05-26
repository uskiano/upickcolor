"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const html = require("./util/html");
const dom = require("./util/dom");
const id = require("./util/id");
const color = require("./util/color");
const udragger = require("./lib/udragger/UDragger");
const deb = require("./lib/debouncer");
const q = require("./quickmodal");
const DOT_PALETTE_OFFSET = 8;
const DOT_SLIDE_OFFSET = 6;
class UPickColor {
    constructor(position) {
        this.debouncer = new deb.Debouncer();
        this.createColorPickerHtml();
        let modal = new q.QuickModal({
            Content: this.html,
            Position: position
        });
        this.color = { H: 338, S: 20, L: 20, A: 1 };
        this.updateHSV();
        this.drawPalette(this.paletteHtml, this.color);
        this.paletteWidth = this.paletteHtml.getBoundingClientRect().width;
        this.paletteHeight = this.paletteHtml.getBoundingClientRect().height;
        let draggerPalette = new udragger.UDragger(this.paletteHtml, {
            GridOptions: null, Selectable: false, Resizable: false, SelectBox: false, DragConstraints: {
                MinDragX: -DOT_PALETTE_OFFSET,
                MaxDragX: this.paletteWidth - DOT_PALETTE_OFFSET,
                MinDragY: -DOT_PALETTE_OFFSET,
                MaxDragY: this.paletteHeight - DOT_PALETTE_OFFSET
            }
        });
        draggerPalette.addElem(this.dotPaletteHtml);
        this.paletteHtml.addEventListener('mousedown', (e) => {
            if (e.target == this.dotPaletteHtml)
                return;
            html.setElemPosition(this.dotPaletteHtml, e.offsetX - DOT_PALETTE_OFFSET, e.offsetY - DOT_PALETTE_OFFSET);
            this.updatePalette(this.dotPaletteHtml);
            this.updateTextHSLA();
            dom.dispatch(this.dotPaletteHtml, 'mousedown', e.pageX, e.pageY, 1);
        });
        draggerPalette.addEventListener(udragger.UDraggerEvent.onMoving, (elems) => {
            this.updatePalette(elems[0]);
            this.updateTextHSLA();
        });
        this.setPaletteDotPosition(this.dotPaletteHtml, this.colorHSVA);
        // hue
        this.drawHue(this.hueHtml, this.color);
        this.hueWidth = this.hueHtml.getBoundingClientRect().width;
        let draggerHue = new udragger.UDragger(this.hueHtml, {
            GridOptions: null, Selectable: false, Resizable: false, SelectBox: false, DragConstraints: {
                ConstraintX: true,
                MinDragX: -DOT_SLIDE_OFFSET,
                MaxDragX: this.hueWidth - DOT_SLIDE_OFFSET
            }
        });
        draggerHue.addEventListener(udragger.UDraggerEvent.onMoving, (elems) => {
            this.updateHue(elems[0]);
            this.updateTextHSLA();
        });
        this.hueHtml.addEventListener('mousedown', (e) => {
            if (e.target == this.dotHueHtml)
                return;
            html.setElemPosition(this.dotHueHtml, e.offsetX, 0);
            this.updateHue(this.dotHueHtml);
            this.updateTextHSLA();
            dom.dispatch(this.dotHueHtml, 'mousedown', e.pageX, e.pageY, 1);
        });
        draggerHue.addElem(this.dotHueHtml);
        this.setHueDotPosition(this.dotHueHtml, this.colorHSVA);
        // alpha
        this.drawAlpha(this.alphaHueHtml, this.color);
        let draggerAlpha = new udragger.UDragger(this.alphaHueHtml, {
            GridOptions: null, Selectable: false, Resizable: false, SelectBox: false, DragConstraints: {
                ConstraintX: true,
                MinDragX: -DOT_SLIDE_OFFSET,
                MaxDragX: this.hueWidth - DOT_SLIDE_OFFSET
            }
        });
        draggerAlpha.addEventListener(udragger.UDraggerEvent.onMoving, (elems) => {
            this.updateAlpha(elems[0]);
            this.updateTextHSLA();
        });
        this.alphaHueHtml.addEventListener('mousedown', (e) => {
            if (e.target == this.dotAlphaHtml)
                return;
            html.setElemPosition(this.dotAlphaHtml, e.offsetX, 0);
            this.updateAlpha(this.dotAlphaHtml);
            this.updateTextHSLA();
            dom.dispatch(this.dotAlphaHtml, 'mousedown', e.pageX, e.pageY, 1);
        });
        draggerAlpha.addElem(this.dotAlphaHtml);
        this.setAlphaDotPosition(this.dotAlphaHtml, this.colorHSVA);
        this.drawPreview(this.color);
        this.updateTextHSLA();
        this.onInputChange(this.inputHslaH, { min: 0, max: 360 }, v => { this.color.H = v; this.updateColorComponents(); });
        this.onInputChange(this.inputHslaS, { min: 0, max: 100 }, v => { this.color.S = v; this.updateColorComponents(); });
        this.onInputChange(this.inputHslaL, { min: 0, max: 100 }, v => { this.color.L = v; this.updateColorComponents(); });
        this.onInputChange(this.inputHslaA, { min: 0, max: 1 }, v => { this.color.A = v; this.updateColorComponents(); });
    }
    updateColorComponents() {
        this.updateHSV();
        this.setAlphaDotPosition(this.dotAlphaHtml, this.colorHSVA);
        this.updateAlpha(this.dotAlphaHtml);
        this.setHueDotPosition(this.dotHueHtml, this.colorHSVA);
        this.updateHue(this.dotHueHtml);
        this.setPaletteDotPosition(this.dotPaletteHtml, this.colorHSVA);
        this.updatePalette(this.dotPaletteHtml);
        this.drawPreview(this.color);
    }
    updateHSV() {
        let hsv = color.hslToHsv(this.color.H, this.color.S, this.color.L);
        this.colorHSVA = { H: hsv[0], S: hsv[1], V: hsv[2], A: this.color.A };
    }
    updatePalette(elem) {
        let rect = html.elemToRectRelativeParent(elem);
        this.colorHSVA.S = this.pixelToValue(100, this.paletteWidth, rect.x + DOT_PALETTE_OFFSET);
        this.colorHSVA.V = this.pixelToValue(100, this.paletteHeight, this.paletteHeight - (rect.y + DOT_PALETTE_OFFSET));
        let hsl = color.hsvToHsl(this.colorHSVA.H, this.colorHSVA.S, this.colorHSVA.V);
        this.color.H = hsl[0];
        this.color.S = hsl[1];
        this.color.L = hsl[2];
        if (this.color.S < 0) {
            console.warn(`wrong saturation ${this.color.S}`);
        }
        this.drawPreview(this.color);
        this.drawAlpha(this.alphaHueHtml, this.color);
    }
    updateHue(elem) {
        let rect = html.elemToRectRelativeParent(elem);
        this.color.H = this.pixelToValue(360, this.hueWidth, rect.x + DOT_SLIDE_OFFSET);
        this.colorHSVA.H = this.color.H;
        this.drawPalette(this.paletteHtml, this.color);
        this.drawPreview(this.color);
        this.drawAlpha(this.alphaHueHtml, this.color);
    }
    updateAlpha(elem) {
        let rect = html.elemToRectRelativeParent(elem);
        this.color.A = this.pixelToValue(1, this.hueWidth, rect.x + DOT_SLIDE_OFFSET);
        this.colorHSVA.A = this.color.A;
        this.drawPreview(this.color);
        this.drawAlpha(this.alphaHueHtml, this.color);
    }
    pixelToValue(unitWidth, pixelWidth, pixelValue) {
        let val = (pixelValue * unitWidth) / pixelWidth;
        return val;
    }
    valueToPixel(unitWidth, pixelWidth, unitValue) {
        return (pixelWidth * unitValue) / unitWidth;
    }
    setPaletteDotPosition(elem, color) {
        let x = this.valueToPixel(100, this.paletteWidth, color.S) - DOT_PALETTE_OFFSET;
        let y = this.paletteHeight - this.valueToPixel(100, this.paletteHeight, color.V) - DOT_PALETTE_OFFSET;
        html.setElemPosition(elem, x, y);
    }
    setHueDotPosition(elem, color) {
        let x = this.valueToPixel(360, this.hueWidth, color.H);
        html.setElemPosition(elem, x - DOT_SLIDE_OFFSET, 0);
    }
    setAlphaDotPosition(elem, color) {
        let x = this.valueToPixel(1, this.hueWidth, color.A);
        html.setElemPosition(elem, x - DOT_SLIDE_OFFSET, 0);
    }
    drawPalette(elem, color) {
        elem.style.background = `
                linear-gradient(to top, rgba(0, 0, 0, 1), transparent),
                linear-gradient(to left, hsla(${color.H}, 100%, 50%, 1), rgba(255, 255, 255, 1))
            `;
    }
    drawHue(elem, color) {
        elem.style.background = `linear-gradient(90deg,#f00,#ff0,#0f0,#0ff,#00f,#f0f,#f00)`;
    }
    drawAlpha(elem, colorHsl) {
        elem.style.background = `
                linear-gradient(to right,transparent,hsl(${colorHsl.H}, ${colorHsl.S}%, ${colorHsl.L}%))
            `;
    }
    updateTextHSLA() {
        this.inputHslaH.value = `${Math.round(this.color.H)}`;
        this.inputHslaS.value = `${Math.round(this.color.S)}`;
        this.inputHslaL.value = `${Math.round(this.color.L)}`;
        this.inputHslaA.value = `${this.color.A.toFixed(2)}`;
    }
    drawPreview(color) {
        let rect = html.elemToRectRelativeParent(this.dotPaletteHtml);
        this.previewHtml.style.backgroundColor = `hsla(${color.H}, ${color.S}%, ${color.L}%, ${color.A})`;
        console.log('hsl', color.H.toFixed(0), color.S.toFixed(0), color.L.toFixed(0), color.A, ' pt', { x: rect.x.toFixed(0), y: rect.y.toFixed(0) });
    }
    createColorPickerHtml() {
        this.html = html.toHtml(`
                <div class='ucolor-picker'>
                    <div id='palette-${id.newGuid8()}' class='palette'><div class='dot'></div></div>
                    <div class='panel'>
                        <div class='preview-group'>
                            <div class='preview-check'></div>
                            <div class='preview'></div>
                        </div>
                        <div class='slides'>
                            <div id='hue-${id.newGuid8()}' class='hue'><div class='dot-hue'></div></div>
                            <div class='alpha-group'>
                                <div class='alpha-check'></div>
                                <div class='alpha-hue' id='alpha-hue-${id.newGuid8()}'></div>
                                <div class='dot-alpha'></div>
                            </div>
                        </div>
                    </div>
                    <div class='text-group'>
                        <div class='color-field'>
                            <input type='text' class='input-hsla-h' maxlength="4"'>
                            <legend>H</legend>
                            </div>
                        <div class='color-field'>
                            <input type='text' class='input-hsla-s' maxlength="4"'>
                            <legend>S</legend>
                            </div>
                        <div class='color-field'>
                            <input type='text' class='input-hsla-l' maxlength="4"'>
                            <legend>L</legend>
                            </div>
                        <div class='color-field'>
                            <input type='text' class='input-hsla-a' maxlength=4"'>
                            <legend>A</legend>
                            </div>
                     </div>
                </div>`);
        this.paletteHtml = this.html.querySelector('.palette');
        this.hueHtml = this.html.querySelector('.hue');
        this.alphaHueHtml = this.html.querySelector('.alpha-hue');
        this.dotPaletteHtml = this.html.querySelector('.dot');
        this.dotAlphaHtml = this.html.querySelector('.dot-alpha');
        this.dotHueHtml = this.html.querySelector('.dot-hue');
        this.previewHtml = this.html.querySelector('.preview');
        this.inputHslaH = this.html.querySelector('.input-hsla-h');
        this.inputHslaS = this.html.querySelector('.input-hsla-s');
        this.inputHslaL = this.html.querySelector('.input-hsla-l');
        this.inputHslaA = this.html.querySelector('.input-hsla-a');
    }
    onInputChange(inputHtml, range, callback) {
        inputHtml.addEventListener('input', e => {
            let isValid = !isNaN(+inputHtml.value);
            if (isValid) {
                if (+inputHtml.value >= range.min && +inputHtml.value <= range.max)
                    this.debouncer.debounce(() => callback(+inputHtml.value), 500);
            }
        });
    }
}
exports.default = UPickColor;
