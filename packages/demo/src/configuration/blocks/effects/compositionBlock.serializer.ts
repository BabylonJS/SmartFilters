import type { BaseBlock, IBlockSerializerV1 } from "@babylonjs/smart-filters";
import type { CompositionBlock } from "./compositionBlock";
import { BlockNames } from "../blockNames";

/**
 * The V1 serializer for a Composition Block
 */
export const compositionBlockSerializer: IBlockSerializerV1 = {
    className: BlockNames.composition,
    serialize: (block: BaseBlock) => {
        if (block.getClassName() !== BlockNames.composition) {
            throw new Error("Was asked to serialize an unrecognized block type");
        }

        const compositionBlock = block as CompositionBlock;
        return {
            name: block.name,
            uniqueId: block.uniqueId,
            className: BlockNames.composition,
            comments: block.comments,
            data: {
                alphaMode: compositionBlock.alphaMode,
            },
        };
    },
};
