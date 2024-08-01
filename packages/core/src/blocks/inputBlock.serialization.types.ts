import type { Nullable } from "@babylonjs/core";
import type { ConnectionPointType } from "../connection/connectionPointType.js";
import type { IColor3Like, IColor4Like, IVector2Like } from "@babylonjs/core/Maths/math.like.js";

export type TextureInputBlockData = {
    inputType: ConnectionPointType.Texture;
    url: Nullable<string>;
};

export type BooleanInputBlockData = {
    inputType: ConnectionPointType.Boolean;
    value: boolean;
};

export type FloatInputBlockData = {
    inputType: ConnectionPointType.Float;
    value: number;
};

export type Color3InputBlockData = {
    inputType: ConnectionPointType.Color3;
    value: IColor3Like;
};

export type Color4InputBlockData = {
    inputType: ConnectionPointType.Color4;
    value: IColor4Like;
};

export type Vector2InputBlockData = {
    inputType: ConnectionPointType.Vector2;
    value: IVector2Like;
};

export type SerializedInputBlockData =
    | TextureInputBlockData
    | BooleanInputBlockData
    | FloatInputBlockData
    | Color3InputBlockData
    | Color4InputBlockData
    | Vector2InputBlockData;
