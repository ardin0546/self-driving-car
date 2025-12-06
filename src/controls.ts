export enum  ControlType {
    KEYBOARD,
    DUMMY,
}

export default class Controls {
    public forward = false;
    public left = false;
    public right = false;
    public reverse = false;

    constructor(controlType: ControlType) {
        // @todo make interface... instead of param drilling
        if (controlType === ControlType.KEYBOARD) {
            this.#addKeyboardListeners();
        } else {
            this.forward = true;
        }
    }

    #addKeyboardListeners() {
        document.onkeydown = (event) => {
            switch (event.key) {
                case "ArrowLeft":
                    this.left = true;
                    break;
                case "ArrowRight":
                    this.right = true;
                    break;
                case "ArrowUp":
                    this.forward = true;
                    break;
                case "ArrowDown":
                    this.reverse = true;
                    break;
            }
        }

        document.onkeyup = (event) => {
            switch (event.key) {
                case "ArrowLeft":
                    this.left = false;
                    break;
                case "ArrowRight":
                    this.right = false;
                    break;
                case "ArrowUp":
                    this.forward = false;
                    break;
                case "ArrowDown":
                    this.reverse = false;
                    break;
            }
        }
    }
}