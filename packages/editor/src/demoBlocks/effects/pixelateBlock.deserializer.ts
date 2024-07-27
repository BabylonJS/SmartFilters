import type { IBlockDeserializer, ISerializedBlockV1, SmartFilter } from "@babylonjs/smart-filters";
import { PixelateBlock } from "./pixelateBlock.js";

// TODO: helper for these trivial ones
export const pixelateBlockDeserializer: IBlockDeserializer = {
    className: PixelateBlock.ClassName,
    deserialize: (smartFilter: SmartFilter, serializedBlock: ISerializedBlockV1) => {
        return new PixelateBlock(smartFilter, serializedBlock.name);
    },
};
