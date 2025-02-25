import type { Nullable } from "@babylonjs/core";
import type { ThinEngine } from "@babylonjs/core/Engines/thinEngine";
import type { BaseBlock, SmartFilter } from "@babylonjs/smart-filters";

/**
 * All of the configuration needed for the editor to work with a set of blocks.
 */
export type BlockEditorRegistration = {
    /**
     * Some blocks must appear only once in the graph (e.g. OutputBlock) - this function returns true if the block
     * should be unique in the graph.
     * @param block - The block to check
     * @returns true if the block should be unique in the graph
     */
    getIsUniqueBlock: (block: BaseBlock) => boolean;

    /**
     * Given a block's name, this function should return a new instance of that block with default values, or null if
     * the block name is not recognized.
     * @param blockType - The name of the block to create
     * @param smartFilter - The Smart Filter to create the block for
     * @param engine - The engine to use for creating blocks
     * @returns A new instance of the block, or null if the block name is not recognized
     */
    getBlockFromString(blockType: string, smartFilter: SmartFilter, engine: ThinEngine): Promise<Nullable<BaseBlock>>;

    /**
     * Intercepts the creation of an input block and can return specialized input blocks.
     * @param smartFilter - The SmartFilter the block will belong to
     * @param engine - The ThinEngine to use
     * @param blockType - The type of input block to create.
     * @returns Optionally creates an InputBock and returns it, null otherwise
     */
    createInputBlock(smartFilter: SmartFilter, engine: ThinEngine, blockType: string): Nullable<BaseBlock>;

    /**
     * An object that contains the names of all of the blocks, organized by category.
     */
    allBlockNames: { [key: string]: string[] };

    /**
     * An object that contains the tooltips for all of the blocks, keyed by block name.
     */
    blockTooltips: { [key: string]: string };

    /**
     * Optional override of the InputDisplayManager to provide custom display for particular blocks if desired.
     */
    inputDisplayManager?: any;
};
