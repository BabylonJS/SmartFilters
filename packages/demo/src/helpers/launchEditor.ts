import {
    type BaseBlock,
    logCommands,
    type SerializedBlockDefinition,
    type SmartFilter,
    type SmartFilterDeserializer,
    SmartFilterSerializer,
} from "@babylonjs/smart-filters";
import { hardcodedBlockEditorRegistrations } from "../configuration/editor/hardcodedBlockEditorRegistrations";
import {
    type BlockRegistration,
    getBlockTypeAndNamespaceFromBlockNameForEditor,
    type IBlockEditorRegistration,
    SmartFilterEditor,
} from "@babylonjs/smart-filters-editor";
import { createInputBlock } from "../configuration/editor/createInputBlock";
import { CustomInputDisplayManager } from "../configuration/editor/customInputDisplayManager";
import { getIsUniqueBlock } from "../configuration/editor/getIsUniqueBlock";
import { texturePresets } from "../configuration/texturePresets";
import type { ThinEngine } from "@babylonjs/core/Engines/thinEngine";
import type { SmartFilterRenderer } from "../smartFilterRenderer";
import { StringTools } from "@babylonjs/shared-ui-components/stringTools";
import { additionalBlockSerializers, blocksUsingDefaultSerialization } from "../configuration/blockSerializers";
import type { SmartFilterLoader } from "../smartFilterLoader";
import { getSnippet, setSnippet } from "./hashFunctions";
import type { CustomBlockManager } from "../customBlockManager";
import { defaultBlockEditorRegistrations } from "../defaults/defaultBlockEditorRegistrations";

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
    customBlockManager: CustomBlockManager
) {
    if (!currentSmartFilter) {
        return;
    }

    // Set up block registration
    const allBlocks: { [key: string]: IBlockEditorRegistration[] } = {};

    // Register custom blocks
    const customBlockKeys = customBlockManager.getCustomBlockKeys();
    const customBlockEditorRegistrations: IBlockEditorRegistration[] = [];
    allBlocks["Custom_Blocks"] = []; // This will be populated like the other categories below
    if (customBlockKeys.length > 0) {
        for (const customBlockKey of customBlockKeys) {
            const blockDefinition = customBlockManager.getBlockDefinition(customBlockKey);
            if (blockDefinition) {
                customBlockEditorRegistrations.push(
                    createBlockEditorRegistration(
                        customBlockManager,
                        blockDefinition,
                        smartFilterLoader.smartFilterDeserializer,
                        true
                    )
                );
            }
        }
    }

    // Add the default block editor registrations to the list of all blocks
    addBlockEditorRegistrations(allBlocks, defaultBlockEditorRegistrations);

    // Add the custom block editor registrations to the list of all blocks
    addBlockEditorRegistrations(allBlocks, customBlockEditorRegistrations);

    // Add the hardcoded block editor registrations to the list of all blocks
    addBlockEditorRegistrations(
        allBlocks,
        hardcodedBlockEditorRegistrations.sort((a, b) => (a.namespace || "").localeCompare(b.namespace || ""))
    );

    // Create function to call the right factory for a block given the block type
    const getBlockFromString = async (
        blockNameForEditor: string,
        smartFilter: SmartFilter
    ): Promise<BaseBlock | null> => {
        const { blockType, namespace } = getBlockTypeAndNamespaceFromBlockNameForEditor(blockNameForEditor);

        const category = namespace || "Custom_Blocks";
        const allBlocksInCategory = allBlocks[category];
        if (!allBlocksInCategory) {
            return null;
        }

        const registration = allBlocksInCategory.find((r) => r.blockType === blockType);
        if (registration && registration.factory) {
            return registration.factory(smartFilter, engine, smartFilterLoader.smartFilterDeserializer);
        }
        return null;
    };

    // Create block registration object
    const blockRegistration: BlockRegistration = {
        getIsUniqueBlock,
        getBlockFromString,
        createInputBlock,
        allBlocks,
        inputDisplayManager: CustomInputDisplayManager,
    };

    // Functions to add / remove custom shader blocks from the editor at runtime
    function addCustomBlockToEditor(blockDefinition: SerializedBlockDefinition) {
        const blockEditorRegistration = createBlockEditorRegistration(
            customBlockManager,
            blockDefinition,
            smartFilterLoader.smartFilterDeserializer,
            true
        );
        allBlocks[blockDefinition.namespace || "Custom_Blocks"]?.push(blockEditorRegistration);
    }

    function removeCustomBlockFromEditor(blockEditorRegistration: IBlockEditorRegistration) {
        const { blockType: blockType, namespace: namespace } = blockEditorRegistration;

        const category = namespace || "Custom_Blocks";

        const allBlocksInCategory = allBlocks[category];

        if (allBlocksInCategory) {
            allBlocks[category] = allBlocksInCategory.filter(
                (block) => block.blockType !== blockType || block.namespace !== namespace
            );
        }
    }

    // Function to rebuild the runtime
    function rebuildRuntime() {
        renderer
            .rebuildRuntime()
            .then(closeError)
            .catch((err: unknown) => {
                errorHandler(`Could not start rendering\n${err}`);
            });
    }

    // Display the editor
    SmartFilterEditor.Show({
        engine,
        blockRegistration,
        filter: currentSmartFilter,
        rebuildRuntime,
        reloadAssets: () => {
            renderer.reloadAssets().catch((err: unknown) => {
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
        addCustomBlock: (serializedData: string) => {
            try {
                const blockDefinition = customBlockManager.saveBlockDefinition(serializedData);
                const blockEditorRegistration = createBlockEditorRegistration(
                    customBlockManager,
                    blockDefinition,
                    smartFilterLoader.smartFilterDeserializer,
                    true
                );
                removeCustomBlockFromEditor(blockEditorRegistration);
                addCustomBlockToEditor(blockDefinition);
                rebuildRuntime();
            } catch (err) {
                errorHandler(`Could not load custom block:\n${err}`);
            }
        },
        deleteCustomBlock: (blockRegistration: IBlockEditorRegistration) => {
            customBlockManager.deleteBlockDefinition(blockRegistration.blockType, blockRegistration.namespace);
            removeCustomBlockFromEditor(blockRegistration);
        },
    });

    if (renderer.runtime) {
        // Display debug info in the console
        logCommands(renderer.runtime.commandBuffer);
    }
}

function createBlockEditorRegistration(
    customBlockManager: CustomBlockManager,
    blockDefinition: SerializedBlockDefinition,
    deserializer: SmartFilterDeserializer,
    isCustom: boolean
): IBlockEditorRegistration {
    return {
        blockType: blockDefinition.blockType,
        namespace: blockDefinition.namespace || "Custom_Blocks",
        factory: (smartFilter: SmartFilter) => {
            return customBlockManager.createBlockFromBlockDefinition(smartFilter, blockDefinition, deserializer);
        },
        tooltip: blockDefinition.blockType,
        isCustom,
    };
}

function addBlockEditorRegistrations(
    allBlocks: { [key: string]: IBlockEditorRegistration[] },
    registrations: IBlockEditorRegistration[]
) {
    for (const blockEditorRegistration of registrations) {
        const category = blockEditorRegistration.namespace || "Other";
        if (typeof allBlocks[category] === "object") {
            allBlocks[category]!.push(blockEditorRegistration);
        } else {
            allBlocks[category] = [blockEditorRegistration];
        }
    }
}
