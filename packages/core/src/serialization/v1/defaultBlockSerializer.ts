import type { BaseBlock } from "../../blocks/baseBlock";
import type { ISerializedBlockV1, SerializeBlockV1 } from "./serialization.types";

export const defaultBlockSerializer: SerializeBlockV1 = (block: BaseBlock): ISerializedBlockV1 => {
    return {
        name: block.name,
        uniqueId: block.uniqueId,
        className: block.getClassName(),
        comments: block.comments,
        data: undefined,
    };
};
