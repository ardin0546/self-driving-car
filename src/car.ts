import Controls from "./controls.ts";
import {Sensor} from "./sensort.ts";
import {Road} from "./road.ts";
import {Point} from "./types";
import {polysIntersect} from "./helpers.ts";

export default class Car {
    constructor(
        public x: number,
        public y: number,
        public width: number,
        public height: number,
        //
        public speed: number = 0,
        public maxSpeed: number = 10,
        public acceleration: number = 0.2,
        public friction: number = 0.05,
        public angle: number = 0,
        //
        public polygon: Point[] = [],
        public isDamaged = false,
        //
        public readonly sensor: Sensor = new Sensor(this),
        public readonly controls: Controls = new Controls(),
    ) {
    }

    update(road: Road) {
        if (this.isDamaged) {
            return
        }

        this.#move();
        this.polygon = this.#createPolygon();
        this.isDamaged = this.#assessDamage(road);
        this.sensor.update(road);
    }

    draw(ctx: CanvasRenderingContext2D) {
        ctx.beginPath();

        if (this.isDamaged) {
            ctx.fillStyle = "red";
        }

        if (this.polygon.length > 0) {
            ctx.moveTo(this.polygon[0].x, this.polygon[0].y);
        }
        for (let i = 1; i < this.polygon.length; i++) {
            ctx.lineTo(this.polygon[i].x, this.polygon[i].y);
        }
        ctx.fill();

        // FRONT INDICATOR
        if (this.polygon.length > 2) {
            ctx.beginPath();
            ctx.strokeStyle = "red";
            ctx.lineWidth = 4;

            ctx.moveTo(this.polygon[0].x, this.polygon[0].y);
            ctx.lineTo(this.polygon[1].x, this.polygon[1].y);
            ctx.stroke();
        }

        this.sensor.draw(ctx);
    }

    #createPolygon() {
        const points: Point[] = [];

        const rad = Math.hypot(this.width, this.height) / 2;
        const alpha = Math.atan2(this.width, this.height);

        points.push({
            x: this.x - Math.sin(this.angle - alpha) * rad,
            y: this.y - Math.cos(this.angle - alpha) * rad
        });
        points.push({
            x: this.x - Math.sin(this.angle + alpha) * rad,
            y: this.y - Math.cos(this.angle + alpha) * rad
        });
        points.push({
            x: this.x - Math.sin(Math.PI + this.angle - alpha) * rad,
            y: this.y - Math.cos(Math.PI + this.angle - alpha) * rad
        });
        points.push({
            x: this.x - Math.sin(Math.PI + this.angle + alpha) * rad,
            y: this.y - Math.cos(Math.PI + this.angle + alpha) * rad
        });

        return points;
    }

    #assessDamage(road: Road) {
        for (let i = 0; i < road.borders.length; i++) {
            if (polysIntersect(this.polygon, road.borders[i])) {
                return true;
            }
        }
        return false;
    }

    #move() {
        if (this.controls.forward) {
            this.speed += this.acceleration;
        }

        if (this.controls.reverse) {
            this.speed -= this.acceleration;
        }

        if (this.speed > 0) {
            this.speed -= this.friction;
        }
        if (this.speed < 0) {
            this.speed += this.friction;
        }
        if (Math.abs(this.speed) < this.friction) {
            this.speed = 0;
        }

        if (this.speed > this.maxSpeed) {
            this.speed = this.maxSpeed;
        }
        if (this.speed < -this.maxSpeed) {
            this.speed = -this.maxSpeed;
        }

        if (this.speed !== 0) {
            const flip = this.speed > 0 ? 1 : -1;
            if (this.controls.left) {
                this.angle += 0.03 * flip;
            }

            if (this.controls.right) {
                this.angle -= 0.03 * flip;
            }
        }

        this.x -= Math.sin(this.angle) * this.speed;
        this.y -= Math.cos(this.angle) * this.speed;
    }
}