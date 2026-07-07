/**
 * @packageDocumentation
 * Type definitions for PixiDom components.
 */

import type { Color } from './color';

export type { Color, RGBColor, RGBTuple, RGBATuple, NormalizedColor } from './color';

/** @internal Global key for dynamic texture atlas storage */
export const GLOBAL_PIXI_DTA_PROPERTY_KEY = "__pixi-dom-dynamic-texture-atlas";

/**
 * Represents a parsed measurement value with its type.
 */
export type MeasurementType = 'pixel' | 'percent';

export type ValidMeasurement = {
    /** The numeric value of the measurement */
    value: number,
    /** The type of measurement: 'percent' or 'pixel' */
    type: MeasurementType,
}

/**
 * Flex layout configuration options (experimental).
 */
export type FlexOptions = {
    /** Direction of flex item layout */
    flexDirection?: FlexDirection,
    /** Whether flex items should wrap */
    flexWrap?: FlexWrap,
    /** Alignment of flex items along the main axis */
    justifyContent?: JustifyContent,
}

/**
 * Justify content options for flex layout.
 */
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
    borderColor?: Color,
    fontColor: Color,
    highlightedFontColor: Color,
    cursorColor: Color,
    backgroundColor: Color,
    highlightedBackgroundColor: Color,
    borderOpacity: number,
    xPadding: number,
    yPadding: number,
}

export type InputStyleOptionsParams = {
    width?: number | string,
    height?: number | string,
    borderWidth?: number,
    borderColor?: Color,
    fontColor?: Color,
    highlightedFontColor?: Color,
    cursorColor?: Color,
    cursorHeight?: number | string,
    cursorWidth: number,
    backgroundColor?: Color,
    highlightedBackgroundColor?: Color,
    borderOpacity?: number,
    xPadding?: number,
    yPadding?: number,
}

/**
 * Configuration for toggle switch labels.
 */
export type LabelOptions = {
    /** Text to display when toggle is ON */
    onLabel: string,
    /** Color of the ON label. Accepts any {@link Color} format. */
    onColor: Color,
    /** Text to display when toggle is OFF */
    offLabel: string,
    /** Color of the OFF label. Accepts any {@link Color} format. */
    offColor: Color,
    /** Name of the bitmap font to use */
    fontName: string,
}

/**
 * Easing function types for animations.
 */
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

/**
 * Configuration options for component animations.
 */
export type AnimationOptions = {
    /** The easing function type to use */
    type: AnimationType,
    /** Duration of the animation in milliseconds */
    duration: number,
    /** Array of animation aspects to exclude */
    exclude?: Array<string>
}

/**
 * Aspects of toggle animation that can be excluded.
 */
export enum ToggleAnimationExclusions {
    /** Exclude background color transition */
    background = 'background',
    /** Exclude circle/handle color transition */
    circle_color = 'circle_color',
    /** Exclude circle/handle position animation */
    circle_position = 'circle_position',
    /** Exclude label fade animation */
    label = 'label',
}

/**
 * Configuration for element outlines/borders.
 */
export type OutlineOptions = {
    /** Width of the outline in pixels */
    width: number,
    /** Color of the outline. Accepts any {@link Color} format. */
    color: Color,
}

/**
 * Configuration options for creating a Toggle component.
 */
export type ToggleOptions = {
    /** Width of the toggle in pixels */
    width: number,
    /** Height of the toggle in pixels */
    height: number,
    /** Border radius as a percentage (0-100) */
    borderRadius: number,
    /** Circle/handle color when toggle is ON. Accepts any {@link Color} format. */
    onCircleColor: Color,
    /** Circle/handle color when toggle is OFF. Accepts any {@link Color} format. */
    offCircleColor: Color,
    /** Background color when toggle is ON. Accepts any {@link Color} format. */
    onBackgroundColor: Color,
    /** Background color when toggle is OFF. Accepts any {@link Color} format. */
    offBackgroundColor: Color,
    /** @deprecated Use onCircleColor instead */
    onToggleColor?: Color,
    /** @deprecated Use offCircleColor instead */
    offToggleColor?: Color,
    /** Initial toggle state (true = ON, false = OFF). Set without triggering animation. */
    startingValue?: boolean,
    /** Optional outline/border for the toggle background */
    backgroundOutline?: OutlineOptions,
    /** Optional text labels for ON/OFF states */
    labelOptions?: LabelOptions,
    /** Optional animation configuration for state transitions */
    animationOptions?: AnimationOptions,
}
