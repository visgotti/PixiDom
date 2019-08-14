import { parseLengthMeasurements } from "../utils";

type ValidMeasurement = {
    value: number,
    type: string, // percent or pixel
}

export type StyleOptions = {
    width?: ValidMeasurement,
    height?: ValidMeasurement,
}

export type StyleOptionsParams = {
    width?: number | string,
    height?: number | string,
}


const lengthFieldsToValidate = ["width", "height", "cursorHeight"];

class Div extends PIXI.Container {
    constructor(styleOptions) {
        super();
    }
}

