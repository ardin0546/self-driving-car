export class FPSCounter {
    constructor(
        private lastTime = 0,
        private fps = 0,
    ) {
    }

    update(time: number) {
        if (this.lastTime) {
            const delta = time - this.lastTime;
            this.fps = 1000 / delta;
        }

        this.lastTime = time;
    }

    getFps() {
        return this.fps.toFixed(2);
    }
}
