import type { Nullable } from "@babylonjs/core";
import type { ConnectionPointType } from "../connection/connectionPointType.js";
import type { IColor3Like, IColor4Like, IVector2Like } from "@babylonjs/core/Maths/math.like.js";

/**
 * The data for an InputBlock for ConnectionPointType.Texture inputs
 */
export type TextureInputBlockData = {
    /** The type of the input block */
    inputType: ConnectionPointType.Texture;

    /** The URL, if available, of the texture */
    url: Nullable<string>;
};

/**
 * The data for an InputBlock for ConnectionPointType.Boolean inputs
 */
export type BooleanInputBlockData = {
    /** The type of the input block */
    inputType: ConnectionPointType.Boolean;

    /** The value of the input block */
    value: boolean;
};

/**
 * The data for an InputBlock for ConnectionPointType.Float inputs
 */
export type FloatInputBlockData = {
    /** The type of the input block */
    inputType: ConnectionPointType.Float;

    /** The value of the input block */
    value: number;
};

/**
 * The data for an InputBlock for ConnectionPointType.Color3 inputs
 */
export type Color3InputBlockData = {
    /** The type of the input block */
    inputType: ConnectionPointType.Color3;

    /** The value of the input block */
    value: IColor3Like;
};

/**
 * The data for an InputBlock for ConnectionPointType.Color4 inputs
 */
export type Color4InputBlockData = {
    /** The type of the input block */
    inputType: ConnectionPointType.Color4;

    /** The value of the input block */
    value: IColor4Like;
};

/**
 * The data for an InputBlock for ConnectionPointType.Vector2 inputs
 */
export type Vector2InputBlockData = {
    /** The type of the input block */
    inputType: ConnectionPointType.Vector2;

    /** The value of the input block */
    value: IVector2Like;
};

/**
 * Type union of all possible InputBlock data types
 */
export type SerializedInputBlockData =
    | TextureInputBlockData
    | BooleanInputBlockData
    | FloatInputBlockData
    | Color3InputBlockData
    | Color4InputBlockData
    | Vector2InputBlockData;
