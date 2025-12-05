import Car from "./car.ts";
import {lerp} from "./helpers.ts";

export class Sensor {
    constructor(
        public car: Car,
        public rayCount = 10,
        public rayLength = 150,
        public raySpread = Math.PI / 2,
        public rays: {x: number, y: number}[][] = [],
    ) {
    }

    update() {
       this.#castRays();
    }

    draw(ctx: CanvasRenderingContext2D) {
        for (const ray of this.rays) {
            ctx.beginPath();
            ctx.lineWidth = 2;
            ctx.strokeStyle = 'yellow';
            ctx.moveTo(ray[0].x, ray[0].y);
            ctx.lineTo(ray[1].x, ray[1].y);
            ctx.stroke();
        }
    }

    #castRays() {
        this.rays = [];
        for (let i = 0; i < this.rayCount; i++) {
            // const rayAngle = this.raySpread / 2 - (this.raySpread * i) / (this.rayCount - 1) + this.car.angle;
            const rayAngle = lerp(
                this.raySpread / 2,
                -this.raySpread / 2,
                this.rayCount === 1 ? 0.5 : i / (this.rayCount - 1),
            ) + this.car.angle;

            const start = {x: this.car.x, y: this.car.y};
            const end = {
                x: this.car.x - Math.sin(rayAngle) * this.rayLength,
                y: this.car.y - Math.cos(rayAngle) * this.rayLength,
            };

            this.rays.push([start, end]);
        }
    }
}