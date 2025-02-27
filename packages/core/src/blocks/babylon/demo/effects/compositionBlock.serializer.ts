import type { BaseBlock } from "../../../../blockFoundation";
import type { IBlockSerializerV1 } from "../../../../serialization";
import type { CompositionBlock } from "./compositionBlock";
import { compositionBlockType } from "../../../blockTypes.js";
import { babylonDemoEffects } from "../../../blockNamespaces.js";

/**
 * The V1 serializer for a Composition Block
 */
export const compositionBlockSerializer: IBlockSerializerV1 = {
    blockType: compositionBlockType,
    serialize: (block: BaseBlock) => {
        if (block.getClassName() !== compositionBlockType) {
            throw new Error("Was asked to serialize an unrecognized block type");
        }

        const compositionBlock = block as CompositionBlock;
        return {
            name: block.name,
            uniqueId: block.uniqueId,
            blockType: compositionBlockType,
            namespace: babylonDemoEffects,
            comments: block.comments,
            data: {
                alphaMode: compositionBlock.alphaMode,
            },
        };
    },
};
