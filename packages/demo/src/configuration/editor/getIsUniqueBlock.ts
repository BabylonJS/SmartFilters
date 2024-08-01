import type { BaseBlock } from "@babylonjs/smart-filters";

/**
 * Some blocks must appear only once in the graph (e.g. OutputBlock) - this function returns true if the block
 * should be unique in the graph.
 * @param block - The block to check
 */
export function getIsUniqueBlock(block: BaseBlock) {
    return block.getClassName() === "OutputBlock";
}
