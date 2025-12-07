import Car from "./Car.ts";
import {getIntersection, lerp} from "./helpers.ts";
import {Road} from "./Road.ts";
import {Point} from "./types";

type Reading = Point & { offset: number };

export class Sensor {
    constructor(
        public car: Car,
        public rayCount = 3,
        public rayLength = 150,
        public raySpread = Math.PI / 2,
        public rays: Point[][] = [],
        public readings: (Reading | null)[] = [],
    ) {
    }

    update(road: Road, traffic?: Car[]) {
        this.#castRays();
        this.#setReadings(road, traffic);
    }

    draw(ctx: CanvasRenderingContext2D) {
        for(const ray of this.rays) {
            let end: Point | Reading = ray[1];

            const reading = this.readings[this.rays.indexOf(ray)];
            if (reading) {
                end = reading;
            }

            ctx.beginPath();
            ctx.lineWidth = 2;
            ctx.strokeStyle = 'yellow';
            ctx.moveTo(ray[0].x, ray[0].y);
            ctx.lineTo(ray[1].x, ray[1].y);
            ctx.stroke();

            if (reading) {
                ctx.beginPath();
                ctx.lineWidth = 2;
                ctx.strokeStyle = 'red';
                ctx.moveTo(ray[1].x, ray[1].y);
                ctx.lineTo(end.x, end.y);
                ctx.stroke();
            }
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

    #setReadings(road: Road, traffic?: Car[]) {
        this.readings = [];
        for (const ray of this.rays) {
            const reading = this.#findReading(ray, road, traffic);

            this.readings.push(reading);
        }
    }

    #findReading(ray: Point[], road: Road, traffic?: Car[]): (Reading | null) {
        let touches = [];

        for (const border of road.borders) {
            const touch = getIntersection(
                ray[0],
                ray[1],
                border[0],
                border[1]
            );
            if (touch) {
                touches.push(touch);
            }
        }

        for (const trafficCar of traffic ?? []) {
            for (let i = 0; i < trafficCar.polygon.length; i++) {
                const value = getIntersection(
                    ray[0],
                    ray[1],
                    trafficCar.polygon[i],
                    trafficCar.polygon[(i + 1) % trafficCar.polygon.length],
                );
                if (value) {
                    touches.push(value);
                }
            }
        }

        if (touches.length == 0) {
            return null;
        } else {
            const minOffset = Math.min(
                ...touches.map(e => e.offset),
            );

            return touches.find(e => e.offset == minOffset) ?? null;
        }
    }
}