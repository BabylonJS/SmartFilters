import { type BaseBlock, logCommands, type SmartFilter, SmartFilterSerializer } from "@babylonjs/smart-filters";
import { blockEditorRegistrations } from "../configuration/editor/blockEditorRegistrations";
import { type BlockRegistration, SmartFilterEditor } from "@babylonjs/smart-filters-editor";
import { createInputBlock } from "../configuration/editor/createInputBlock";
import { CustomInputDisplayManager } from "../configuration/editor/customInputDisplayManager";
import { getInputNodePropertyComponent } from "../configuration/editor/getInputNodePropertyComponent";
import { getIsUniqueBlock } from "../configuration/editor/getIsUniqueBlock";
import type { IBlockEditorRegistration } from "../configuration/editor/IBlockEditorRegistration";
import { texturePresets } from "../configuration/texturePresets";
import type { ThinEngine } from "@babylonjs/core/Engines/thinEngine";
import type { SmartFilterRenderer } from "../smartFilterRenderer";
import { StringTools } from "@babylonjs/shared-ui-components/stringTools";
import { additionalBlockSerializers, blocksUsingDefaultSerialization } from "../configuration/blockSerializers";
import type { SmartFilterLoader } from "../smartFilterLoader";
import { getSnippet, setSnippet } from "./hashFunctions";

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
    smartFilterLoader: SmartFilterLoader
) {
    // Set up block registration
    const blockTooltips: { [key: string]: string } = {};
    const allBlockNames: { [key: string]: string[] } = {};
    blockEditorRegistrations.forEach((registration: IBlockEditorRegistration) => {
        blockTooltips[registration.name] = registration.tooltip;
        if (typeof allBlockNames[registration.category] === "object") {
            allBlockNames[registration.category]!.push(registration.name);
        } else {
            allBlockNames[registration.category] = [registration.name];
        }
    });
    const getBlockFromString = (blockType: string, smartFilter: SmartFilter): BaseBlock | null => {
        const registration = blockEditorRegistrations.find((r) => r.name === blockType);
        if (registration && registration.factory) {
            return registration.factory(smartFilter);
        }
        return null;
    };

    const blockRegistration: BlockRegistration = {
        getIsUniqueBlock,
        getBlockFromString,
        getInputNodePropertyComponent,
        createInputBlock,
        allBlockNames,
        blockTooltips,
        inputDisplayManager: CustomInputDisplayManager,
    };

    if (currentSmartFilter) {
        // Display the editor
        SmartFilterEditor.Show({
            engine,
            blockRegistration,
            filter: currentSmartFilter,
            rebuildRuntime: (smartFilter: SmartFilter) => {
                renderer.startRendering(smartFilter).catch((err: unknown) => {
                    console.error("Could not start rendering", err);
                });
            },
            downloadSmartFilter: () => {
                const serializer = new SmartFilterSerializer(
                    blocksUsingDefaultSerialization,
                    additionalBlockSerializers
                );

                StringTools.DownloadAsFile(
                    document,
                    JSON.stringify(serializer.serialize(currentSmartFilter), null, 2),
                    currentSmartFilter.name + ".json"
                );
            },
            loadSmartFilter: async (file: File) => {
                return smartFilterLoader.loadFromFile(file, false); // TODO: update optimize
            },
            saveToSnippetServer: async () => {
                const serializer = new SmartFilterSerializer(
                    blocksUsingDefaultSerialization,
                    additionalBlockSerializers
                );

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
        });
    }
    if (renderer.runtime) {
        // Display debug info in the console
        logCommands(renderer.runtime.commandBuffer);
    }
}
