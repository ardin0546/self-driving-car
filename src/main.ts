import './style.css'
import Car from "./car.ts";
import {Road} from "./road.ts";

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
const car = new Car(
    road.getLaneCenter(1),
    canvas.height - 100,
    50,
    80,
)

road.draw(ctx);
car.draw(ctx)

const animate = () => {
    car.update(road);

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.translate(0, -car.y + canvas.height * 0.7);
    // ctx.translate(canvas.width / 2, canvas.height / 2);

    road.draw(ctx);
    car.draw(ctx);

    ctx.restore();
    requestAnimationFrame(animate);
}

animate();
