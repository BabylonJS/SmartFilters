import type { IBlockEditorRegistration } from "@babylonjs/smart-filters-editor-control";
import type { CustomBlockManager } from "../customBlockManager";
import type { SerializedBlockDefinition, SmartFilter, SmartFilterDeserializer } from "@babylonjs/smart-filters";
import type { ThinEngine } from "@babylonjs/core/Engines/thinEngine";

/**
 * Generates the block editor registrations for custom blocks.
 * @param customBlockManager - The custom block manager.
 * @param smartFilterDeserializer - The smart filter deserializer.
 * @param customBlockTypeNames - The names of the custom block types.
 * @returns
 */
export function generateCustomBlockEditorRegistrations(
    customBlockManager: CustomBlockManager,
    smartFilterDeserializer: SmartFilterDeserializer,
    customBlockTypeNames: string[]
): IBlockEditorRegistration[] {
    const blockEditorRegistrations: IBlockEditorRegistration[] = [];

    if (customBlockTypeNames.length > 0) {
        for (const customBlockType of customBlockTypeNames) {
            const blockDefinition = customBlockManager.getBlockDefinition(customBlockType);
            if (blockDefinition) {
                blockEditorRegistrations.push(
                    createBlockEditorRegistration(customBlockManager, blockDefinition, smartFilterDeserializer)
                );
            }
        }
    }

    return blockEditorRegistrations;
}

/**
 * Creates a block editor registration for a custom block
 * @param customBlockManager - The custom block manager.
 * @param blockDefinition - The serialized block definition.
 * @param deserializer - The smart filter deserializer.
 * @returns - The block editor registration.
 */
function createBlockEditorRegistration(
    customBlockManager: CustomBlockManager,
    blockDefinition: SerializedBlockDefinition,
    deserializer: SmartFilterDeserializer
): IBlockEditorRegistration {
    return {
        name: blockDefinition.blockType,
        category: "Custom_Blocks",
        factory: (smartFilter: SmartFilter, engine: ThinEngine) => {
            return customBlockManager.createBlockFromBlockDefinition(
                smartFilter,
                engine,
                blockDefinition,
                deserializer
            );
        },
        tooltip: blockDefinition.blockType,
    };
}
