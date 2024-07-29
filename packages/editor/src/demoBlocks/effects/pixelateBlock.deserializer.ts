import type { IBlockDeserializer, ISerializedBlockV1, SmartFilter } from "@babylonjs/smart-filters";
import { PixelateBlock } from "./pixelateBlock.js";
import type { ThinEngine } from "@babylonjs/core/Engines/thinEngine.js";

// TODO: helper for these trivial ones
export const pixelateBlockDeserializer: IBlockDeserializer = {
    className: PixelateBlock.ClassName,
    deserialize: (_engine: ThinEngine, smartFilter: SmartFilter, serializedBlock: ISerializedBlockV1) => {
        return new PixelateBlock(smartFilter, serializedBlock.name);
    },
};
