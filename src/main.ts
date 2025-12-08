import './style.css'
import Car from "./Car.ts";
import {Road} from "./Road.ts";
import {Debug} from "./debug/debug.ts";
import {FPSCounter} from "./debug/fpsCounter.ts";
import {Sensor} from "./Sensor.ts";
// @ts-ignore
import KeyboardControl from "./controls/KeyboardControl.ts";
import NeuralNetworkControls from "./controls/NeuralNetworkControls.ts";
import {Network} from "./neural-network/Network.ts";
import Visualizer from "./neural-network/Visualizer.ts";
import {getAppElement} from "./helpers.ts";
import TrafficManager from "./TrafficManager.ts";
import Storage from "./neural-network/Storage.ts";
import Controls from "./controls/Controls.ts";

type CarBatch = {
    car: Car,
    controls: Controls,
    sensor: Sensor,
    network: Network,
}

const canvas = document.createElement('canvas');
canvas.width = 300;
canvas.height = window.innerHeight;
canvas.style.backgroundColor = 'lightgray';
getAppElement().appendChild(canvas);

const ctx = canvas.getContext('2d');
if (!ctx) {
    throw new Error('Canvas context not found');
}

const road = new Road(
    canvas.width / 2,
    canvas.width * 0.9,
    3
)

const generateCarBatch = (batchSize: number): CarBatch[] => {
    const batches: CarBatch[] = [];
    for (let i = 0; i < batchSize; i++) {
        const controls = new NeuralNetworkControls();

        const car = new Car({
            x: road.getLaneCenter(1),
            y: canvas.height - 100,
            width: 50,
            height: 80,
            maxSpeed: 6,
            controls: controls,
            color: "steelblue",
        });
        const sensor = new Sensor(car, 5, 250, Math.PI / 1.5);
        const network = new Network([
            sensor.rayCount,
            6,
            4,
        ]);
        batches.push({car, controls: controls, sensor, network});
    }

    return batches;
}

const carBatches: CarBatch[] = generateCarBatch(1);
let bestCar = carBatches[0];

const storage = new Storage(bestCar);
const savedNetwork = storage.load();
if (savedNetwork) {
    for (const carBatch of carBatches) {
        carBatch.network = JSON.parse(savedNetwork) as Network;
        if (carBatch !== bestCar) {
            Network.mutate(carBatch.network, 0.15);
        }
    }
}

const networkVisualizer = new Visualizer();

const debug = new Debug({
    slimSize: false,
    disableCarPosition: true,
    disableControls: false,
    disableCanvasTranslation: true,
    disableSensorReadings: true,
});
debug.createView();

const trafficManager = new TrafficManager(road, {
    // disableAutomatedTraffic: false,
})
const fpsCounter = new FPSCounter();

let lastTime = 0;
let distanceTraveled = 0;

const animate = (time: number) => {
    const deltaTime = (time - lastTime) / 1000; // convert ms to seconds
    lastTime = time;
    fpsCounter.update(time);

    for (const {car, sensor, network, controls} of carBatches) {
        if (car.isDamaged) {
            continue;
        }
        car.update(road, trafficManager.getTraffic());
        sensor.update(road, trafficManager.getTraffic());
        if (controls instanceof NeuralNetworkControls) {
            controls.update(sensor, network);
        }
    }

    const minCarY = Math.min(...carBatches.map(carBatch => carBatch.car.y));
    const newBestCar = carBatches.find(carBatch => carBatch.car.y === minCarY);
    if (newBestCar) {
        bestCar = newBestCar;
        storage.setBestCar(bestCar);
    }

    trafficManager.update(canvas, road, bestCar.car);

    // Accumulate distance based on the car's forward speed
    distanceTraveled += Math.abs(bestCar.car.speed) * deltaTime;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();

    ctx.translate(0, -bestCar.car.y + canvas.height * 0.8);

    road.draw(ctx);

    trafficManager.draw(ctx);

    for (const {car} of carBatches) {
        ctx.globalAlpha = car === bestCar.car ? 1 : 0.2;
        car.draw(ctx);
    }
    ctx.globalAlpha = 1;
    bestCar.sensor.draw(ctx);

    networkVisualizer.drawNetwork(time, bestCar.network);

    debug.update(ctx, bestCar.car, carBatches.map(c => c.car), fpsCounter, distanceTraveled)

    ctx.restore();
    requestAnimationFrame(animate);
}

requestAnimationFrame(animate);
