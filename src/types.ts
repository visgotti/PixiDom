export const GLOBAL_PIXI_DTA_PROPERTY_KEY = "__pixi-dom-dynamic-texture-atlas";

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

export type LabelOptions = {
    onLabel: string,
    onColor: number,
    offLabel: string,
    offColor: number,
    fontName: string,
}

export enum AnimationType {
    LINEAR = 'linear',
    QUADRATIC = 'quadtratic',
    CUBIC = 'cubic',
    QUARTIC = "quartic",
    QUINTIC = "quintic",
    SINUSOIDAL = "sinusoidal",
    EXPONENTIAL = "exponential",
    CIRCULAR = "circular",
    ELASTIC = "elastic",
    BACK = "back",
}

export type AnimationOptions = {
    type: AnimationType,
    duration: number,
    exclude?: Array<string>
}

export enum ToggleAnimationExclusions {
    background = 'background',
    circle_color = 'circle_color',
    circle_position = 'circle_position',
    label = 'label',
}

export type OutlineOptions = {
    width: number,
    color: number,
}

export type ToggleOptions = {
    width: number,
    height: number,
    borderRadius: number,
    onCircleColor: number,
    offCircleColor: number,
    onBackgroundColor: number,
    offBackgroundColor: number,
    onToggleColor: number,
    offToggleColor: number,
    backgroundOutline?: OutlineOptions,
    labelOptions?: LabelOptions,
    animationOptions?: AnimationOptions,
}
