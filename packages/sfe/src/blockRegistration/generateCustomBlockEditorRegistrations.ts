import type { CustomBlockManager } from "../customBlockManager";
import type { SerializedBlockDefinition, SmartFilter, SmartFilterDeserializer } from "@babylonjs/smart-filters";
import type { ThinEngine } from "@babylonjs/core/Engines/thinEngine";
import type { IBlockRegistration } from "@babylonjs/smart-filters-blocks";

/**
 * Generates the block registrations for custom blocks.
 * @param customBlockManager - The custom block manager.
 * @param smartFilterDeserializer - The Smart Filter deserializer.
 * @param customBlockTypeNames - The names of the custom block types.
 * @returns - The block registrations.
 */
export function generateCustomBlockRegistrations(
    customBlockManager: CustomBlockManager,
    smartFilterDeserializer: SmartFilterDeserializer,
    customBlockTypeNames: string[]
): IBlockRegistration[] {
    const blockRegistrations: IBlockRegistration[] = [];

    if (customBlockTypeNames.length > 0) {
        for (const customBlockType of customBlockTypeNames) {
            const blockDefinition = customBlockManager.getBlockDefinition(customBlockType);
            if (blockDefinition) {
                blockRegistrations.push(
                    createBlockRegistration(customBlockManager, blockDefinition, smartFilterDeserializer)
                );
            }
        }
    }

    return blockRegistrations;
}

/**
 * Creates a block registration for a custom block
 * @param customBlockManager - The custom block manager.
 * @param blockDefinition - The serialized block definition.
 * @param deserializer - The Smart Filter deserializer.
 * @returns - The block registration.
 */
function createBlockRegistration(
    customBlockManager: CustomBlockManager,
    blockDefinition: SerializedBlockDefinition,
    deserializer: SmartFilterDeserializer
): IBlockRegistration {
    return {
        blockType: blockDefinition.blockType,
        namespace: "Custom_Blocks",
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
