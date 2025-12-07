import './style.css'
import Car from "./Car.ts";
import {Road} from "./Road.ts";
import {Debug} from "./debug/debug.ts";
import {FPSCounter} from "./debug/fpsCounter.ts";
import {Sensor} from "./Sensor.ts";
import {ComputerControls} from "./controls/ComputerControls.ts";
// @ts-ignore
import KeyboardControl from "./controls/KeyboardControl.ts";
import NeuralNetworkControls from "./controls/NeuralNetworkControls.ts";
import {Network} from "./neural-network/Network.ts";
import Visualizer from "./neural-network/Visualizer.ts";
import {getAppElement} from "./helpers.ts";

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

const neuralNetworkControls = new NeuralNetworkControls();
const car = new Car({
    x: road.getLaneCenter(1),
    y: canvas.height - 100,
    width: 50,
    height: 80,
    controls: neuralNetworkControls,
    // controls: new KeyboardControl(),
    maxSpeed: 5,
    color: "steelblue",
})
const carSensor = new Sensor(car, 10, 150, Math.PI / 1.5);
const neuralNetwork = new Network([
    carSensor.rayCount,
    6,
    4,
]);

const networkVisualizer = new Visualizer(neuralNetwork);

const debug = new Debug(car, {
    slimSize: false,
    disableCarPosition: true,
    disableControls: false,
    disableCanvasTranslation: true,
    disableSensorReadings: true,
});
debug.createView();

// @todo create traffic manager class
// - removes traffic out of bounds
// - spawns new traffic at random positions
const traffic = [
    new Car({
        x: road.getLaneCenter(1),
        y: 600,
        width: 50,
        height: 80,
        controls: new ComputerControls(),
        maxSpeed: 4,
        color: "orange",
    }),
    // new Car({
    //     x: road.getLaneCenter(2),
    //     y: -200,
    //     width: 50,
    //     height: 80,
    //     maxSpeed: 2,
    //     color: "orange",
    // }),
    // new Car({
    //     x: road.getLaneCenter(0),
    //     y: canvas.height - 200,
    //     width: 50,
    //     height: 80,
    //     maxSpeed: 5,
    //     color: "orange",
    // }),
    // new Car({
    //     x: road.getLaneCenter(1),
    //     y: 200,
    //     width: 50,
    //     height: 80,
    //     speed: 12,
    //     maxSpeed: 8,
    //     color: "orange",
    //     acceleration: 0.15
    // }),
]

const fpsCounter = new FPSCounter();

let lastTime = 0;
let distanceTraveled = 0;

const animate = (time: number) => {
    const deltaTime = (time - lastTime) / 1000; // convert ms to seconds
    lastTime = time;
    fpsCounter.update(time);

    for (const trafficCar of traffic) {
        trafficCar.update(road, traffic);
    }
    car.update(road, traffic);
    carSensor.update(road, traffic);
    neuralNetworkControls.update(carSensor, neuralNetwork);

    // Accumulate distance based on the car's forward speed
    distanceTraveled += Math.abs(car.speed) * deltaTime;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.translate(0, -car.y + canvas.height * 0.8);

    road.draw(ctx);

    for (const trafficCar of traffic) {
        trafficCar.draw(ctx);
    }
    car.draw(ctx);
    carSensor.draw(ctx);

    networkVisualizer.drawNetwork(time);

    debug.update(ctx, fpsCounter, distanceTraveled)

    ctx.restore();
    requestAnimationFrame(animate);
}

requestAnimationFrame(animate);
