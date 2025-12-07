import {Network} from "./Network.ts";
import {getAppElement, getRGBA, lerp} from "../helpers.ts";
import Level from "./Level.ts";

export default class Visualizer {
    public readonly ctx: CanvasRenderingContext2D;

    constructor() {
        this.ctx = Visualizer.#createCanvas();
    }

    drawNetwork(time: number, network: Network) {
        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);

        this.ctx.lineDashOffset = -time / 50;

        const margin = 50;
        const left = margin;
        const top = margin;
        const width = this.ctx.canvas.width - margin * 2;
        const height = this.ctx.canvas.height - margin * 2;

        const levelHeight = height / network.levels.length;


        for (let i = network.levels.length - 1; i >= 0; i--) {
            const levelTop = top +
                lerp(
                    height - levelHeight,
                    0,
                    network.levels.length == 1
                        ? 0.5
                        : i / (network.levels.length - 1)
                );

            this.ctx.setLineDash([7, 3]);
            this.drawLevel(network.levels[i],
                left, levelTop,
                width, levelHeight,
                i == network.levels.length - 1
                    ? ['↑', '←', '→', '↓']
                    : []
            );
        }
    }

    drawLevel(
        level: Level,
        left: number,
        top: number,
        width: number,
        height: number,
        outputLabels: string[]
    ) {
        const right = left + width;
        const bottom = top + height;

        const {inputs, outputs, weights, biases} = level;

        for (let i = 0; i < inputs.length; i++) {
            for (let j = 0; j < outputs.length; j++) {
                this.ctx.beginPath();
                this.ctx.moveTo(
                    this.#getNodeX(i, inputs.length, left, right),
                    bottom
                );
                this.ctx.lineTo(
                    this.#getNodeX(j, outputs.length, left, right),
                    top
                );
                this.ctx.strokeStyle = getRGBA(weights[i][j]);
                this.ctx.lineWidth = 2;
                this.ctx.stroke();
            }
        }

        const nodeRadius = 18;

        for (let i = 0; i < level.inputs.length; i++) {
            const x = this.#getNodeX(i, inputs.length, left, right);

            this.ctx.beginPath();
            this.ctx.arc(x, bottom, nodeRadius, 0, Math.PI * 2);
            this.ctx.fillStyle = "black";
            this.ctx.fill();
            this.ctx.beginPath();
            this.ctx.arc(x, bottom, nodeRadius * 0.6, 0, Math.PI * 2);
            this.ctx.fillStyle = getRGBA(inputs[i]);
            this.ctx.fill();
        }

        for (let i = 0; i < level.outputs.length; i++) {
            const x = this.#getNodeX(i, outputs.length, left, right);

            this.ctx.beginPath();
            this.ctx.arc(x, top, nodeRadius, 0, Math.PI * 2);
            this.ctx.fillStyle = "black";
            this.ctx.fill();

            this.ctx.arc(x, top, nodeRadius * 0.6, 0, Math.PI * 2);
            this.ctx.fillStyle = getRGBA(outputs[i]);
            this.ctx.fill();

            this.ctx.beginPath();
            this.ctx.lineWidth = 2;
            this.ctx.arc(x, top, nodeRadius * 0.8, 0, Math.PI * 2);
            this.ctx.strokeStyle = getRGBA(biases[i]);
            this.ctx.setLineDash([3, 3]);
            this.ctx.stroke();
            this.ctx.setLineDash([]);

            if (outputLabels[i]) {
                this.ctx.beginPath();
                this.ctx.textAlign = "center";
                this.ctx.textBaseline = "middle";
                this.ctx.fillStyle = "black";
                this.ctx.strokeStyle = "white";
                this.ctx.font = (nodeRadius * 1.5) + "px Arial";
                this.ctx.fillText(outputLabels[i], x, top + nodeRadius * 0.1);
                this.ctx.lineWidth = 0.5;
                this.ctx.strokeText(outputLabels[i], x, top + nodeRadius * 0.1);
            }
        }
    }

    #getNodeX(index: number, totalNodes: number, left: number, right: number): number {
        return lerp(
            left,
            right,
            totalNodes === 1 ? 0.5 : index / (totalNodes - 1)
        );
    }

    static #createCanvas(): CanvasRenderingContext2D {
        const canvas = document.createElement("canvas");
        canvas.width = 600;
        canvas.height = window.innerHeight;
        canvas.style.backgroundColor = "dimgray";
        canvas.style.marginLeft = "3rem";

        const ctx = canvas.getContext("2d");
        if (!ctx) {
            throw new Error("Could not get canvas context");
        }

        getAppElement().appendChild(canvas);

        return ctx;
    }
}