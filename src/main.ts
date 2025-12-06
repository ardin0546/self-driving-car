import './style.css'
import Car from "./car.ts";
import {Road} from "./road.ts";
import {Debug} from "./debug/debug.ts";
import {ControlType} from "./controls.ts";
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
    controlType: ControlType.KEYBOARD,
    color: "steelblue",
})

const debug = new Debug(car, {
    disableSensorReadings: false,
});
debug.createView();

const traffic = [
    new Car({
        x: road.getLaneCenter(0),
        y: 100,
        width: 50,
        height: 80,
        maxSpeed: 3,
        color: "orange",
    }),
    new Car({
        x: road.getLaneCenter(2),
        y: -200,
        width: 50,
        height: 80,
        maxSpeed: 2,
        color: "orange",
    })
]

const fpsCounter = new FPSCounter();

const animate = (time: number) => {
    fpsCounter.update(time);

    for(const trafficCar of traffic) {
        trafficCar.update(road);
    }
    car.update(road, traffic);

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.translate(0, -car.y + canvas.height * 0.9);

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
