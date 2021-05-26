
    export class Debouncer {

        private debounceTimer: any
        private clickCounter: number = 0;
        private timerId = null;

        public debounce(fn, delay) {
            window.clearTimeout(this.debounceTimer);
            this.debounceTimer = setTimeout(fn, delay);
        }

        public cancel() {
            window.clearTimeout(this.debounceTimer);
        }

        public debounceClicks(e, fn1, fn2, delay) {
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

        public throttle(func, delay) {
            if (this.timerId) {
                return
            }
            this.timerId = setTimeout( ()=> {
                func();
                this.timerId = undefined;
            }, delay)
        }
    }

