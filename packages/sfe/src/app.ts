import "@babylonjs/core/Engines/Extensions/engine.rawTexture.js";

// TODO: dedupe between demo and here (loader, renderer, etc)
// TODO: UI for selecting aspect ratio of preview
// TODO: preview popout

import type { ThinEngine } from "@babylonjs/core/Engines/thinEngine";
import { Observable, type Observer } from "@babylonjs/core/Misc/observable.js";
import type { Nullable } from "@babylonjs/core/types";
import {
    builtInBlockEditorRegistrations,
    getBlockRegistrationsForEditor,
    inputBlockDeserializer,
} from "@babylonjs/smart-filters-blocks";
import { SmartFilterDeserializer, type ISerializedBlockV1, type SmartFilter } from "@babylonjs/smart-filters";
import { SmartFilterEditorControl, type SmartFilterEditorOptions } from "@babylonjs/smart-filters-editor-control";
import { SmartFilterRenderer } from "./smartFilterRenderer.js";
import { CustomBlockManager } from "./customBlockManager.js";
import { generateCustomBlockEditorRegistrations } from "./blockRegistration/generateCustomBlockEditorRegistrations.js";
import { blockFactory } from "./blockRegistration/blockFactory.js";
import { loadStartingSmartFilter } from "./smartFilterLoadSave/loadStartingSmartFilter.js";
import { saveToSnippetServer } from "./smartFilterLoadSave/saveToSnipperServer.js";
import { removeCustomBlockFromBlockRegistration } from "./blockRegistration/removeCustomBlockFromBlockRegistration.js";
import { addCustomBlockToBlockRegistration } from "./blockRegistration/addCustomBlockToBlockRegistration.js";
import { downloadSmartFilter } from "./smartFilterLoadSave/downloadSmartFilter.js";
import { loadFromFile } from "./smartFilterLoadSave/loadSmartFilterFromFile.js";

/**
 * The main entry point for the smart filter editor.
 */
async function main(): Promise<void> {
    const hostElement = document.getElementById("container");
    if (!hostElement) {
        throw new Error("Could not find the container element");
    }

    // Create the smart filter deserializer
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
                builtInBlockEditorRegistrations
            );
        },
        inputBlockDeserializer
    );

    // Create the custom block manager
    const customBlockManager = new CustomBlockManager();
    const customBlockTypeNames = customBlockManager.getCustomBlockTypeNames();
    const customBlockEditorRegistrations = generateCustomBlockEditorRegistrations(
        customBlockManager,
        smartFilterDeserializer,
        customBlockTypeNames
    );

    const blockRegistration = getBlockRegistrationsForEditor(smartFilterDeserializer, customBlockEditorRegistrations);

    let smartFilter: Nullable<SmartFilter> = null;

    let renderer: Nullable<SmartFilterRenderer> = null;
    const optimize = false;
    const onSmartFilterLoadedObservable = new Observable<SmartFilter>();
    let afterEngineResizerObserver: Nullable<Observer<ThinEngine>> = null;

    const afterEngineResize = (): void => {
        if (smartFilter && renderer) {
            renderer.startRendering(smartFilter);
        }
    };

    /**
     * Called when the editor has created a canvas and its associated engine
     * @param engine - The new engine
     */
    const onNewEngine = async (engine: ThinEngine) => {
        if (renderer) {
            renderer.dispose();
            renderer.engine.dispose();
            afterEngineResizerObserver?.remove();
        }
        afterEngineResizerObserver = engine.onResizeObservable.add(afterEngineResize);

        let justLoadedSmartFilter = false;
        if (!smartFilter) {
            try {
                smartFilter = await loadStartingSmartFilter(smartFilterDeserializer, engine);
                justLoadedSmartFilter = true;
            } catch (err) {
                errorHandler(`Could not load starting smart filter\n${err}`);
                return;
            }
        }

        renderer = new SmartFilterRenderer(engine, optimize);
        renderer.startRendering(smartFilter);

        if (justLoadedSmartFilter) {
            onSmartFilterLoadedObservable.notifyObservers(smartFilter);
        }
    };

    const rebuildRuntime = () => {
        renderer?.rebuildRuntime().catch((err: unknown) => {
            errorHandler(`Could not start rendering\n${err}`);
        });
    };

    const options: SmartFilterEditorOptions = {
        onNewEngine,
        onSmartFilterLoadedObservable,
        blockRegistration,
        hostElement,
        downloadSmartFilter: () => {
            if (smartFilter) {
                downloadSmartFilter(smartFilter);
            }
        },
        loadSmartFilter: async (file: File, engine: ThinEngine) => {
            if (renderer) {
                smartFilter = await loadFromFile(smartFilterDeserializer, engine, file);
                renderer.startRendering(smartFilter);
                return smartFilter;
            }
            return null;
        },
        saveToSnippetServer: () => {
            if (smartFilter) {
                saveToSnippetServer(smartFilter).catch((err: unknown) => {
                    errorHandler(`Could not save to snippet server\n${err}`);
                });
            }
        },
        beforeRenderObservable: new Observable<void>(),
        rebuildRuntime,
        reloadAssets: () => {},
        addCustomShaderBlock: (serializedData: string) => {
            try {
                const blockDefinition = customBlockManager.saveBlockDefinition(serializedData);
                removeCustomBlockFromBlockRegistration(blockRegistration, blockDefinition.blockType);
                addCustomBlockToBlockRegistration(blockRegistration, blockDefinition);
                rebuildRuntime();
            } catch (err) {
                errorHandler(`Could not load custom block:\n${err}`);
            }
        },
        deleteCustomShaderBlock: (blockType: string) => {
            customBlockManager.deleteBlockDefinition(blockType);
            removeCustomBlockFromBlockRegistration(blockRegistration, blockType);
        },
    };

    SmartFilterEditorControl.Show(options);
}

/**
 * Logs an error message to the console
 * @param message - The error message to log
 */
function errorHandler(message: string): void {
    // TODO: route to the editor console instead
    console.error(message);
}

main().catch((error) => {
    console.error(error);
});
