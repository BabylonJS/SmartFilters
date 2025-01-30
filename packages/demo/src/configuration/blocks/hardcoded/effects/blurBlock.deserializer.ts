import type { ISerializedBlockV1, SmartFilter } from "@babylonjs/smart-filters";
import { BlurBlock } from "./blurBlock";

export interface ISerializedBlurBlockV1 extends ISerializedBlockV1 {
    data: {
        blurTextureRatioPerPass: number;
        blurSize: number;
    };
}

/**
 * V1 Blur Deserializer.
 * @param smartFilter - The SmartFilter to deserialize the block into
 * @param serializedBlock - The serialized block data
 * @returns A deserialized BlurBlock
 */
export function blurBlockDeserializer(smartFilter: SmartFilter, serializedBlock: ISerializedBlurBlockV1) {
    const block = new BlurBlock(smartFilter, serializedBlock.name);

    // If data is missing, use the default value set by the block
    block.blurTextureRatioPerPass = serializedBlock.data.blurTextureRatioPerPass ?? block.blurSize;
    block.blurSize = serializedBlock.data.blurSize ?? block.blurSize;
    return block;
}
