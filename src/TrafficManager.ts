import Car from "./Car.ts";
import {ComputerControls} from "./controls/ComputerControls.ts";
import {Road} from "./Road.ts";

// @todo better naming
const REMOVE_CAR_OFFSET = 400;

export default class TrafficManager {
    private traffic: Car[] = [];

    constructor(road: Road) {
        this.traffic = this.#createInitialTraffic(road);
    }

    getTraffic(): Car[] {
        return this.traffic;
    }

    update(canvas: HTMLCanvasElement, road: Road, car: Car) {
        for (const trafficCar of this.traffic) {
            trafficCar.update(road, this.traffic);
        }

        const delta = Math.round(this.traffic[0].y - car.y);
        if (delta < REMOVE_CAR_OFFSET) {
            // No car needs to be removed/ add
            return;
        }

        this.traffic.shift();
        let latestY = this.traffic.length ? this.traffic[this.traffic.length - 1].y : undefined
        if (!latestY) {
            console.log('car.y', car.y);
            console.log('canvas height', canvas.height);
            latestY = car.y - canvas.height + 200;
        }

        this.traffic.push(new Car({
            x: road.getLaneCenter(Math.floor(Math.random() * road.laneCount)),
            y: latestY - REMOVE_CAR_OFFSET,
            width: 50,
            height: 80,
            controls: new ComputerControls(),
            maxSpeed: Math.round(Math.random() * car.maxSpeed- 2),
            color: "orange",
        }));
    }

    draw(ctx: CanvasRenderingContext2D) {
        for (const trafficCar of this.traffic) {
            trafficCar.draw(ctx);
        }
    }

    #createInitialTraffic(road: Road) {
        return [
            new Car({
                x: road.getLaneCenter(1),
                y: 600,
                width: 50,
                height: 80,
                controls: new ComputerControls(),
                maxSpeed: 4,
                color: "orange",
            }),
            new Car({
                x: road.getLaneCenter(2),
                y: 200,
                width: 50,
                height: 80,
                controls: new ComputerControls(),
                maxSpeed: 4,
                color: "orange",
            }),
            new Car({
                x: road.getLaneCenter(0),
                y: 0,
                width: 50,
                height: 80,
                controls: new ComputerControls(),
                maxSpeed: 4,
                color: "orange",
            }),
        ];
    }
}