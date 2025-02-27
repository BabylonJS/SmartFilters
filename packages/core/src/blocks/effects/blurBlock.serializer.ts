import type { IBlockSerializerV1 } from "../../serialization/v1/smartFilterSerialization.types";
import type { BaseBlock } from "../../blockFoundation/baseBlock";
import type { BlurBlock } from "./blurBlock";
import { BlockNames } from "../blockNames.js";
import { babylonDemoEffects } from "../blockNamespaces.js";

/**
 * The V1 serializer for a Blur Block.
 * Though it is an aggregate block, Blur creates and manages its own blocks
 * internally, so there's no need to worry about serializing them.
 */
export const blurBlockSerializer: IBlockSerializerV1 = {
    blockType: BlockNames.blur,
    serialize: (block: BaseBlock) => {
        if (block.getClassName() !== BlockNames.blur) {
            throw new Error("Was asked to serialize an unrecognized block type");
        }

        const blurBlock = block as BlurBlock;
        return {
            name: block.name,
            uniqueId: block.uniqueId,
            blockType: BlockNames.blur,
            namespace: babylonDemoEffects,
            comments: block.comments,
            data: {
                blurTextureRatioPerPass: blurBlock.blurTextureRatioPerPass,
                blurSize: blurBlock.blurSize,
            },
        };
    },
};
