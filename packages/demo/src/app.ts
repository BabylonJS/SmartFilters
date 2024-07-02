import "@babylonjs/core/Engines/Extensions/engine.dynamicTexture";
import "@babylonjs/core/Engines/Extensions/engine.videoTexture";
import "@babylonjs/core/Engines/Extensions/engine.rawTexture";
import "@babylonjs/core/Misc/fileTools";
import { ThinEngine } from "@babylonjs/core/Engines/thinEngine.js";
import {
    SmartFilterOptimizer,
    createImageTexture,
    logCommands,
    type SmartFilter,
    type SmartFilterRuntime,
} from "@babylonjs/smart-filters";
import { createSimpleWebcamFilter } from "./createSmartFilter";
import { SmartFilterRenderer } from "./smartFilterRenderer";
import { SmartFilterEditor } from "@babylonjs/smart-filters-editor";

// Manage our HTML elements
const editActionLink = document.getElementById("editActionLink");
const canvas = document.getElementById("renderCanvas") as HTMLCanvasElement;

// Create the Web Engine.
const antialias = true;
const engine = new ThinEngine(
    canvas,
    antialias,
    {
        alpha: false,
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

// Creates a smart filter renderer
const renderer = new SmartFilterRenderer(engine);
let filter: SmartFilter | undefined = undefined;

const prebuildGraphId: number = 0;
const useGraphOptimizer = false;
const forceMaxSamplersInFragmentShader = 0;
const useTextureAnalyzer = false;

const optimizeFilters = (filters: SmartFilter) => {
    (window as any).sm = filters;
    if (useGraphOptimizer) {
        const vfo = new SmartFilterOptimizer(filters, {
            maxSamplersInFragmentShader: forceMaxSamplersInFragmentShader || engine.getCaps().maxTexturesImageUnits,
            removeDisabledBlocks: true,
        });
        filters = vfo.optimize()!;
        (window as any).smo = filters;
    }
    return filters;
};

switch (prebuildGraphId) {
    case 0:
        {
            const logoTexture = createImageTexture(engine, "./assets/babylonLogo.png");
            filter = createSimpleWebcamFilter(engine, logoTexture);
            filter = optimizeFilters(filter);

            renderer.startRendering(filter, useTextureAnalyzer).catch((err: unknown) => {
                console.error("Could not start rendering", err);
            });
        }
        break;
}

if (editActionLink) {
    editActionLink.onclick = () => {
        if (filter) {
            // Display the editor
            SmartFilterEditor.Show({
                engine,
                filter: (window as any).sm, // use filter instead of (window as any).sm if you want to edit the optimized graph (when optimizer is enabled)
                onRuntimeCreated: (runtime: SmartFilterRuntime) => {
                    renderer.setRuntime(runtime);
                },
            });
        }
        if (renderer.runtime) {
            // Display debug info in the console
            logCommands(renderer.runtime.commandBuffer);
        }
    };
}
