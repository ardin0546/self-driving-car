import './style.css'
import Car from "./Car.ts";
import {Road} from "./Road.ts";
import {Debug} from "./debug/debug.ts";
import {ControlType} from "./Controls.ts";
import {FPSCounter} from "./debug/fpsCounter.ts";

const app = document.getElementById('app');
if (!app) {
    throw new Error('Element with id app not found');
}

const canvas = document.createElement('canvas');
canvas.width = 300;
canvas.height = window.innerHeight;
canvas.style.backgroundColor ='lightgray';
app.appendChild(canvas);

const ctx = canvas.getContext('2d');
if (!ctx) {
    throw new Error('Canvas context not found');
}

const laneCount = 3;
const road = new Road(
    canvas.width / 2,
    canvas.width * 0.9,
    laneCount
)
const car = new Car({
    x: road.getLaneCenter(1),
    y: canvas.height - 100,
    width: 50,
    height: 80,
    controlType: ControlType.NEURAL_NETWORK,
    maxSpeed: 5,
    color: "steelblue",
})

const debug = new Debug(car, {
    slimSize: false,
    disableCarPosition: true,
    disableControls: false,
    disableCanvasTranslation: true,
    disableSensorReadings: true,
});
debug.createView();

const traffic = [
    new Car({
        x: road.getLaneCenter(1),
        y: 600,
        width: 50,
        height: 80,
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

const animate = (time: number) => {
    fpsCounter.update(time);

    for(const trafficCar of traffic) {
        trafficCar.update(road, traffic);
    }
    car.update(road, traffic);

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.translate(0, -car.y + canvas.height * 0.8);

    road.draw(ctx);

    for(const trafficCar of traffic) {
        trafficCar.draw(ctx);
    }
    car.draw(ctx);

    debug.update(ctx, fpsCounter)

    ctx.restore();
    requestAnimationFrame(animate);
}

requestAnimationFrame(animate);
