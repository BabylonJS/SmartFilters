import "@babylonjs/core/Engines/Extensions/engine.rawTexture.js";

// TODO: dedupe between demo and here (loader, renderer, etc)
// TODO: UI for selecting aspect ratio of preview
// TODO: preview popout

import type { ThinEngine } from "@babylonjs/core/Engines/thinEngine";
import { Observable, type Observer } from "@babylonjs/core/Misc/observable.js";
import type { Nullable } from "@babylonjs/core/types";
import { builtInBlockEditorRegistrations, getBlockRegistrationsForEditor } from "@babylonjs/smart-filters-blocks";
import { SmartFilterDeserializer, type ISerializedBlockV1, type SmartFilter } from "@babylonjs/smart-filters";
import { SmartFilterEditorControl, type SmartFilterEditorOptions } from "@babylonjs/smart-filters-editor-control";
import { SmartFilterLoader } from "./smartFilterLoader.js";
import { SmartFilterRenderer } from "./smartFilterRenderer.js";
import { CustomBlockManager } from "./customBlockManager.js";
import { generateCustomBlockEditorRegistrations } from "./blockRegistration/generateCustomBlockEditorRegistrations.js";
import { blockFactory } from "./blockRegistration/blockFactory.js";

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
        }
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

    const smartFilterLoader: Nullable<SmartFilterLoader> = new SmartFilterLoader();

    // TODO: load from URL
    let smartFilterLoadPromise: Nullable<Promise<SmartFilter>> = smartFilterLoader.loadDefault();
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

        renderer = new SmartFilterRenderer(engine, optimize);

        let justLoadedSmartFilter = false;
        if (smartFilterLoadPromise) {
            smartFilter = await smartFilterLoadPromise;
            smartFilterLoadPromise = null;
            justLoadedSmartFilter = true;
        }

        if (smartFilter && renderer) {
            renderer.startRendering(smartFilter);
        }

        if (smartFilter && justLoadedSmartFilter) {
            onSmartFilterLoadedObservable.notifyObservers(smartFilter);
        }
    };

    const options: SmartFilterEditorOptions = {
        onNewEngine,
        onSmartFilterLoadedObservable,
        blockRegistration,
        hostElement,
        downloadSmartFilter: () => {},
        loadSmartFilter: async (_file: File): Promise<SmartFilter> => {
            throw new Error("Not implemented");
        },
        beforeRenderObservable: new Observable<void>(),
        rebuildRuntime: () => {
            renderer?.rebuildRuntime().catch((err: unknown) => {
                errorHandler(`Could not start rendering\n${err}`);
            });
        },
        reloadAssets: () => {},
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
