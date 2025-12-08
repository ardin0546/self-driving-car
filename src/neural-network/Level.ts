export default class Level {
    public inputs: number[];
    public outputs: number[];
    public biases: number[];
    public weights: number[][];

    constructor(
        public readonly inputCount: number,
        public readonly outputCount: number,
    ) {
        this.inputs = new Array(inputCount);
        this.outputs = new Array(outputCount);
        this.biases = new Array(outputCount);

        this.weights = [];
        for (let i = 0; i < inputCount; i++) {
            this.weights[i] = new Array(outputCount);
        }

        Level.#randomize(this);
    }

    static fromJSON(data: any): Level {
        const level = new Level(data.inputs.length, data.outputs.length);
        // Override the random weights/biases
        level.inputs = [...data.inputs];
        level.outputs = [...data.outputs];
        level.biases = [...data.biases];
        level.weights = data.weights.map((row: number[]) => [...row]);
        return level;
    }

    static #randomize(level: Level) {
        for (let i = 0; i < level.inputs.length; i++) {
            for (let j = 0; j < level.outputs.length; j++) {
                level.weights[i][j] = Math.random() * 2 - 1;
            }
        }

        for (let j = 0; j < level.weights.length; j++) {
            level.biases[j] = Math.random() * 2 - 1;
        }
    }

    static feedForward(givenInputs: number[], level: Level): number[] {
        for (let i = 0; i < level.inputs.length; i++) {
            level.inputs[i] = givenInputs[i];
        }

        for (let i = 0; i < level.outputs.length; i++) {
            let sum = 0
            for (let j = 0; j < level.inputs.length; j++) {
                sum += level.inputs[j] * level.weights[j][i];
            }

            if (sum > level.biases[i]) {
                level.outputs[i] = 1;
            } else {
                level.outputs[i] = 0;
            }
        }

        return level.outputs;
    }
}