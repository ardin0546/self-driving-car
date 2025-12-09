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
    // @todo remove control, is already in car
    controls: Controls,
    sensor: Sensor,
    network: Network,
}

const CAR_BATCH_COUNT = 1000;

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
const storage = new Storage();

const loaded = storage.load();
let highestDistance = loaded?.distance ?? 0;
let numberOfIterations = loaded?.iteration ?? 0;

const calculateMutationRate = (iteration: number): number => {
    if (numberOfIterations < 5) {
        return 0.1;
    }

    let mutate;

    if (numberOfIterations > 10) {
        mutate = 0.01;
    } else {
        mutate = 0.05;
    }

    mutate += (Math.abs(numberOfIterations - iteration) * 0.01)
    mutate = Math.round(mutate * 100) / 100;

    return mutate;
}

const generateCarBatch = (): CarBatch[] => {
    const batches: CarBatch[] = [];

    let log = true;

    for (let i = 0; i < CAR_BATCH_COUNT; i++) {
        const controls = new NeuralNetworkControls();

        const car = new Car({
            x: road.getLaneCenter(1),
            y: canvas.height - 100,
            width: 50,
            height: 80,
            maxSpeed: 7,
            controls: controls,
            color: "steelblue",
        });
        const sensor = new Sensor(car, 11, 250, Math.PI / 1.2);

        let network: Network;

        const loaded = storage.load()
        if (loaded) {
            network = loaded.network;
            if (i !== 0) {
                const mutationRate = calculateMutationRate(100);
                if (log) {
                    console.log(`Applying mutation rate of ${mutationRate} (iteration ${numberOfIterations} vs loaded ${loaded.iteration})`);
                    log = false;
                }

                Network.mutate(network, mutationRate);
            }
        } else {
            network = new Network([
                sensor.rayCount,
                6,
                4,
            ]);
        }

        batches.push({car, controls: controls, sensor, network});

    }

    return batches;
}

let carBatches: CarBatch[] = generateCarBatch();
let bestCar = carBatches[0];
let selectedCar: CarBatch | null = null;

const networkVisualizer = new Visualizer();

const debug = new Debug({
    slimSize: false,
    disableCarPosition: true,
    disableControls: false,
    disableCanvasTranslation: true,
    disableSensorReadings: true,
});
debug.createView();

const trafficManager = new TrafficManager({
    debugSpawnCars: false,
})
trafficManager.createInitialTraffic(road, bestCar.car)

let fpsCounter = new FPSCounter();

let rafId: number | null = null;

let isPaused = false;
let lastTime = 0;
let distanceTraveled = 0;

const distanceGap = 150;
let nextDistanceCheckpoint = distanceTraveled - distanceGap;

let timeout: number | null = null;

const restart = () => {
    // cancel any running RAF to avoid duplicate loops
    if (rafId !== null) {
        cancelAnimationFrame(rafId);
        rafId = null;
    }

    Car.nextId = 1;

    carBatches = generateCarBatch();
    bestCar = carBatches[0];

    trafficManager.reset();
    trafficManager.createInitialTraffic(road, bestCar.car);
    distanceTraveled = 0;

    numberOfIterations++;

    selectedCar = null;
    isPaused = false;
    lastTime = performance.now();
    fpsCounter = new FPSCounter();

    if (timeout) {
        clearTimeout(timeout);
        timeout = null;
    }

    console.log('starting iteration', numberOfIterations);
    timeout = window.setTimeout(() => {
        // set lastTime again at the moment we're about to animate (safer)
        lastTime = performance.now();
        rafId = requestAnimationFrame(animate);
        timeout = null;
    }, 500);
}

