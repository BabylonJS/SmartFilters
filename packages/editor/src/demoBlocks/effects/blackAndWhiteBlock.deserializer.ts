import type { IBlockDeserializer, ISerializedBlockV1, SmartFilter } from "@babylonjs/smart-filters";
import { BlackAndWhiteBlock } from "./blackAndWhiteBlock.js";

export const blackAndWhiteBlockDeserializer: IBlockDeserializer = {
    className: BlackAndWhiteBlock.ClassName,
    deserialize: (smartFilter: SmartFilter, serializedBlock: ISerializedBlockV1) => {
        return new BlackAndWhiteBlock(smartFilter, serializedBlock.name);
    },
};
