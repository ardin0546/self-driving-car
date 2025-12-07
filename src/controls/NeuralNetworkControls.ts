import Controls from "./Controls.ts";
import {Sensor} from "../Sensor.ts";
import {Network} from "../neural-network/Network.ts";

export default class NeuralNetworkControls implements Controls {
    private isForward: boolean = false;
    private isLeft: boolean = false;
    private isRight: boolean = false;
    private isRevers: boolean = false;

    forward(): boolean {
        return this.isForward;
    }

    left(): boolean {
        return this.isLeft;
    }

    right(): boolean {
        return this.isRight;
    }

    reverse(): boolean {
        return this.isRevers;
    }

    update(sensor: Sensor, network: Network) {
        const offsets = sensor.readings.map(
            reading => reading === null ? 0 : 1 - reading.offset,
        );
        const outputs = Network.feedForward(offsets, network);

        this.isForward = Boolean(outputs[0]);
        this.isLeft = Boolean(outputs[1]);
        this.isRight = Boolean(outputs[2]);
        this.isRevers = Boolean(outputs[3]);
    }
}