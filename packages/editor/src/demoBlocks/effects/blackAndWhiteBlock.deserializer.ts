import type { IBlockDeserializer, ISerializedBlockV1, SmartFilter } from "@babylonjs/smart-filters";
import { BlackAndWhiteBlock } from "./blackAndWhiteBlock.js";
import type { ThinEngine } from "@babylonjs/core/Engines/thinEngine.js";

export const blackAndWhiteBlockDeserializer: IBlockDeserializer = {
    className: BlackAndWhiteBlock.ClassName,
    deserialize: (_engine: ThinEngine, smartFilter: SmartFilter, serializedBlock: ISerializedBlockV1) => {
        return new BlackAndWhiteBlock(smartFilter, serializedBlock.name);
    },
};
