import type { IBlockRegistration } from "@babylonjs/smart-filters-blocks";
import type { BlockEditorRegistration } from "@babylonjs/smart-filters-editor-control";

/**
 * Removes a custom block from the block editor registration.
 * @param blockEditorRegistration - The block editor registration to remove the custom block from
 * @param blockRegistration - The block registration to remove
 */
export function removeCustomBlockFromBlockRegistration(
    blockEditorRegistration: BlockEditorRegistration,
    blockRegistration: IBlockRegistration
) {
    const customBlockList = blockEditorRegistration.allBlocks[blockRegistration.namespace];
    if (customBlockList) {
        const index = customBlockList.findIndex((b) => b.blockType === blockRegistration.blockType);
        if (index !== -1) {
            customBlockList.splice(index, 1);
        }
    }
}
