import Car from "./Car.ts";
import {ComputerControls} from "./controls/ComputerControls.ts";
import {Road} from "./Road.ts";
import {Point} from "./types";

type Options = {
    disableAutomatedTraffic?: boolean,
    debugSpawnCars?: boolean,
}

type CarConstructorOptions = {
    speed?: number,
    color?: string,
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
            trafficCar.update(road, []);
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

    increaseDifficulty() {
        this.spawnDistance = Math.max(200, this.spawnDistance -= 50);
        console.log(`increased traffic difficulty, new spawn distance: ${this.spawnDistance}`);
    }

    spawnNext(road: Road, canvasTop: number) {
        const a = road.getLaneCenter(Math.floor(Math.random() * road.laneCount));
        const b = road.getLaneCenter(Math.floor(Math.random() * road.laneCount));

        const xValues = a === b ? [a] : [a, b];

        const nextY = this.lastSpawnedCarY - this.spawnDistance;
        const y = Math.min(nextY, canvasTop);


        for (const x of xValues) {
            // const speed = Math.random() * 2 + 3; // random speed between 2 and 5
            // const newCar = this.#carConstructor({x, y}, speed);
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
        this.spawnDistance = 500;
    }

    createInitialTraffic(road: Road, playerCar: Car) {
        this.lastSpawnedCarY = playerCar.y;

        const create = (lanes: number[]) => {
            const y = this.lastSpawnedCarY - this.spawnDistance;

            for (const lane of lanes) {
                const x = road.getLaneCenter(lane)
                const newCar = this.#carConstructor({x, y}, {color: "darkorchid"});
                this.traffic.push(newCar);
            }

            this.lastSpawnedCarY = y;
        }

        create([1])
        create([0, 2]);
        create([1, 2]);
        create([0]);
        create([1, 2]);
        create([0, 1]);
        create([0, 2]);
        create([1]);
        create([0]);
        create([1]);
        create([2]);
    }

    #carConstructor(point: Point, options?: CarConstructorOptions): Car {
        return new Car({
            x: point.x,
            y: point.y,
            width: 50,
            height: 80,
            controls: new ComputerControls(),
            speed: options?.speed ?? 3,
            maxSpeed: options?.speed ?? 3,
            color: options?.color ?? "orange",
        });
    }
}