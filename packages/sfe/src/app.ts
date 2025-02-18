import "@babylonjs/core/Engines/Extensions/engine.rawTexture.js";

// TODO: Fix version number in UI
// TODO: Fix doc link
// TODO: dedupe between demo and here (loader, renderer, etc)
// TODO: UI for selecting aspect ratio of preview

import type { ThinEngine } from "@babylonjs/core/Engines/thinEngine";
import { Observable, type Observer } from "@babylonjs/core/Misc/observable.js";
import type { Nullable } from "@babylonjs/core/types";
import type { BaseBlock, SmartFilter } from "@babylonjs/smart-filters";
import {
    type GlobalState,
    SmartFilterEditorControl,
    type BlockRegistration,
    type SmartFilterEditorOptions,
} from "@babylonjs/smart-filters-editor-control";
import { SmartFilterLoader } from "./smartFilterLoader.js";
import { SmartFilterRenderer } from "./smartFilterRenderer.js";

/**
 * The main entry point for the smart filter editor.
 */
async function main(): Promise<void> {
    const hostElement = document.getElementById("container");
    if (!hostElement) {
        throw new Error("Could not find the container element");
    }

    const blockRegistration: BlockRegistration = {
        getIsUniqueBlock: (block: BaseBlock) => block.getClassName() === "OutputBlock",
        getBlockFromString: (_blockType: string, _smartFilter: SmartFilter): Nullable<BaseBlock> => null,
        createInputBlock: (_globalState: GlobalState, _type: string): Nullable<BaseBlock> => null,
        allBlockNames: {},
        blockTooltips: {},
    };

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

        if (smartFilterLoadPromise) {
            smartFilter = await smartFilterLoadPromise;
            smartFilterLoadPromise = null;
            onSmartFilterLoadedObservable.notifyObservers(smartFilter);
        }

        if (smartFilter && renderer) {
            renderer.startRendering(smartFilter);
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
        rebuildRuntime: () => {},
        reloadAssets: () => {},
    };

    SmartFilterEditorControl.Show(options);
}

main().catch((error) => {
    console.error(error);
});
