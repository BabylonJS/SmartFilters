import type { ISerializedBlockV1, SmartFilter } from "@babylonjs/smart-filters";
import { CompositionBlock } from "./compositionBlock";

/**
 * V1 Composition Deserializer.
 * @param smartFilter - The SmartFilter to deserialize the block into
 * @param serializedBlock - The serialized block data
 * @returns A deserialized CompositionBlock
 */
export function compositionDeserializer(smartFilter: SmartFilter, serializedBlock: ISerializedBlockV1) {
    const block = new CompositionBlock(smartFilter, serializedBlock.name);
    block.alphaMode = serializedBlock.data.alphaMode;
    return block;
}
