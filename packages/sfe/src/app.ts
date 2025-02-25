import "@babylonjs/core/Engines/Extensions/engine.rawTexture.js";

// TODO: UI for selecting aspect ratio of preview

import type { ThinEngine } from "@babylonjs/core/Engines/thinEngine";
import { Observable, type Observer } from "@babylonjs/core/Misc/observable.js";
import type { Nullable } from "@babylonjs/core/types";
import { builtInBlockRegistrations, type IBlockRegistration } from "@babylonjs/smart-filters-blocks";
import { SmartFilterDeserializer, type ISerializedBlockV1, type SmartFilter } from "@babylonjs/smart-filters";
import {
    editorBlockRegistrations,
    getBlockEditorRegistration,
    inputBlockDeserializer,
    LogEntry,
    SmartFilterEditorControl,
    type SmartFilterEditorOptions,
} from "@babylonjs/smart-filters-editor-control";
import { SmartFilterRenderer } from "./smartFilterRenderer.js";
import { CustomBlockManager } from "./customBlockManager.js";
import { generateCustomBlockRegistrations } from "./blockRegistration/generateCustomBlockEditorRegistrations.js";
import { blockFactory } from "./blockRegistration/blockFactory.js";
import { loadFromUrl, loadStartingSmartFilter } from "./smartFilterLoadSave/loadStartingSmartFilter.js";
import { saveToSnippetServer } from "./smartFilterLoadSave/saveToSnipperServer.js";
import { removeCustomBlockFromBlockRegistration } from "./blockRegistration/removeCustomBlockFromBlockRegistration.js";
import { addCustomBlockToBlockRegistration } from "./blockRegistration/addCustomBlockToBlockRegistration.js";
import { downloadSmartFilter } from "./smartFilterLoadSave/downloadSmartFilter.js";
import { loadFromFile } from "./smartFilterLoadSave/loadSmartFilterFromFile.js";
import { texturePresets } from "./texturePresets.js";

/**
 * The main entry point for the Smart Filter editor.
 */
