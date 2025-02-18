import "@babylonjs/core/Engines/Extensions/engine.rawTexture.js";

// TODO: Fix version number in UI
// TODO: Fix doc link
// TODO: dedupe between demo and here (loader, renderer, etc)
// TODO: UI for selecting aspect ratio of preview

import type { ThinEngine } from "@babylonjs/core/Engines/thinEngine";
import { Observable } from "@babylonjs/core/Misc/observable.js";
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

    // const canvas = document.createElement("canvas");
    // const antialias = false;
    // const engine = new ThinEngine(
    //     canvas,
    //     antialias,
    //     {
    //         stencil: false,
    //         depth: false,
    //         antialias,
    //         audioEngine: false,
    //         // Important to allow skip frame and tiled optimizations
    //         preserveDrawingBuffer: false,
    //         // Useful during debug to simulate WebGL1 devices (Safari)
    //         // disableWebGL2Support: true,
    //     },
    //     false
    // );

    const blockRegistration: BlockRegistration = {
        getIsUniqueBlock: (block: BaseBlock) => block.getClassName() === "OutputBlock",
        getBlockFromString: (_blockType: string, _smartFilter: SmartFilter): Nullable<BaseBlock> => null,
        createInputBlock: (_globalState: GlobalState, _type: string): Nullable<BaseBlock> => null,
        allBlockNames: {},
        blockTooltips: {},
    };

    let renderer: Nullable<SmartFilterRenderer> = null;
    let smartFilterLoader: Nullable<SmartFilterLoader> = null;
    let smartFilter: Nullable<SmartFilter> = null;
    const optimize = false;
    const onSmartFilterLoadedObservable = new Observable<SmartFilter>();

    // TODO: make onNewEngine async to make this read better

    /**
     * Called when the editor has created a new canvas and associated engine
     * @param engine - The new engine
     */
    const onNewEngine = (engine: ThinEngine) => {
        if (renderer) {
            renderer.dispose();
        }
        renderer = new SmartFilterRenderer(engine, optimize);
        if (smartFilterLoader) {
            smartFilterLoader.dispose();
        }
        smartFilterLoader = new SmartFilterLoader(renderer);

        // TODO: try to fix this complexity
        if (!smartFilter) {
            // TODO: load the requested smart filter
            smartFilterLoader.loadDefault().then((loadedSmartFilter: SmartFilter) => {
                smartFilter = loadedSmartFilter;
                renderer?.startRendering(loadedSmartFilter);
                onSmartFilterLoadedObservable.notifyObservers(smartFilter);
            });
        } else {
            renderer?.startRendering(smartFilter);
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
