import { type SmartFilter, type DeserializeBlockV1, type ISerializedBlockV1 } from "@babylonjs/smart-filters";
import { BlackAndWhiteBlockName, PixelateBlockName } from "./blocks/blockNames";

/**
 * Generates the Map of block deserializers used when loaded serialized Smart Filters.
 *
 * Important notes:
 *   1. Do not import the block code directly in this file. Instead, use dynamic imports to ensure that the block code
 *      is only loaded when needed.
 *   2. If the deserializer is trivial (doesn't require consulting the serializedBlock.data), it can be implemented here
 *   3. If the deserializer is non-trivial (needs serializedBlock.data), implement it in a separate file alongside the block
 *      in the form blockClassName.deserializer.ts
 */
export function getBlockDeserializers(): Map<string, DeserializeBlockV1> {
    const deserializers = new Map<string, DeserializeBlockV1>();

    deserializers.set(PixelateBlockName, async (smartFilter: SmartFilter, serializedBlock: ISerializedBlockV1) => {
        const module = await import(/* webpackChunkName: "pixelateBlock" */ "./blocks/effects/pixelateBlock");
        return new module.PixelateBlock(smartFilter, serializedBlock.name);
    });

    deserializers.set(BlackAndWhiteBlockName, async (smartFilter: SmartFilter, serializedBlock: ISerializedBlockV1) => {
        const module = await import(/* webpackChunkName: "blackAndWhiteBlock" */ "./blocks/effects/blackAndWhiteBlock");
        return new module.BlackAndWhiteBlock(smartFilter, serializedBlock.name);
    });

    return deserializers;
}
