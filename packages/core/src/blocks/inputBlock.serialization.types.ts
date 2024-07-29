import type { Nullable } from "@babylonjs/core";
import type { ConnectionPointType } from "../connection/connectionPointType.js";

export type SerializedTextureInputBlockData = {
    inputType: ConnectionPointType.Texture;
    url: Nullable<string>;
};

export type SerializedBooleanInputBlockData = {
    inputType: ConnectionPointType.Boolean;
    value: boolean;
};

export type SerializedFloatInputBlockData = {
    inputType: ConnectionPointType.Float;
    value: number;
};

export type SerializedInputBlockData =
    | SerializedTextureInputBlockData
    | SerializedBooleanInputBlockData
    | SerializedFloatInputBlockData;
