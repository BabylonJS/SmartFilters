import type { Nullable } from "@babylonjs/core";

export interface ISerializedBlockV1 {
    name: string;
    className: string;
    comments: Nullable<string>;
    data: any;
}
