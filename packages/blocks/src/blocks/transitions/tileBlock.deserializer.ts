import type { ISerializedBlockV1, SmartFilter } from "@babylonjs/smart-filters";
import { TileBlock } from "./tileBlock.js";

/**
 * The definition of the extra data serialized for tile blocks.
 */
export interface ISerializedTileBlockV1 extends ISerializedBlockV1 {
    /**
     * The extra data of the block.
     */
    data: {
        /**
         * The tile count.
         */
        tileCount: number;
    };
}

/**
 * V1 Tile Deserializer.
 * @param smartFilter - The SmartFilter to deserialize the block into
 * @param serializedBlock - The serialized block data
 * @returns A deserialized TileBlock
 */
export function tileDeserializer(smartFilter: SmartFilter, serializedBlock: ISerializedTileBlockV1) {
    const block = new TileBlock(smartFilter, serializedBlock.name);

    // If data is missing, use the default value set by the block
    block.tileCount = serializedBlock.data.tileCount ?? block.tileCount;
    return block;
}
