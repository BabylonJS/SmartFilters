import type { ISerializedBlockV1, SmartFilter } from "@babylonjs/smart-filters";
import { WipeBlock } from "./wipeBlock";

export interface ISerializedWipeBlockV1 extends ISerializedBlockV1 {
    data: {
        angle: number;
        size: number;
    };
}

/**
 * V1 Wipe Deserializer.
 * @param smartFilter - The SmartFilter to deserialize the block into
 * @param serializedBlock - The serialized block data
 * @returns A deserialized WipeBlock
 */
export function wipeDeserializer(smartFilter: SmartFilter, serializedBlock: ISerializedBlockV1) {
    const block = new WipeBlock(smartFilter, serializedBlock.name);

    // If data is missing, use the default value set by the block
    block.angle = serializedBlock.data.angle ?? block.angle;
    block.size = serializedBlock.data.size ?? block.size;
    return block;
}
