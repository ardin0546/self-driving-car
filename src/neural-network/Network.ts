import Level from "./Level.ts";
import {lerp} from "../helpers.ts";

export class Network {
    public levels: Level[] = [];

    constructor(neurons: number[]) {
        for (let i = 0; i < neurons.length - 1; i++) {
            this.levels.push(new Level(
                neurons[i],
                neurons[i + 1],
            ));
        }
    }

    static fromJSON(data: any): Network {
        const net = new Network([]); // no need to pass neurons
        net.levels = data.levels.map((l: any) => Level.fromJSON(l));
        return net;
    }

    static mutate(network: Network, amount = 1) {
        for (const level of network.levels) {
            for (let i = 0; i < level.biases.length; i++) {
                level.biases[i] = lerp(
                    level.biases[i],
                    Math.random() * 2 - 1,
                    amount,
                );
            }
            for (let i = 0; i < level.weights.length; i++) {
                for (let j = 0; j < level.weights[i].length; j++) {
                    level.weights[i][j] = lerp(
                        level.weights[i][j],
                        Math.random() * 2 - 1,
                        amount,
                    );
                }
            }
        }
    }

    static feedForward(givenInputs: number[], network: Network) {
        let outputs = Level.feedForward(
            givenInputs,
            network.levels[0],
        );
        for (let i = 1; i < network.levels.length; i++) {
            outputs = Level.feedForward(
                outputs,
                network.levels[i],
            );
        }

        return outputs;
    }
}