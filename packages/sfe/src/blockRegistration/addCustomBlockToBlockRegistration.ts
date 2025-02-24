import type { SerializedBlockDefinition } from "@babylonjs/smart-filters";
import type { BlockRegistration } from "@babylonjs/smart-filters-editor-control";

/**
 * Adds a custom block to the block registration.
 * @param blockRegistration - The block registration to remove the custom block from
 * @param blockDefinition - The definition of the custom block to add
 */
export function addCustomBlockToBlockRegistration(
    blockRegistration: BlockRegistration,
    blockDefinition: SerializedBlockDefinition
) {
    blockRegistration.allBlockNames["Custom_Blocks"]?.push(blockDefinition.blockType);
    blockRegistration.blockTooltips[blockDefinition.blockType] = blockDefinition.blockType;
}
