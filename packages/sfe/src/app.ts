// TODO: Fix version number in UI
// TODO: Fix doc link
// TODO: dedupe between demo and here (loader, renderer, etc)

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
const optimize = false;
const onSmartFilterLoadedObservable = new Observable<SmartFilter>();

/**
 * Called when the editor has created a new canvas and associated engine
 * @param engine - The new engine
 */
function onNewEngine(engine: ThinEngine) {
    if (renderer) {
        renderer.dispose();
    }
    renderer = new SmartFilterRenderer(engine, optimize);
    if (smartFilterLoader) {
        smartFilterLoader.dispose();
    }
    smartFilterLoader = new SmartFilterLoader(renderer);

    // TODO: load the requested smart filter
    smartFilterLoader.loadDefault().then((smartFilter: SmartFilter) => {
        onSmartFilterLoadedObservable.notifyObservers(smartFilter);
    });
}

const options: SmartFilterEditorOptions = {
    blockRegistration,
    hostElement,
    downloadSmartFilter: () => {},
    loadSmartFilter: async (_file: File): Promise<SmartFilter> => {
        throw new Error("Not implemented");
    },
    beforeRenderObservable: new Observable<void>(),
    rebuildRuntime: () => {},
    reloadAssets: () => {},
    onNewEngine,
    onSmartFilterLoadedObservable,
};

SmartFilterEditorControl.Show(options);
