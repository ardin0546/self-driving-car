import {Network} from "./Network.ts";

export type SaveData = {
    distance: number,
    iteration: number,
    network: Network,
}

export default class Storage {
    load(): SaveData | null {
        const json = localStorage.getItem("bestNetwork");
        if (!json) return null;

        const data = JSON.parse(json);
        return {
            distance: data.distance,
            iteration: data.iteration,
            network: Network.fromJSON(data.network)
        };
    }

    save(
        distance: number,
        network: Network,
        iteration: number,
    ) {
        const json = {
            distance: distance,
            iteration: iteration,
            network: network,
        }

        localStorage.setItem(
            "bestNetwork",
            JSON.stringify(json)
        );
    }

    discard() {
        localStorage.removeItem("bestNetwork");
    }
}
