
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