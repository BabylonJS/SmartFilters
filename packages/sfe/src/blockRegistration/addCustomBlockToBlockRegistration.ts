import type { SerializedBlockDefinition } from "@babylonjs/smart-filters";
import type { BlockEditorRegistration } from "@babylonjs/smart-filters-editor-control";

/**
 * Adds a custom block to the block editor registration.
 * @param blockEditorRegistration - The block editor registration to add the custom block to
 * @param blockDefinition - The definition of the custom block to add
 */
export function addCustomBlockToBlockRegistration(
    blockEditorRegistration: BlockEditorRegistration,
    blockDefinition: SerializedBlockDefinition
) {
    blockEditorRegistration.allBlockNames["Custom_Blocks"]?.push(blockDefinition.blockType);
    blockEditorRegistration.blockTooltips[blockDefinition.blockType] = blockDefinition.blockType;
}
