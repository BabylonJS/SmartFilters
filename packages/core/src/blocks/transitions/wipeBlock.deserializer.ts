import type { SmartFilter } from "../../smartFilter.js";
import { WipeBlock } from "./wipeBlock.js";
import type { ISerializedBlockV1 } from "../../serialization/v1/smartFilterSerialization.types.js";

/**
 * The definition of the extra data serialized for wipe blocks.
 */
export interface ISerializedWipeBlockV1 extends ISerializedBlockV1 {
    /**
     * The extra data of the wipe block.
     */
    data: {
        /**
         * The angle of the wipe.
         */
        angle: number;
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
    return block;
}
