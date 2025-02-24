import type { BaseBlock, SmartFilter, SmartFilterDeserializer } from "@babylonjs/smart-filters";
import type { BlockRegistration, GlobalState, IBlockEditorRegistration } from "@babylonjs/smart-filters-editor-control";
import { builtInBlockEditorRegistrations } from "./builtInBlockEditorRegistrations.js";
import type { ThinEngine } from "@babylonjs/core/Engines/thinEngine.js";
import type { Nullable } from "@babylonjs/core/types.js";
import { BlockNames } from "../blocks/blockNames.js";
import { CustomInputDisplayManager } from "./customInputDisplayManager.js";
import { WebCamInputBlock } from "../blocks/inputs/webCamInputBlock.js";

// TODO: does this belong in this package or another new shared package between demo and SFE?

/**
 * Gets the block registration for the editor.
 * @param smartFilterDeserializer - The smart filter deserializer to use
 * @param customBlockEditorRegistrations - Custom block editor registrations
 * @returns The block registration
 */
export function getBlockRegistrationsForEditor(
    smartFilterDeserializer: SmartFilterDeserializer,
    customBlockEditorRegistrations: IBlockEditorRegistration[]
): BlockRegistration {
    const blockTooltips: { [key: string]: string } = {};
    const allBlockNames: { [key: string]: string[] } = {};

    const allBlockEditorRegistrations: IBlockEditorRegistration[] = [
        ...customBlockEditorRegistrations,
        ...builtInBlockEditorRegistrations,
    ];

    // Fill in block name and tooltip lists
    allBlockEditorRegistrations.forEach((registration: IBlockEditorRegistration) => {
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
        const registration = allBlockEditorRegistrations.find((r) => r.name === blockType);
        if (registration && registration.factory) {
            return registration.factory(smartFilter, engine, smartFilterDeserializer);
        }
        return null;
    };

    const blockRegistration: BlockRegistration = {
        getIsUniqueBlock,
        getBlockFromString,
        createInputBlock,
        allBlockNames,
        blockTooltips,
        inputDisplayManager: CustomInputDisplayManager,
    };

    return blockRegistration;
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
 * @param globalState - The global state of the editor.
 * @param type - The type of input block to create.
 * @returns Optionally creates an InputBock and returns it, null otherwise
 */
function createInputBlock(globalState: GlobalState, type: string): Nullable<BaseBlock> {
    switch (type) {
        case BlockNames.webCam: {
            if (!globalState.engine) {
                return null;
            }
            return new WebCamInputBlock(globalState.smartFilter, globalState.engine);
        }
    }
    return null;
}
