import type { BlockEditorRegistration } from "@babylonjs/smart-filters-editor-control";

/**
 * Removes a custom block from the block editor registration.
 * @param blockEditorRegistration - The block editor registration to remove the custom block from
 * @param blockType - The type of the custom block to remove
 */
export function removeCustomBlockFromBlockRegistration(
    blockEditorRegistration: BlockEditorRegistration,
    blockType: string
) {
    const customBlockTypeNameList = blockEditorRegistration.allBlockNames["Custom_Blocks"];
    if (customBlockTypeNameList) {
        const index = customBlockTypeNameList.indexOf(blockType);
        if (index !== -1) {
            customBlockTypeNameList.splice(index, 1);
        }
    }
    delete blockEditorRegistration.blockTooltips[blockType];
}
