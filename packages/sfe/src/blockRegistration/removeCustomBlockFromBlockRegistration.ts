import type { BlockRegistration } from "@babylonjs/smart-filters-editor-control";

/**
 * Removes a custom block from the block registration.
 * @param blockRegistration - The block registration to remove the custom block from
 * @param blockType - The type of the custom block to remove
 */
export function removeCustomBlockFromBlockRegistration(blockRegistration: BlockRegistration, blockType: string) {
    const customBlockTypeNameList = blockRegistration.allBlockNames["Custom_Blocks"];
    if (customBlockTypeNameList) {
        const index = customBlockTypeNameList.indexOf(blockType);
        if (index !== -1) {
            customBlockTypeNameList.splice(index, 1);
        }
    }
    delete blockRegistration.blockTooltips[blockType];
}
