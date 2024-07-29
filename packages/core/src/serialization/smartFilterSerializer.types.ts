import type { BaseBlock } from "../blocks/baseBlock";
import type { ISerializedBlockV1 } from "./v1/ISerializedBlockV1";

export type SerializeBlockV1 = (block: BaseBlock) => ISerializedBlockV1;

export interface IBlockSerializer {
    className: string;
    serialize: SerializeBlockV1;
}
