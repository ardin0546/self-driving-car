import Level from "./Level.ts";

export class Network {
    public readonly levels: Level[] = [];

    constructor(neurons: number[]) {
        for (let i = 0; i < neurons.length - 1; i++) {
            this.levels.push(new Level(
                neurons[i],
                neurons[i + 1],
            ));
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