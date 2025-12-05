import Controls from "./controls.ts";
import {Sensor} from "./sensort.ts";

export default class Car {
    constructor(
        public x: number,
        public y: number,
        public width: number,
        public height: number,

        public speed: number = 0,
        public maxSpeed: number = 10,
        public acceleration: number = 0.2,
        public friction: number = 0.05,

        public angle: number = 0,

        public readonly sensor: Sensor = new Sensor(this),
        public readonly controls: Controls = new Controls(),
    ) {
    }

    update() {
       this.#move();
       this.sensor.update();
    }

    draw(ctx: CanvasRenderingContext2D) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(-this.angle);

        ctx.beginPath();
        ctx.fillStyle = 'black';
        ctx.rect(
            -this.width / 2,
            -this.height / 2,
            this.width,
            this.height,
        )
        ctx.fill();

        // Front indicator
        ctx.beginPath();
        ctx.fillStyle = 'red';
        ctx.rect(
            -this.width / 2,
            -this.height / 2,
            this.width,
            3,
        )
        ctx.fill();

        ctx.restore();

        this.sensor.draw(ctx);
    }

    #move() {
        if (this.controls.forward) {
            this.speed += this.acceleration;
        }

        if (this.controls.reverse) {
            this.speed -= this.acceleration;
        }

        if (this.speed > this.maxSpeed) {
            this.speed = this.maxSpeed;
        }
        if (this.speed < -this.maxSpeed) {
            this.speed = -this.maxSpeed;
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