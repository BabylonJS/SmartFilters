import type { Nullable } from "@babylonjs/core/types.js";
import type { ConnectionPointType } from "../connection/connectionPointType.js";
import type { IColor3Like, IColor4Like, IVector2Like } from "@babylonjs/core/Maths/math.like.js";

/**
 * Common data for all InputBlock types
 */
export type InputBlockDataBase = {
    /**
     * If true, this input block should not be exposed as an input connection point when this
     * SmartFilter is loaded as a CustomAggregateBlock.
     */
    isInternal?: boolean;
};

/**
 * The data for an InputBlock for ConnectionPointType.Texture inputs
 */
export type TextureInputBlockData = InputBlockDataBase & {
    /** The type of the input block */
    inputType: ConnectionPointType.Texture;

    /** The URL, if available, of the texture */
    url: Nullable<string>;

    /**
     * If supplied, gives a hint as to which type of texture the URL points to.
     * Default is assumed to be "image"
     */
    urlTypeHint: Nullable<"image" | "video">;

    /**
     * Defines the anisotropic level to use, or default if null
     */
    anisotropicFilteringLevel: Nullable<number>;

    /**
     * Indicates if the Y axis should be flipped, or default if null
     */
    flipY: Nullable<boolean>;

    /**
     * The file extension to use, or default if null.
     */
    forcedExtension: Nullable<string>;
};

/**
 * The data for an InputBlock for ConnectionPointType.Boolean inputs
 */
export type BooleanInputBlockData = InputBlockDataBase & {
    /** The type of the input block */
    inputType: ConnectionPointType.Boolean;

    /** The value of the input block */
    value: boolean;
};

/**
 * The data for an InputBlock for ConnectionPointType.Float inputs
 */
export type FloatInputBlockData = InputBlockDataBase & {
    /** The type of the input block */
    inputType: ConnectionPointType.Float;

    /** The value of the input block */
    value: number;

    /**
     * If supplied, how this should be animated by the editor.  Will not affect runtime behavior.
     */
    animationType: Nullable<"time">;

    /**
     * If supplied, the amount to change the value per millisecond when animating.
     */
    valueDeltaPerMs: Nullable<number>;

    /**
     * The minimum value of the float, used for slider control.
     */
    min: Nullable<number>;

    /**
     * The maximum value of the float, used for slider control.
     */
    max: Nullable<number>;
};

/**
 * The data for an InputBlock for ConnectionPointType.Color3 inputs
 */
export type Color3InputBlockData = InputBlockDataBase & {
    /** The type of the input block */
    inputType: ConnectionPointType.Color3;

    /** The value of the input block */
    value: IColor3Like;
};

/**
 * The data for an InputBlock for ConnectionPointType.Color4 inputs
 */
export type Color4InputBlockData = InputBlockDataBase & {
    /** The type of the input block */
    inputType: ConnectionPointType.Color4;

    /** The value of the input block */
    value: IColor4Like;
};

/**
 * The data for an InputBlock for ConnectionPointType.Vector2 inputs
 */
export type Vector2InputBlockData = InputBlockDataBase & {
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
