import Car from "../Car.ts";
import {FPSCounter} from "./fpsCounter.ts";
import {getAppElement} from "../helpers.ts";

const FPS_ID = 'fps';

const CAR_DISTANCE = 'car-distance';
const CAR_SPEED_ID = 'car-speed';
const CAR_ANGLE_ID = 'car-angle';
const CAR_DAMAGED = 'car-damaged';
const CAR_POSITION_ID = 'car-position';

const CAR_CONTROL_TOP_ID = 'car-control-top';
const CAR_CONTROL_LEFT_ID = 'car-control-left';
const CAR_CONTROL_RIGHT_ID = 'car-control-right';
const CAR_CONTROL_REVERSE_ID = 'car-control-reverse';

const CANVAS_TRANSLATION_ID = 'canvas-translation';

const SENSOR_READING_ = 'sensor-reading-';

type DebugOptions = {
    slimSize: boolean;
    disableCarPosition?: boolean;
    disableCanvasTranslation?: boolean;
    disableControls?: boolean;
    disableSensorReadings?: boolean;
}

export class Debug {
    private readonly slimSize: boolean;
    private readonly showCarPosition: boolean;
    private readonly showCanvasTranslation: boolean;
    private readonly showControls: boolean;
    private readonly showSensorReadings: boolean;

    constructor(
        public readonly car: Car,
        options?: DebugOptions,
    ) {
        this.slimSize = options?.slimSize ?? false;
        this.showCarPosition = !(options?.disableCarPosition ?? false);
        this.showCanvasTranslation = !(options?.disableCanvasTranslation ?? false);
        this.showControls = !(options?.disableControls ?? false);
        this.showSensorReadings = !(options?.disableSensorReadings ?? false);
    }

    createView() {
        const debugElement = document.createElement('div');
        debugElement.style.position = 'absolute';
        debugElement.style.top = '10px';
        debugElement.style.left = '10px';
        debugElement.style.padding = '10px';
        debugElement.style.backgroundColor = 'rgba(255, 255, 255, 0.5)';
        debugElement.style.fontFamily = 'monospace';
        debugElement.style.fontSize = '12px';
        debugElement.style.color = '#000';
        debugElement.style.zIndex = '1000';

        getAppElement().appendChild(debugElement);

        const tableElement = document.createElement('table');
        tableElement.style.width = '100%';

        this.#appendTableRow(
            tableElement,
            'FPS:',
            FPS_ID
        )

