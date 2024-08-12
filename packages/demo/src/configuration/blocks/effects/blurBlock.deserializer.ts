import type { ISerializedBlockV1, SmartFilter } from "@babylonjs/smart-filters";
import { BlurBlock } from "./blurBlock";

/**
 * V1 Blur Deserializer.
 * @param smartFilter - The SmartFilter to deserialize the block into
 * @param serializedBlock - The serialized block data
 * @returns A deserialized BlurBlock
 */
export function blurBlockDeserializer(smartFilter: SmartFilter, serializedBlock: ISerializedBlockV1) {
    const block = new BlurBlock(smartFilter, serializedBlock.name);
    block.blurTextureRatioPerPass = serializedBlock.data.blurTextureRatioPerPass;
    block.blurSize = serializedBlock.data.blurSize;
    return block;
}
