import type { BaseBlock, IBlockSerializerV1 } from "@babylonjs/smart-filters";
import type { WipeBlock } from "./wipeBlock";
import { BlockNames, BlockNamespaces } from "../blockNames";

/**
 * The V1 serializer for a Wipe Block
 */
export const wipeBlockSerializer: IBlockSerializerV1 = {
    blockType: BlockNames.wipe,
    serialize: (block: BaseBlock) => {
        if (block.getClassName() !== BlockNames.wipe) {
            throw new Error("Was asked to serialize an unrecognized block type");
        }

        const wipeBlock = block as WipeBlock;
        return {
            name: block.name,
            uniqueId: block.uniqueId,
            blockType: BlockNames.wipe,
            namespace: BlockNamespaces.babylonDemoTransitions,
            comments: block.comments,
            data: {
                angle: wipeBlock.angle,
            },
        };
    },
};