        this.#appendTableRow(
            tableElement,
            'Distance:',
            CAR_DISTANCE
        )
        this.#appendTableRow(
            tableElement,
            'Car Speed:',
            CAR_SPEED_ID
        )
        this.#appendTableRow(
            tableElement,
            'Car angle:',
            CAR_ANGLE_ID
        )
        this.#appendTableRow(
            tableElement,
            'Car damaged:',
            CAR_DAMAGED
        )
        if (this.showCarPosition) {
            this.#appendTableRow(
                tableElement,
                'Car position:',
                CAR_POSITION_ID
            )
        }

        if (this.showControls) {
            this.#appendControlsInnerTable(tableElement);
        }

        if (this.showCanvasTranslation) {
            this.#appendTableRow(
                tableElement,
                'Canvas translation:',
                CANVAS_TRANSLATION_ID
            )
        }

        if (this.showSensorReadings) {
            this.#appendTableRow(
                tableElement,
                'Sensor readings:',
                ''
            )

            const rayCount = this.car.sensor?.rayCount ?? 0;
            for (let i = 0; i < rayCount; i++) {
                this.#appendTableRow(
                    tableElement,
                    `  Ray ${i}:`,
                    SENSOR_READING_ + i
                )
            }
        }

        debugElement.appendChild(tableElement);
        return debugElement;
    }

    update(
        ctx: CanvasRenderingContext2D,
        fpsCounter: FPSCounter,
        distanceTravaled: number
    ) {
        this.#updateValue(FPS_ID, fpsCounter.getFps());

        this.#updateValue(CAR_DISTANCE, String(Math.round(distanceTravaled)));
        this.#updateValue(CAR_SPEED_ID, this.car.speed.toFixed(2));
        this.#updateValue(CAR_ANGLE_ID, this.car.angle.toFixed(2));
        this.#updateValue(CAR_DAMAGED, this.car.isDamaged ? 'Yes' : 'No');
        if (this.showCarPosition) {
            this.#updateValue(CAR_POSITION_ID, `(x: ${this.car.x.toFixed(2)}, y: ${this.car.y.toFixed(2)})`);
        }

        if (this.showControls) {
            this.#updateControl(CAR_CONTROL_TOP_ID, this.car.controls.forward());
            this.#updateControl(CAR_CONTROL_LEFT_ID, this.car.controls.left());
            this.#updateControl(CAR_CONTROL_RIGHT_ID, this.car.controls.right());
            this.#updateControl(CAR_CONTROL_REVERSE_ID, this.car.controls.reverse());
        }

        if (this.showCanvasTranslation) {
            const transform = ctx.getTransform();
            this.#updateValue(
                CANVAS_TRANSLATION_ID,
                `(e: ${transform.e.toFixed(2)}, f: ${transform.f.toFixed(2)})`
            );
        }

        if (this.showSensorReadings) {
            const rayCount = this.car.sensor?.rayCount ?? 0;
            for (let i = 0; i < rayCount; i++) {
                const reading = this.car.sensor?.readings[i];
                let readingText = "No obstacle";
                if (reading) {
                    readingText = `(x: ${reading.x.toFixed(2)}, y: ${reading.y.toFixed(2)})`;
                }
                this.#updateValue(
                    SENSOR_READING_ + i,
                    readingText
                );
            }
        }
    }

    #appendTableRow(table: HTMLTableElement, label: string, identifier: string) {
        const row = document.createElement('tr');

        if (!this.slimSize) {
            const labelCell = document.createElement('td');
            labelCell.textContent = label;
            labelCell.style.padding = '4px';
            labelCell.style.textAlign = 'left';
            labelCell.style.fontWeight = 'bold';

            row.appendChild(labelCell);
        }

        const valueCell = document.createElement('td');
        valueCell.id = identifier;
        valueCell.textContent = "-";
        valueCell.style.textAlign = 'left';
        valueCell.style.padding = '4px';

        row.appendChild(valueCell);

        table.appendChild(row);
    }

    #appendControlsInnerTable(table: HTMLTableElement) {
        const row = document.createElement('tr');
        const labelCell = document.createElement('td');
        const valueCell = document.createElement('td');

        const innerTable = document.createElement('table');
        innerTable.style.width = '100%';

        const topRow = document.createElement('tr');
        const topCell = document.createElement('td');
        topCell.style.textAlign = 'center';
        topCell.textContent = "↑";
        topCell.id = CAR_CONTROL_TOP_ID;

        topRow.appendChild(document.createElement('td'));
        topRow.appendChild(topCell);
        topRow.appendChild(document.createElement('td'));
        innerTable.appendChild(topRow);

        const bottomRow = document.createElement('tr');
        const leftCell = document.createElement('td');
        leftCell.style.textAlign = 'left';
        leftCell.textContent = "←";
        leftCell.id = CAR_CONTROL_LEFT_ID;
        const reverseCell = document.createElement('td');
        reverseCell.style.textAlign = 'center';
        reverseCell.textContent = "↓";
        reverseCell.id = CAR_CONTROL_REVERSE_ID;
        const rightCell = document.createElement('td');
        rightCell.style.textAlign = 'right';
        rightCell.textContent = "→";
        rightCell.id = CAR_CONTROL_RIGHT_ID;

        bottomRow.appendChild(leftCell);
        bottomRow.appendChild(reverseCell);
        bottomRow.appendChild(rightCell);

        innerTable.appendChild(bottomRow);
        valueCell.appendChild(innerTable);
        row.appendChild(labelCell);
        row.appendChild(valueCell);
        table.appendChild(row);
    }

    #updateValue(identifier: string, value: string) {
        const element = document.getElementById(identifier);
        if (element && element.textContent !== value) {
            element.textContent = value;
        }
    }

    #updateControl(identifier: string, value: boolean) {
        const element = document.getElementById(identifier);

        if (element) {
            element.style.backgroundColor = value ? 'coral' : 'transparent';
        }
    }
}