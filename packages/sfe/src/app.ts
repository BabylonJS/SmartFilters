import { ThinEngine } from "@babylonjs/core/Engines/thinEngine.js";
import { Observable } from "@babylonjs/core/Misc/observable.js";
import type { Nullable } from "@babylonjs/core/types";
import type { BaseBlock, SmartFilter } from "@babylonjs/smart-filters";
import {
    type GlobalState,
    SmartFilterEditorControl,
    type BlockRegistration,
    type SmartFilterEditorOptions,
} from "@babylonjs/smart-filters-editor-control";

const hostElement = document.getElementById("container");
if (!hostElement) {
    throw new Error("Could not find the container element");
}

const canvas = document.createElement("canvas");
const antialias = false;
const engine = new ThinEngine(
    canvas,
    antialias,
    {
        stencil: false,
        depth: false,
        antialias,
        audioEngine: false,
        // Important to allow skip frame and tiled optimizations
        preserveDrawingBuffer: false,
        // Useful during debug to simulate WebGL1 devices (Safari)
        // disableWebGL2Support: true,
    },
    false
);

const blockRegistration: BlockRegistration = {
    getIsUniqueBlock: (block: BaseBlock) => block.getClassName() === "OutputBlock",
    getBlockFromString: (_blockType: string, _smartFilter: SmartFilter): Nullable<BaseBlock> => null,
    createInputBlock: (_globalState: GlobalState, _type: string): Nullable<BaseBlock> => null,
    allBlockNames: {},
    blockTooltips: {},
};

const options: SmartFilterEditorOptions = {
    engine,
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
