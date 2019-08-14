import { ValidMeasurement } from "./";

export type InputStyleOptions = {
    width?: ValidMeasurement,
    height?: ValidMeasurement,
    cursorHeight: ValidMeasurement,
    cursorWidth: number,
    borderWidth?: number,
    borderColor?: number,
    fontColor: number,
    highlightedFontColor: number,
    cursorColor: number,
    backgroundColor: number,
    highlightedBackgroundColor: number,
    borderOpacity: number,
    xPadding: number,
    yPadding: number,
}

export type InputStyleOptionsParams = {
    width?: number | string,
    height?: number | string,
    borderWidth?: number,
    borderColor?: number,
    fontColor?: number,
    highlightedFontColor?: number,
    cursorColor?: number,
    cursorHeight?: number | string,
    cursorWidth: number,
    backgroundColor?: number,
    highlightedBackgroundColor?: number,
    borderOpacity?: number,
    xPadding?: number,
    yPadding?: number,
}
