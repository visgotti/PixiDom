import { ValidMeasurement } from "./";

export type ElementStyleOptions = {
    width?: ValidMeasurement,
    height?: ValidMeasurement,
}

enum Positions {
    absolute = "absolute",
    relative = "relative",
    fixed = "fixed",
}

enum Displays {
    flex = "flex"
}


export type ElementStyleOptionsParams = {
    width?: number | string,
    height?: number | string,
    borderWidth?: number,
    borderColor?: number,
    borderRadius?: number,
    fontColor?: number,
    highlightedFontColor?: number,
    cursorColor?: number,
    cursorHeight?: number | string,
    cursorWidth: number,
    backgroundColor?: number,
    highlightedBackgroundColor?: number,
    borderOpacity?: number,
    marginLeft?: number | string,
    marginRight?: number | string,
    marginTop?: number | string,
    marginBottom?: number | string,
    paddingLeft?: number | string,
    paddingRight?: number | string,
    paddingTop?: number | string,
    paddingBottom?: number | string,
    position: string
}
