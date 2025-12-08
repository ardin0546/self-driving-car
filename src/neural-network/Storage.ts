import Car from "../Car.ts";
import {Network} from "./Network.ts";
import {getAppElement} from "../helpers.ts";

export default class Storage {
    private bestCar: {car: Car, network: Network};

    constructor(bestCar: {car: Car, network: Network}) {
        this.bestCar = bestCar;
        this.#createElement();
    }

    load() {
        const bestNetwork = localStorage.getItem("bestNetwork");
        if (bestNetwork) {

            this.bestCar.network = JSON.parse(bestNetwork);
        }
    }

    save() {
        localStorage.setItem(
            "bestNetwork",
            JSON.stringify(this.bestCar.network)
        );
    }

    discard() {
        localStorage.removeItem("bestNetwork");
    }

    #createElement() {
        const div = document.createElement("div");
        div.style.display = "flex";
        div.style.flexDirection = "column";
        div.style.alignItems = "center";
        div.style.marginLeft = "1rem";
        div.style.marginRight = "1rem";

        const saveButton = document.createElement("button");
        saveButton.textContent = "Save";
        saveButton.style.marginBottom = "1rem";
        saveButton.onclick = this.save.bind(this);

        const discardButton = document.createElement("button");
        discardButton.textContent = "Discard";
        discardButton.style.marginBottom = "1rem";
        discardButton.onclick = this.discard.bind(this);

        div.appendChild(saveButton);
        div.appendChild(discardButton);
        getAppElement().appendChild(div);
    }
}
