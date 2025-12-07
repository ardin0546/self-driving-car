import Controls from "./Controls.ts";

export default class KeyboardControl implements Controls{
    private pressedForward: boolean = false;
    private pressedLeft: boolean = false;
    private pressedRight: boolean = false;
    private pressedReverse: boolean = false;

    constructor() {
        this.#addKeyboardListeners();
    }

    forward(): boolean {
        return this.pressedForward;
    }

    left(): boolean {
        return this.pressedLeft;
    }

    right(): boolean {
        return this.pressedRight
    }

    reverse(): boolean {
        return this.pressedReverse
    }

    #addKeyboardListeners() {
        document.onkeydown = (event) => {
            switch (event.key) {
                case "ArrowLeft":
                    this.pressedLeft = true;
                    break;
                case "ArrowRight":
                    this.pressedRight = true;
                    break;
                case "ArrowUp":
                    this.pressedForward = true;
                    break;
                case "ArrowDown":
                    this.pressedReverse = true;
                    break;
            }
        }

        document.onkeyup = (event) => {
            switch (event.key) {
                case "ArrowLeft":
                    this.pressedLeft = false;
                    break;
                case "ArrowRight":
                    this.pressedRight = false;
                    break;
                case "ArrowUp":
                    this.pressedForward = false;
                    break;
                case "ArrowDown":
                    this.pressedReverse = false;
                    break;
            }
        }
    }
}