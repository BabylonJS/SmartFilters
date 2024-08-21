import type { BaseBlock, IBlockSerializerV1 } from "@babylonjs/smart-filters";
import type { TileBlock } from "./tileBlock";
import { BlockNames } from "../blockNames";

/**
 * The V1 serializer for a tile Block
 */
export const tileBlockSerializer: IBlockSerializerV1 = {
    className: BlockNames.tile,
    serialize: (block: BaseBlock) => {
        if (block.getClassName() !== BlockNames.tile) {
            throw new Error("Was asked to serialize an unrecognized block type");
        }

        const tileBlock = block as TileBlock;
        return {
            name: block.name,
            uniqueId: block.uniqueId,
            className: BlockNames.tile,
            comments: block.comments,
            data: {
                tileCount: tileBlock.tileCount,
            },
        };
    },
};
