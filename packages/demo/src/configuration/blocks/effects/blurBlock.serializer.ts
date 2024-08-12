import type { BaseBlock, IBlockSerializerV1 } from "@babylonjs/smart-filters";
import type { BlurBlock } from "./blurBlock";
import { BlockNames } from "../blockNames";

/**
 * The V1 serializer for a Blur Block.
 * Though it is an aggregate block, Blur creates and manages its own blocks
 * internally, so there's no need to worry about serializing them.
 */
export const blurBlockSerializer: IBlockSerializerV1 = {
    className: BlockNames.blur,
    serialize: (block: BaseBlock) => {
        if (block.getClassName() !== BlockNames.blur) {
            throw new Error("Was asked to serialize an unrecognized block type");
        }

        const blurBlock = block as BlurBlock;
        return {
            name: block.name,
            uniqueId: block.uniqueId,
            className: BlockNames.blur,
            comments: block.comments,
            data: {
                blurTextureRatioPerPass: blurBlock.blurTextureRatioPerPass,
                blurSize: blurBlock.blurSize,
            },
        };
    },
};
