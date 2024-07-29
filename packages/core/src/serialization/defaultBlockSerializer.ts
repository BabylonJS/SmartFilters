import type { BaseBlock } from "../blocks/baseBlock";
import type { SerializeBlockV1 } from "./smartFilterSerializer.types";
import type { ISerializedBlockV1 } from "./v1/ISerializedBlockV1";

export const defaultBlockSerializer: SerializeBlockV1 = (block: BaseBlock): ISerializedBlockV1 => {
    return {
        name: block.name,
        className: block.getClassName(),
        comments: "", // TODO
        data: undefined,
    };
};
