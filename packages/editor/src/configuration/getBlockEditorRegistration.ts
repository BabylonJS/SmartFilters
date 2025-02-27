import type { BaseBlock, SmartFilter, SmartFilterDeserializer, IBlockRegistration } from "@babylonjs/smart-filters";
import type { ThinEngine } from "@babylonjs/core/Engines/thinEngine.js";
import type { Nullable } from "@babylonjs/core/types.js";
import type { BlockEditorRegistration } from "./blockEditorRegistration";
import { CustomInputDisplayManager } from "./customInputDisplayManager.js";
import { WebCamInputBlockName } from "./editorBlocks/blockNames.js";
import { WebCamInputBlock } from "./editorBlocks/webCamInputBlock/webCamInputBlock.js";
import { CustomBlocksNamespace } from "./constants.js";
import type { Observable } from "@babylonjs/core/Misc/observable";
import { LogEntry } from "../components/log/logComponent.js";

/**
 * Creates the block editor registration for the editor.
 * @param smartFilterDeserializer - The smart filter deserializer to use
 * @param allBlockRegistrations - All block registrations to use
 * @param includeCustomBlocksCategory - If true, includes the custom blocks category even if there are no blocks in that category
 * @param onLogRequiredObservable - If supplied, instead of console errors, log entries will be sent to this observable
 * @returns The block registration
 */
export function getBlockEditorRegistration(
    smartFilterDeserializer: SmartFilterDeserializer,
    allBlockRegistrations: IBlockRegistration[],
    includeCustomBlocksCategory: boolean,
    onLogRequiredObservable?: Observable<LogEntry>
): BlockEditorRegistration {
    const allBlocks: { [key: string]: IBlockRegistration[] } = {};

    // Include the custom blocks category first if desired
    if (includeCustomBlocksCategory) {
        allBlocks[CustomBlocksNamespace] = [];
    }

    // Next always have the inputs
    allBlocks["Inputs"] = [];

    // Create the map of blocks by namespace now in alphabetical order
    const allBlockRegistrationsSortedByNamespace = allBlockRegistrations.sort((a, b) =>
        a.namespace.localeCompare(b.namespace)
    );

    allBlockRegistrationsSortedByNamespace.forEach((registration: IBlockRegistration) => {
        if (allBlocks[registration.namespace]) {
            allBlocks[registration.namespace]!.push(registration);
        } else {
            allBlocks[registration.namespace] = [registration];
        }
    });

    // Create function to call the right factory for a block given the block type and namespace
    const getBlock = async (
        blockType: string,
        namespace: Nullable<string>,
        smartFilter: SmartFilter,
        engine: ThinEngine
    ): Promise<Nullable<BaseBlock>> => {
        const registration = allBlockRegistrations.find((r) => r.blockType === blockType && r.namespace === namespace);
        if (registration && registration.factory) {
            try {
                return await registration.factory(smartFilter, engine, smartFilterDeserializer);
            } catch (err) {
                const errorString = `Error creating block ${blockType} in namespace ${namespace}:\n ${err}`;
                if (onLogRequiredObservable) {
                    onLogRequiredObservable.notifyObservers(new LogEntry(errorString, true));
                } else {
                    console.error(errorString);
                }
            }
        }
        return null;
    };

    const blockEditorRegistration: BlockEditorRegistration = {
        getIsUniqueBlock,
        getBlock,
        createInputBlock,
        allBlocks,
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
 * @param _engine - The ThinEngine to use
 * @param blockType - The type of input block to create.
 * @returns Optionally creates an InputBock and returns it, null otherwise
 */
function createInputBlock(smartFilter: SmartFilter, _engine: ThinEngine, blockType: string): Nullable<BaseBlock> {
    switch (blockType) {
        case WebCamInputBlockName: {
            return new WebCamInputBlock(smartFilter);
        }
    }
    return null;
}
