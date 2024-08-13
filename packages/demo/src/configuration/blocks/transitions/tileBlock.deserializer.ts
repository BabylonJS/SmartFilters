import type { ISerializedBlockV1, SmartFilter } from "@babylonjs/smart-filters";
import { TileBlock } from "./tileBlock";

/**
 * V1 Tile Deserializer.
 * @param smartFilter - The SmartFilter to deserialize the block into
 * @param serializedBlock - The serialized block data
 * @returns A deserialized TileBlock
 */
export function tileDeserializer(smartFilter: SmartFilter, serializedBlock: ISerializedBlockV1) {
    const block = new TileBlock(smartFilter, serializedBlock.name);
    block.tileCount = serializedBlock.data.tileCount;
    return block;
}
