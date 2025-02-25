import type { BaseBlock, IBlockSerializerV1 } from "@babylonjs/smart-filters";
import type { TileBlock } from "./tileBlock";
import { BlockNames } from "../blockNames.js";
import { babylonDemoTransitions } from "../blockNamespaces.js";

/**
 * The V1 serializer for a tile Block
 */
export const tileBlockSerializer: IBlockSerializerV1 = {
    blockType: BlockNames.tile,
    serialize: (block: BaseBlock) => {
        if (block.getClassName() !== BlockNames.tile) {
            throw new Error("Was asked to serialize an unrecognized block type");
        }

        const tileBlock = block as TileBlock;
        return {
            name: block.name,
            uniqueId: block.uniqueId,
            blockType: BlockNames.tile,
            namespace: babylonDemoTransitions,
            comments: block.comments,
            data: {
                tileCount: tileBlock.tileCount,
            },
        };
    },
};
