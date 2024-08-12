import type { BaseBlock, IBlockSerializerV1 } from "@babylonjs/smart-filters";
import type { DirectionalBlurBlock } from "./directionalBlurBlock";
import { BlockNames } from "../blockNames";

/**
 * The V1 serializer for a Directional Blur Block
 */
export const directionalBlurBlockSerializer: IBlockSerializerV1 = {
    className: BlockNames.directionalBlur,
    serialize: (block: BaseBlock) => {
        if (block.getClassName() !== BlockNames.directionalBlur) {
            throw new Error("Was asked to serialize an unrecognized block type");
        }

        const directionalBlurBlock = block as DirectionalBlurBlock;
        return {
            name: block.name,
            uniqueId: block.uniqueId,
            className: BlockNames.directionalBlur,
            comments: block.comments,
            data: {
                blurTextureRatio: directionalBlurBlock.blurTextureRatio,
                blurHorizontalWidth: directionalBlurBlock.blurHorizontalWidth,
                blurVerticalWidth: directionalBlurBlock.blurVerticalWidth,
            },
        };
    },
};