const animate = (time: number) => {
    const deltaTime = (time - lastTime) / 1000; // convert ms to seconds
    lastTime = time;
    fpsCounter.update(time);

    const minCarY = Math.min(...carBatches.map(carBatch => carBatch.car.y));
    const newBestCar = carBatches.find(carBatch => carBatch.car.y === minCarY);
    if (newBestCar) {
        bestCar = newBestCar;
    }

    // const maxCarY = Math.max(
    //     ...carBatches
    //         .filter(carBatch => !carBatch.car.isDamaged)
    //         .map(carBatch => carBatch.car.y)
    // );
    // const worstCar = carBatches.find(carBatch => carBatch.car.y === maxCarY);
    // if (worstCar) {
    //     selectedCar = worstCar;
    // }

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

    if (!bestCar.car.isDamaged && timeout) {
        clearTimeout(timeout);
        timeout = null;
    }

    if (bestCar.car.isDamaged && !timeout) {
        timeout = setTimeout(() => {
            isPaused = true;
            console.log('Best car is damaged. Pausing simulation.');

            if (distanceTraveled > highestDistance) {
                console.log('saving new network..', bestCar.network)
                storage.save(
                    distanceTraveled,
                    bestCar.network,
                    numberOfIterations + 1,
                )
                highestDistance = distanceTraveled;
            }

            restart();
        }, 3_000);
    }

    trafficManager.update(canvas, road, bestCar.car);

    // Accumulate distance based on the car's forward speed
    distanceTraveled += bestCar.car.speed * deltaTime;
    nextDistanceCheckpoint += bestCar.car.speed * deltaTime;
    if (nextDistanceCheckpoint > 0) {
        nextDistanceCheckpoint = -distanceGap;
        trafficManager.increaseDifficulty();
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();

    const cameraBatchCar = selectedCar ? selectedCar : bestCar;
    ctx.translate(0, -cameraBatchCar.car.y + canvas.height - cameraBatchCar.car.width - 50);

    road.draw(ctx);

    trafficManager.draw(ctx);

    for (const {car} of carBatches) {
        ctx.globalAlpha = car === bestCar.car ? 1 : 0.2;
        car.draw(ctx);
    }
    ctx.globalAlpha = 1;
    cameraBatchCar.sensor.draw(ctx);
    ctx.restore();

    networkVisualizer.drawNetwork(time, bestCar.network);

    debug.update(ctx, cameraBatchCar.car, carBatches.map(c => c.car), fpsCounter, highestDistance, nextDistanceCheckpoint, distanceTraveled, numberOfIterations)
    if (!isPaused) {
        rafId = requestAnimationFrame(animate);
    } else {
        rafId = null;
    }
}

requestAnimationFrame(animate);

declare type Window = {
    resetSelectedCar: () => void;
    goToCar: (id: number) => void;
    nextSelectedCar: () => void;
    activeCars: () => void;
}

declare global {
    interface Window {
        kill: (id: number) => void;
        resetSelectedCar: () => void;
        goToCar: (id: number) => void;
        nextSelectedCar: () => void;
        activeCars: () => void;
        increaseDifficulty: () => void;
        reset: () => void;
        saveCurrentNetwork: () => void;
        discardNetwork: () => void;
    }
}

window.resetSelectedCar = () => {
    selectedCar = null;
}
window.kill = (carId: number) => {
    const carBatch = carBatches.find(cb => cb.car.id === carId);
    if (carBatch) {
        carBatch.car.isDamaged = true;
    }
};
window.activeCars = () => {
    console.log(carBatches.filter(carBatch => !carBatch.car.isDamaged).sort((a, b) => a.car.y - b.car.y).map(carBath => ({
        id: carBath.car.id,
        y: carBath.car.y,
    })))
}
// replace existing goToCar
window.goToCar = (id: number) => {
    const carBatch = carBatches.find(cb => cb.car.id === id);
    if (!carBatch) {
        console.warn(`[goToCar] no car with id ${id}`);
        return;
    }

    // Optionally prevent focusing damaged cars — remove check if you want to allow that
    if (carBatch.car.isDamaged) {
        console.warn(`[goToCar] car ${id} is damaged; selecting anyway.`);
        // if you DON'T want to select damaged cars, uncomment:
        // return;
    }

    const prevId = selectedCar?.car.id ?? null;
    selectedCar = carBatch; // set to the exact object from carBatches
    console.log(`[goToCar] selectedCar changed: ${prevId} -> ${selectedCar.car.id}`);
};

window.increaseDifficulty = () => {
    trafficManager.increaseDifficulty();
}

window.reset = () => restart();
window.saveCurrentNetwork = () => {
    storage.save(
        distanceTraveled,
        bestCar.network,
        numberOfIterations,
    )
}
window.discardNetwork = () => {
    storage.discard();
    window.location.reload();
}

window.addEventListener('keypress', (event) => {
    console.log('event', event.key)
    if (event.key === 'Enter' || event.key === 'p') {
        isPaused = !isPaused;
        if (!isPaused) {
            requestAnimationFrame(animate);
        }

        if (timeout) {
            clearTimeout(timeout);
            timeout = null;
        }
    }
})