async function main(): Promise<void> {
    const hostElement = document.getElementById("container");
    if (!hostElement) {
        throw new Error("Could not find the container element");
    }

    // Create the Smart Filter deserializer
    const smartFilterDeserializer = new SmartFilterDeserializer(
        (
            smartFilter: SmartFilter,
            engine: ThinEngine,
            serializedBlock: ISerializedBlockV1,
            smartFilterDeserializer: SmartFilterDeserializer
        ) => {
            return blockFactory(
                smartFilter,
                engine,
                serializedBlock,
                customBlockManager,
                smartFilterDeserializer,
                builtInBlockRegistrations
            );
        },
        inputBlockDeserializer
    );

    // Create the custom block manager
    const customBlockManager = new CustomBlockManager();
    const customBlockTypeNames = customBlockManager.getCustomBlockTypeNames();
    const customBlockRegistrations = generateCustomBlockRegistrations(
        customBlockManager,
        smartFilterDeserializer,
        customBlockTypeNames
    );

    // Create the block editor registration
    const allBlockRegistrations: IBlockRegistration[] = [
        ...customBlockRegistrations,
        ...editorBlockRegistrations,
        ...builtInBlockRegistrations,
    ];
    const blockEditorRegistration = getBlockEditorRegistration(smartFilterDeserializer, allBlockRegistrations);

    const optimize = false;
    let smartFilter: Nullable<SmartFilter> = null;
    let renderer: Nullable<SmartFilterRenderer> = null;
    const onSmartFilterLoadedObservable = new Observable<SmartFilter>();
    let afterEngineResizerObserver: Nullable<Observer<ThinEngine>> = null;
    const onLogRequiredObservable = new Observable<LogEntry>();
    let engine: Nullable<ThinEngine> = null;

    const afterEngineResize = (): void => {
        if (smartFilter && renderer) {
            renderer.startRendering(smartFilter);
        }
    };

    /**
     * Called when the editor has created a canvas and its associated engine
     * @param newEngine - The new engine
     */
    const onNewEngine = async (newEngine: ThinEngine) => {
        if (renderer) {
            renderer.dispose();
            afterEngineResizerObserver?.remove();
        }
        if (engine) {
            engine.dispose();
        }
        engine = newEngine;

        afterEngineResizerObserver = newEngine.onResizeObservable.add(afterEngineResize);

        let justLoadedSmartFilter = false;
        if (!smartFilter) {
            try {
                smartFilter = await loadStartingSmartFilter(
                    smartFilterDeserializer,
                    newEngine,
                    onLogRequiredObservable
                );
                justLoadedSmartFilter = true;
            } catch (err) {
                onLogRequiredObservable.notifyObservers(new LogEntry(`Could not load Smart Filter:\n${err}`, true));
                return;
            }
        }

        renderer = new SmartFilterRenderer(newEngine, optimize);
        renderer.startRendering(smartFilter);

        if (justLoadedSmartFilter) {
            onSmartFilterLoadedObservable.notifyObservers(smartFilter);
        }
    };

    const rebuildRuntime = () => {
        renderer
            ?.rebuildRuntime()
            .then(() => {
                onLogRequiredObservable.notifyObservers(new LogEntry("Smart Filter rebuilt successfully", false));
            })
            .catch((err: unknown) => {
                onLogRequiredObservable.notifyObservers(new LogEntry(`Could not start rendering:\n${err}`, true));
            });
    };

    window.addEventListener("hashchange", async () => {
        if (renderer && engine) {
            smartFilter = await loadFromUrl(smartFilterDeserializer, engine, onLogRequiredObservable);
            if (smartFilter) {
                renderer.startRendering(smartFilter);
                onLogRequiredObservable.notifyObservers(new LogEntry("Loaded Smart Filter from unique URL", false));
                onSmartFilterLoadedObservable.notifyObservers(smartFilter);
            } else {
                onLogRequiredObservable.notifyObservers(
                    new LogEntry("Could not load Smart Filter with that unique URL", true)
                );
            }
        }
    });

    const options: SmartFilterEditorOptions = {
        onNewEngine,
        onSmartFilterLoadedObservable,
        blockEditorRegistration: blockEditorRegistration,
        hostElement,
        downloadSmartFilter: () => {
            if (smartFilter) {
                downloadSmartFilter(smartFilter);
                onLogRequiredObservable.notifyObservers(new LogEntry("Smart filter JSON downloaded", false));
            }
        },
        loadSmartFilter: async (file: File, engine: ThinEngine) => {
            if (renderer) {
                smartFilter = await loadFromFile(smartFilterDeserializer, engine, file);
                renderer.startRendering(smartFilter);
                onLogRequiredObservable.notifyObservers(new LogEntry("Loaded Smart Filter from JSON", false));
                return smartFilter;
            }
            return null;
        },
        saveToSnippetServer: () => {
            if (smartFilter) {
                saveToSnippetServer(smartFilter).catch((err: unknown) => {
                    onLogRequiredObservable.notifyObservers(
                        new LogEntry(`Could not save to snippet server:\n${err}`, true)
                    );
                });
            }
        },
        texturePresets,
        beforeRenderObservable: new Observable<void>(),
        rebuildRuntime,
        reloadAssets: () => {
            renderer?.reloadAssets().catch((err: unknown) => {
                onLogRequiredObservable.notifyObservers(new LogEntry(`Could not reload assets:\n${err}`, true));
            });
        },
        addCustomShaderBlock: (serializedData: string) => {
            try {
                const blockDefinition = customBlockManager.saveBlockDefinition(serializedData);
                removeCustomBlockFromBlockRegistration(blockEditorRegistration, blockDefinition.blockType);
                addCustomBlockToBlockRegistration(blockEditorRegistration, blockDefinition);
                rebuildRuntime();
            } catch (err) {
                onLogRequiredObservable.notifyObservers(new LogEntry(`Could not load custom block:\n${err}`, true));
            }
        },
        deleteCustomShaderBlock: (blockType: string) => {
            customBlockManager.deleteBlockDefinition(blockType);
            removeCustomBlockFromBlockRegistration(blockEditorRegistration, blockType);
        },
        onLogRequiredObservable,
    };

    SmartFilterEditorControl.Show(options);
}

main().catch((error) => {
    console.error(error);
});
