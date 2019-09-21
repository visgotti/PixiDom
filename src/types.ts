export type ValidMeasurement = {
    value: number,
    type: string, // percent or pixel
}

export type FlexOptions = {
    flexDirection?: FlexDirection,
    flexWrap?: FlexWrap,
    justifyContent?: JustifyContent,
}

export enum JustifyContent {
    flexStart = "flex-start",
    flexEnd = "flex-end",
    center = "center",
    spaceBetween = "spaceBetween",
    spaceAround = "spaceAround",
    spaceEvenly = "spaceEvenly",
}

export enum FlexDirection {
    row = "row",
    row_reverse = "row-reverse",
    column = "column",
    column_reverse = "column-reverse"
}

export enum FlexWrap {
    nowrap = "nowrap",
    wrap = "wrap",
    wrap_reverse = "wrap-reverse"
}

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