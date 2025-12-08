import Car from "./Car.ts";
import {ComputerControls} from "./controls/ComputerControls.ts";
import {Road} from "./Road.ts";
import {Point} from "./types";

type Options = {
    disableAutomatedTraffic?: boolean,
    debugSpawnCars?: boolean,
}

export default class TrafficManager {
    private readonly allowedToGenerateTraffic: boolean = true;
    private readonly debugSpawnCars: boolean = false;

    private traffic: Car[] = [];

    private spawnDistance: number = 500;
    public lastSpawnedCarY: number = 0;

    constructor(options?: Options) {
        if (options?.disableAutomatedTraffic) {
            this.allowedToGenerateTraffic = false;
        }

        if (options?.debugSpawnCars) {
            this.debugSpawnCars = true;
        }
    }

    getTraffic(): Car[] {
        return this.traffic;
    }

    update(canvas: HTMLCanvasElement, road: Road, playerCar: Car) {
        for (const trafficCar of this.traffic) {
            trafficCar.update(road, this.traffic);
        }

        if (!this.allowedToGenerateTraffic) {
            return;
        }

        const lastCar = this.traffic[this.traffic.length - 1];
        const canvasTop = playerCar.y - canvas.height;

        const shouldSpawnNewCar = !Boolean(lastCar) || (lastCar.y - canvasTop > this.spawnDistance);

        if (shouldSpawnNewCar) {
            this.spawnNext(road, canvasTop);
        }
    }

    spawnNext(road: Road, canvasTop: number) {
        const a = road.getLaneCenter(Math.floor(Math.random() * road.laneCount));
        const b = road.getLaneCenter(Math.floor(Math.random() * road.laneCount));

        const xValues = a === b ? [a] : [a, b];

        const nextY = this.lastSpawnedCarY - this.spawnDistance;
        const y = Math.min(nextY, canvasTop);

        for (const x of xValues) {
            const newCar = this.#carConstructor({x, y});
            this.traffic.push(newCar);
        }

        this.lastSpawnedCarY = y;
        if (this.debugSpawnCars) {
            console.log(`spawned ${xValues.length} traffic car(s) at y=${y}`);
        }
    }

    draw(ctx: CanvasRenderingContext2D) {
        for (const trafficCar of this.traffic) {
            trafficCar.draw(ctx);
        }
    }

    reset() {
        this.traffic = [];
        this.lastSpawnedCarY = 0;
    }

    createInitialTraffic(road: Road, playerCar: Car) {
        this.lastSpawnedCarY = playerCar.y;

        const create = (xValues: number[]) => {
            const y = this.lastSpawnedCarY - this.spawnDistance;

            for (const x of xValues) {
                const newCar = this.#carConstructor({x, y});
                this.traffic.push(newCar);
            }

            this.lastSpawnedCarY = y;
        }

        create([road.getLaneCenter(1)])
        create([road.getLaneCenter(0), road.getLaneCenter(2)]);
        create([road.getLaneCenter(1), road.getLaneCenter(2)]);
        create([road.getLaneCenter(0)]);
        create([road.getLaneCenter(1), road.getLaneCenter(2)]);
        create([road.getLaneCenter(0), road.getLaneCenter(1)]);
        create([road.getLaneCenter(0), road.getLaneCenter(2)]);
        create([road.getLaneCenter(1)]);
        create([road.getLaneCenter(0)]);
        create([road.getLaneCenter(1)]);
        create([road.getLaneCenter(2)]);
    }

    #carConstructor(point: Point, speed = 4): Car {

        return new Car({
            x: point.x,
            y: point.y,
            width: 50,
            height: 80,
            controls: new ComputerControls(),
            speed: speed,
            maxSpeed: speed,
            color: "orange",
        });
    }
}