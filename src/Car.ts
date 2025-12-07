import {Sensor} from "./Sensor.ts";
import {Road} from "./Road.ts";
import {Point} from "./types";
import {polysIntersect} from "./helpers.ts";
import {Network} from "./neural-network/Network.ts";
import Controls from "./controls/Controls.ts";

type CarOptions = {
    x: number,
    y: number,
    width: number,
    height: number,
    controls: Controls,
    speed?: number,
    maxSpeed?: number,
    color?: string,
    acceleration?: number,
}

const DAMAGED_COLOR = "tomato";

export default class Car {
    private static nextId = 1;

    public id: number;
    public x: number;
    public y: number;
    public width: number;
    public height: number;
    // https://www.w3schools.com/tags/ref_colornames.asp
    public color: string;

    public angle = 0;
    public polygon: Point[] = [];
    public isDamaged = false;

    public speed: number;
    public maxSpeed: number;
    public acceleration: number = 0.2;
    public friction: number = 0.05;

    public readonly controls: Controls;
    public readonly sensor?: Sensor = undefined;
    public readonly brain?: Network = undefined;

    constructor(options: CarOptions) {
        this.id = Car.nextId++;
        this.x = options.x;
        this.y = options.y;
        this.width = options.width;
        this.height = options.height;
        this.color = options.color ?? "blue";

        this.speed = options.speed || 0;
        this.maxSpeed = options.maxSpeed || 10;
        if (options.acceleration && options.acceleration > 0) {
            this.acceleration = options.acceleration;
        }

        this.controls = options.controls;
    }

    update(road: Road, traffic?: Car[]) {
        if (this.isDamaged) {
            return
        }

        this.#move();
        this.polygon = this.#createPolygon();
        this.isDamaged = this.#assessDamage(road, traffic);
    }

    draw(ctx: CanvasRenderingContext2D) {
        ctx.beginPath();

        ctx.fillStyle = this.isDamaged ? DAMAGED_COLOR : this.color;

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

    #assessDamage(road: Road, traffic?: Car[]) {
        for (const border of road.borders) {
            if (polysIntersect(this.polygon, border)) {
                return true;
            }
        }

        for (const trafficCar of traffic || []) {
            if (trafficCar.id === this.id) {
                continue;
            }
            if (polysIntersect(this.polygon, trafficCar.polygon)) {
                trafficCar.isDamaged = true;
                return true;
            }
        }

        return false;
    }

    #move() {
        if (this.controls.forward()) {
            this.speed += this.acceleration;
        }

        if (this.controls.reverse()) {
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
            if (this.controls.left()) {
                this.angle += 0.03 * flip;
            }

            if (this.controls.right()) {
                this.angle -= 0.03 * flip;
            }
        }

        this.x -= Math.sin(this.angle) * this.speed;
        this.y -= Math.cos(this.angle) * this.speed;
    }
}