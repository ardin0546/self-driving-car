import Car from "./car.ts";

const CAR_SPEED_ID = 'car-speed';
const CAR_ANGLE_ID = 'car-angle';
const CAR_POSITION_ID = 'car-position';

const CAR_CONTROL_TOP_ID = 'car-control-top';
const CAR_CONTROL_LEFT_ID = 'car-control-left';
const CAR_CONTROL_RIGHT_ID = 'car-control-right';
const CAR_CONTROL_REVERSE_ID = 'car-control-reverse';

const CANVAS_TRANSLATION_ID = 'canvas-translation';

const SENSOR_READING_ = 'sensor-reading-';

export class Debug {
    constructor(
        public readonly car: Car,
    ) {
    }

    createView() {
        const debugElement = document.createElement('div');
        debugElement.style.position = 'absolute';
        debugElement.style.top = '10px';
        debugElement.style.left = '10px';
        debugElement.style.padding = '10px';
        debugElement.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
        debugElement.style.fontFamily = 'monospace';
        debugElement.style.fontSize = '12px';
        debugElement.style.color = '#000';
        debugElement.style.zIndex = '1000';

        document.body.appendChild(debugElement);

        const tableElement = document.createElement('table');
        tableElement.style.width = '100%';

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
            'Car position:',
            CAR_POSITION_ID
        )

        this.#appendControlsInnerTable(tableElement);

        this.#appendTableRow(
            tableElement,
            'Canvas translation:',
            CANVAS_TRANSLATION_ID
        )

        this.#appendTableRow(
            tableElement,
            'Sensor readings:',
            ''
        )

        for (let i = 0; i < this.car.sensor.rayCount; i++) {
            this.#appendTableRow(
                tableElement,
                `  Ray ${i}:`,
                SENSOR_READING_ + i
            )
        }

        debugElement.appendChild(tableElement);
        return debugElement;
    }

    update(ctx: CanvasRenderingContext2D) {
        this.#updateValue(CAR_SPEED_ID, this.car.speed.toFixed(2) + ' px/s');
        this.#updateValue(CAR_ANGLE_ID, this.car.angle.toFixed(2) + ' rad');
        this.#updateValue(CAR_POSITION_ID, `(x: ${this.car.x.toFixed(2)}, y: ${this.car.y.toFixed(2)})`);

        this.#updateControl(CAR_CONTROL_TOP_ID, this.car.controls.forward);
        this.#updateControl(CAR_CONTROL_LEFT_ID, this.car.controls.left);
        this.#updateControl(CAR_CONTROL_RIGHT_ID, this.car.controls.right);
        this.#updateControl(CAR_CONTROL_REVERSE_ID, this.car.controls.reverse);

        const transform = ctx.getTransform();
        this.#updateValue(
            CANVAS_TRANSLATION_ID,
            `(e: ${transform.e.toFixed(2)}, f: ${transform.f.toFixed(2)})`
        );

        for (let i = 0; i < this.car.sensor.rayCount; i++) {
            const reading = this.car.sensor.readings[i];
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

    #appendTableRow(table: HTMLTableElement, label: string, identifier: string) {
        const row = document.createElement('tr');

        const labelCell = document.createElement('td');
        labelCell.textContent = label;
        labelCell.style.padding = '4px';
        labelCell.style.textAlign = 'left';
        labelCell.style.fontWeight = 'bold';

        const valueCell = document.createElement('td');
        valueCell.id = identifier;
        valueCell.textContent = "-";
        valueCell.style.textAlign = 'left';
        valueCell.style.padding = '4px';

        row.appendChild(labelCell);
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
            element.style.backgroundColor = value ? 'lightgray' : 'transparent';
        }
    }
}