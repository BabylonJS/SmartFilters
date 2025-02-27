import type { WipeBlock } from "./wipeBlock";
import { BlockNames } from "../blockNames.js";
import { babylonDemoTransitions } from "../blockNamespaces.js";
import type { IBlockSerializerV1 } from "../../serialization/v1/smartFilterSerialization.types";
import type { BaseBlock } from "../../blockFoundation/baseBlock";

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
            namespace: babylonDemoTransitions,
            comments: block.comments,
            data: {
                angle: wipeBlock.angle,
            },
        };
    },
};
