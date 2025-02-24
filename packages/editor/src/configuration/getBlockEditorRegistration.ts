import type { BaseBlock, SmartFilter, SmartFilterDeserializer } from "@babylonjs/smart-filters";
import type { ThinEngine } from "@babylonjs/core/Engines/thinEngine.js";
import type { Nullable } from "@babylonjs/core/types.js";
import { BlockNames } from "@babylonjs/smart-filters-blocks/src/blocks/blockNames.js";
import { WebCamInputBlock } from "@babylonjs/smart-filters-blocks/src/blocks/inputs/webCamInputBlock.js";
import type { IBlockRegistration } from "@babylonjs/smart-filters-blocks";
import type { BlockEditorRegistration } from "./blockEditorRegistration";
import { CustomInputDisplayManager } from "./customInputDisplayManager.js";

/**
 * Creates the block editor registration for the editor.
 * @param smartFilterDeserializer - The smart filter deserializer to use
 * @param allBlockRegistrations - All block registrations to use
 * @returns The block registration
 */
export function getBlockEditorRegistration(
    smartFilterDeserializer: SmartFilterDeserializer,
    allBlockRegistrations: IBlockRegistration[]
): BlockEditorRegistration {
    const blockTooltips: { [key: string]: string } = {};
    const allBlockNames: { [key: string]: string[] } = {};

    // Fill in block name and tooltip lists
    allBlockRegistrations.forEach((registration: IBlockRegistration) => {
        blockTooltips[registration.name] = registration.tooltip;
        if (typeof allBlockNames[registration.category] === "object") {
            allBlockNames[registration.category]!.push(registration.name);
        } else {
            allBlockNames[registration.category] = [registration.name];
        }
    });

    // Create function to call the right factory for a block given the block type
    const getBlockFromString = async (
        blockType: string,
        smartFilter: SmartFilter,
        engine: ThinEngine
    ): Promise<BaseBlock | null> => {
        const registration = allBlockRegistrations.find((r) => r.name === blockType);
        if (registration && registration.factory) {
            return registration.factory(smartFilter, engine, smartFilterDeserializer);
        }
        return null;
    };

    const blockEditorRegistration: BlockEditorRegistration = {
        getIsUniqueBlock,
        getBlockFromString,
        createInputBlock,
        allBlockNames,
        blockTooltips,
        inputDisplayManager: CustomInputDisplayManager,
    };

    return blockEditorRegistration;
}

/**
 * Some blocks must appear only once in the graph (e.g. OutputBlock) - this function returns true if the block
 * should be unique in the graph.
 * @param block - The block to check
 * @returns Whether the block should be unique in the graph
 */
function getIsUniqueBlock(block: BaseBlock): boolean {
    return block.getClassName() === "OutputBlock";
}

/**
 * Intercepts the creation of an input block and can return specialized input blocks.
 * @param smartFilter - The SmartFilter the block will belong to
 * @param engine - The ThinEngine to use
 * @param blockType - The type of input block to create.
 * @returns Optionally creates an InputBock and returns it, null otherwise
 */
function createInputBlock(smartFilter: SmartFilter, engine: ThinEngine, blockType: string): Nullable<BaseBlock> {
    switch (blockType) {
        case BlockNames.webCam: {
            return new WebCamInputBlock(smartFilter, engine);
        }
    }
    return null;
}
