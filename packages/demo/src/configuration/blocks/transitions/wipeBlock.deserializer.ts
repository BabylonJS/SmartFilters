import type { ISerializedBlockV1, SmartFilter } from "@babylonjs/smart-filters";
import { WipeBlock } from "./wipeBlock";

/**
 * V1 Wipe Deserializer.
 * @param smartFilter - The SmartFilter to deserialize the block into
 * @param serializedBlock - The serialized block data
 * @returns A deserialized WipeBlock
 */
export function wipeDeserializer(smartFilter: SmartFilter, serializedBlock: ISerializedBlockV1) {
    const block = new WipeBlock(smartFilter, serializedBlock.name);
    block.angle = serializedBlock.data.angle;
    block.size = serializedBlock.data.size;
    return block;
}
