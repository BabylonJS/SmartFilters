import type { BaseBlock } from "../blocks/baseBlock.js";
import type { SmartFilter } from "../smartFilter.js";
import type { ISerializedBlockV1 } from "./v1/ISerializedBlockV1.js";
import type { ThinEngine } from "@babylonjs/core/Engines/thinEngine";

export type DeserializeBlockV1 = (
    smartFilter: SmartFilter,
    serializedBlock: ISerializedBlockV1,
    engine: ThinEngine
) => BaseBlock;

export interface IBlockDeserializerV1 {
    className: string;
    deserialize: DeserializeBlockV1;
}
