import {
    type BaseBlock,
    CustomShaderBlock,
    logCommands,
    type SerializedBlockDefinition,
    type SmartFilter,
    SmartFilterSerializer,
} from "@babylonjs/smart-filters";
import { hardcodedBlockEditorRegistrations } from "../configuration/editor/hardcodedBlockEditorRegistrations";
import { type BlockRegistration, SmartFilterEditor } from "@babylonjs/smart-filters-editor";
import { createInputBlock } from "../configuration/editor/createInputBlock";
import { CustomInputDisplayManager } from "../configuration/editor/customInputDisplayManager";
import { getIsUniqueBlock } from "../configuration/editor/getIsUniqueBlock";
import type { IBlockEditorRegistration } from "../configuration/editor/IBlockEditorRegistration";
import { texturePresets } from "../configuration/texturePresets";
import type { ThinEngine } from "@babylonjs/core/Engines/thinEngine";
import type { SmartFilterRenderer } from "../smartFilterRenderer";
import { StringTools } from "@babylonjs/shared-ui-components/stringTools";
import { additionalBlockSerializers, blocksUsingDefaultSerialization } from "../configuration/blockSerializers";
import type { SmartFilterLoader } from "../smartFilterLoader";
import { getSnippet, setSnippet } from "./hashFunctions";
import type { CustomShaderBlockManager } from "../customShaderBlockManager";

/**
 * Launches the editor - in a separate file so it can be dynamically imported, since it brings in code which
 * knows how to instantiate all registered blocks (so it includes all the block code).
 * @param currentSmartFilter - The smart filter to edit
 * @param engine - The engine to use
 * @param renderer - The renderer to use
 */
export function launchEditor(
    currentSmartFilter: SmartFilter,
    engine: ThinEngine,
    renderer: SmartFilterRenderer,
    smartFilterLoader: SmartFilterLoader,
    errorHandler: (message: string) => void,
    closeError: () => void,
    customShaderBlockManager: CustomShaderBlockManager
) {
    if (!currentSmartFilter) {
        return;
    }

    // Set up block registration
    const blockTooltips: { [key: string]: string } = {};
    const allBlockNames: { [key: string]: string[] } = {};

    // Register custom shader blocks
    const customShaderBlockTypeNames = customShaderBlockManager.getCustomShaderBlockTypeNames();
    const customShaderBlockEditorRegistrations: IBlockEditorRegistration[] = [];
    allBlockNames["Custom_Blocks"] = []; // This will be populated like the other categories below
    if (customShaderBlockTypeNames.length > 0) {
        for (const customBlockType of customShaderBlockTypeNames) {
            const blockDefinition = customShaderBlockManager.getBlockDefinition(customBlockType);
            if (blockDefinition) {
                customShaderBlockEditorRegistrations.push(createBlockEditorRegistration(blockDefinition));
            }
        }
    }

    // Build the list of all block editor registrations
    const allBlockEditorRegistrations: IBlockEditorRegistration[] = [
        ...hardcodedBlockEditorRegistrations,
        ...customShaderBlockEditorRegistrations,
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
    const getBlockFromString = (blockType: string, smartFilter: SmartFilter): BaseBlock | null => {
        const registration = allBlockEditorRegistrations.find((r) => r.name === blockType);
        if (registration && registration.factory) {
            return registration.factory(smartFilter);
        }
        return null;
    };

    // Create block registration object
    const blockRegistration: BlockRegistration = {
        getIsUniqueBlock,
        getBlockFromString,
        createInputBlock,
        allBlockNames,
        blockTooltips,
        inputDisplayManager: CustomInputDisplayManager,
    };

    // Display the editor
    SmartFilterEditor.Show({
        engine,
        blockRegistration,
        filter: currentSmartFilter,
        rebuildRuntime: (smartFilter: SmartFilter) => {
            renderer
                .startRendering(smartFilter)
                .then(closeError)
                .catch((err: unknown) => {
                    errorHandler(`Could not start rendering\n${err}`);
                });
        },
        reloadAssets: (smartFilter: SmartFilter) => {
            renderer.loadAssets(smartFilter).catch((err: unknown) => {
                errorHandler(`Could not reload assets:\n${err}`);
            });
        },
        downloadSmartFilter: () => {
            const serializer = new SmartFilterSerializer(blocksUsingDefaultSerialization, additionalBlockSerializers);

            StringTools.DownloadAsFile(
                document,
                JSON.stringify(serializer.serialize(currentSmartFilter), null, 2),
                currentSmartFilter.name + ".json"
            );
        },
        loadSmartFilter: async (file: File) => {
            return smartFilterLoader.loadFromFile(file);
        },
        saveToSnippetServer: async () => {
            const serializer = new SmartFilterSerializer(blocksUsingDefaultSerialization, additionalBlockSerializers);

            const smartFilterJson = JSON.stringify(serializer.serialize(currentSmartFilter));

            const dataToSend = {
                payload: JSON.stringify({
                    smartFilter: smartFilterJson,
                }),
                name: "",
                description: "",
                tags: "",
            };

            const [snippetToken] = getSnippet();

            const response = await fetch(`${smartFilterLoader.snippetUrl}/${snippetToken || ""}`, {
                method: "POST",
                headers: {
                    // eslint-disable-next-line @typescript-eslint/naming-convention
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(dataToSend),
            });

            if (!response.ok) {
                throw new Error(`Could not save snippet: ${response.statusText}`);
            }

            const snippet = await response.json();

            // Update the location hash to trigger a hashchange event
            setSnippet(snippet.id, snippet.version);
        },
        texturePresets,
        beforeRenderObservable: renderer.beforeRenderObservable,
        addCustomShaderBlock: (serializedData: string) => {
            const blockDefinition: SerializedBlockDefinition = JSON.parse(serializedData);
            customShaderBlockManager.saveBlockDefinition(blockDefinition);
            allBlockNames["Custom_Blocks"]?.push(blockDefinition.blockType);
            blockTooltips[blockDefinition.blockType] = blockDefinition.blockType;
            allBlockEditorRegistrations.push(createBlockEditorRegistration(blockDefinition));
        },
        deleteCustomShaderBlock: (blockType: string) => {
            customShaderBlockManager.deleteBlockDefinition(blockType);
            const customBlockTypeNameList = allBlockNames["Custom_Blocks"];
            if (customBlockTypeNameList) {
                const index = customBlockTypeNameList.indexOf(blockType);
                if (index !== -1) {
                    customBlockTypeNameList.splice(index, 1);
                }
            }
            const index = allBlockEditorRegistrations.findIndex((r) => r.name === blockType);
            if (index !== -1) {
                allBlockEditorRegistrations.splice(index, 1);
            }
        },
    });

    if (renderer.runtime) {
        // Display debug info in the console
        logCommands(renderer.runtime.commandBuffer);
    }
}

function createBlockEditorRegistration(blockDefinition: SerializedBlockDefinition): IBlockEditorRegistration {
    return {
        name: blockDefinition.blockType,
        category: "Custom_Blocks",
        factory: (smartFilter: SmartFilter) => {
            return CustomShaderBlock.Create(smartFilter, blockDefinition.blockType, blockDefinition);
        },
        tooltip: blockDefinition.blockType,
    };
}
