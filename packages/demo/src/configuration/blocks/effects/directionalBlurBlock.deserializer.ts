import type { ISerializedBlockV1, SmartFilter } from "@babylonjs/smart-filters";
import { DirectionalBlurBlock } from "./directionalBlurBlock";

/**
 * V1 Directional Blur Deserializer.
 * @param smartFilter - The SmartFilter to deserialize the block into
 * @param serializedBlock - The serialized block data
 * @returns A deserialized DirectionalBlurBlock
 */
export function directionalBlurDeserializer(smartFilter: SmartFilter, serializedBlock: ISerializedBlockV1) {
    const block = new DirectionalBlurBlock(smartFilter, serializedBlock.name);
    block.blurHorizontalWidth = serializedBlock.data.blurHorizontalWidth;
    block.blurVerticalWidth = serializedBlock.data.blurVerticalWidth;
    block.blurTextureRatio = serializedBlock.data.blurTextureRatio;
    return block;
}
