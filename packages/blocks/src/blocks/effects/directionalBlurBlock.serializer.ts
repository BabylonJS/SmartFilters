import type { BaseBlock, IBlockSerializerV1 } from "@babylonjs/smart-filters";
import type { DirectionalBlurBlock } from "./directionalBlurBlock";
import { BlockNames } from "../blockNames.js";
import { babylonDemoEffects } from "../blockNamespaces";

/**
 * The V1 serializer for a Directional Blur Block
 */
export const directionalBlurBlockSerializer: IBlockSerializerV1 = {
    blockType: BlockNames.directionalBlur,
    serialize: (block: BaseBlock) => {
        if (block.getClassName() !== BlockNames.directionalBlur) {
            throw new Error("Was asked to serialize an unrecognized block type");
        }

        const directionalBlurBlock = block as DirectionalBlurBlock;
        return {
            name: block.name,
            uniqueId: block.uniqueId,
            blockType: BlockNames.directionalBlur,
            namespace: babylonDemoEffects,
            comments: block.comments,
            data: {
                blurTextureRatio: directionalBlurBlock.blurTextureRatio,
                blurHorizontalWidth: directionalBlurBlock.blurHorizontalWidth,
                blurVerticalWidth: directionalBlurBlock.blurVerticalWidth,
            },
        };
    },
};
