import type { ISerializedBlockV1, SmartFilter } from "@babylonjs/smart-filters";
import { DirectionalBlurBlock } from "./directionalBlurBlock";

export interface ISerializedDirectionalBlurBlockV1 extends ISerializedBlockV1 {
    data: {
        blurHorizontalWidth: number;
        blurVerticalWidth: number;
        blurTextureRatio: number;
    };
}

/**
 * V1 Directional Blur Deserializer.
 * @param smartFilter - The SmartFilter to deserialize the block into
 * @param serializedBlock - The serialized block data
 * @returns A deserialized DirectionalBlurBlock
 */
export function directionalBlurDeserializer(smartFilter: SmartFilter, serializedBlock: ISerializedDirectionalBlurBlockV1) {
    const block = new DirectionalBlurBlock(smartFilter, serializedBlock.name);

    // If data is missing, use the default value set by the block
    block.blurHorizontalWidth = serializedBlock.data.blurHorizontalWidth ?? block.blurHorizontalWidth;
    block.blurVerticalWidth = serializedBlock.data.blurVerticalWidth ?? block.blurVerticalWidth;
    block.blurTextureRatio = serializedBlock.data.blurTextureRatio ?? block.blurTextureRatio;
    return block;
}
