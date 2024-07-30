import "@babylonjs/core/Engines/Extensions/engine.dynamicTexture";
import "@babylonjs/core/Engines/Extensions/engine.videoTexture";
import "@babylonjs/core/Engines/Extensions/engine.rawTexture";
import "@babylonjs/core/Misc/fileTools";
import {
    logCommands,
    SmartFilterSerializer,
    type SmartFilter,
    type SmartFilterRuntime,
} from "@babylonjs/smart-filters";
import { SmartFilterRenderer } from "./smartFilterRenderer";
import { SmartFilterEditor, type BlockRegistration } from "@babylonjs/smart-filters-editor";
import { texturePresets } from "./configuration/texturePresets";
import { createThinEngine } from "./createThinEngine";
import { SmartFilterLoader } from "./smartFilterLoader";
import { smartFilterManifests } from "./configuration/smartFilters";
import { blockDeserializers } from "./configuration/blockDeserializers";
import { blocksUsingDefaultSerialization, additionalBlockSerializers } from "./configuration/blockSerializers";
import { getIsUniqueBlock } from "./configuration/editor/getIsUniqueBlock";
import { getBlockFromString } from "./configuration/editor/getBlockFromString";
import { getInputNodePropertyComponent } from "./configuration/editor/getInputNodePropertyComponent";
import { CustomInputDisplayManager } from "./configuration/editor/customInputDisplayManager";
import { createInputBlock } from "./configuration/editor/createInputBlock";

// Hardcoded options there is no UI for
const useTextureAnalyzer: boolean = false;
// TODO: add UI for toggling between regular and optimized graphs
const optimize: boolean = false;

// Constants
const LocalStorateSmartFilterName = "SmartFilterName";

// Manage our HTML elements
const editActionLink = document.getElementById("editActionLink")!;
const smartFilterSelect = document.getElementById("smartFilterSelect")! as HTMLSelectElement;
const canvas = document.getElementById("renderCanvas")! as HTMLCanvasElement;

// Create our services
const engine = createThinEngine(canvas);
const renderer = new SmartFilterRenderer(engine);
const smartFilterLoader = new SmartFilterLoader(engine, smartFilterManifests, blockDeserializers);

// Track the current Smart Filter
let currentSmartFilter: SmartFilter | undefined;

/**
 * Loads a SmartFilter
 * @param name - The name of the SmartFilter to load
 * @param optimize - If true, the SmartFilter will be automatically optimized
 */
function loadSmartFilter(name: string, optimize: boolean): void {
    SmartFilterEditor.Hide();
    localStorage.setItem(LocalStorateSmartFilterName, name);
    currentSmartFilter = smartFilterLoader.loadSmartFilter(name, optimize);
    renderer.startRendering(currentSmartFilter, useTextureAnalyzer).catch((err: unknown) => {
        console.error("Could not start rendering", err);
    });

    const serializer = new SmartFilterSerializer(blocksUsingDefaultSerialization, additionalBlockSerializers);
    console.log(JSON.stringify(serializer.serialize(currentSmartFilter), null, 2));
}

// Load the initial SmartFilter
loadSmartFilter(
    localStorage.getItem(LocalStorateSmartFilterName) || smartFilterLoader.defaultSmartFilterName,
    optimize
);

// Populate the smart filter <select> list
smartFilterLoader.manifests.forEach((manifest) => {
    const option = document.createElement("option");
    option.value = manifest.name;
    option.innerText = manifest.name;
    option.selected = manifest.name === currentSmartFilter?.name;
    smartFilterSelect?.appendChild(option);
});

// Set up SmartFilter <select> handler
smartFilterSelect.addEventListener("change", () => {
    loadSmartFilter(smartFilterSelect.value, optimize);
});

// Set up block registration
const blockRegistration: BlockRegistration = {
    getIsUniqueBlock,
    getBlockFromString,
    getInputNodePropertyComponent,
    createInputBlock,
    inputDisplayManager: CustomInputDisplayManager,
};

// Set up editor button
editActionLink.onclick = () => {
    if (currentSmartFilter) {
        // Display the editor
        SmartFilterEditor.Show({
            engine,
            blockRegistration,
            filter: currentSmartFilter,
            onRuntimeCreated: (runtime: SmartFilterRuntime) => {
                renderer.setRuntime(runtime);
            },
            texturePresets,
        });
    }
    if (renderer.runtime) {
        // Display debug info in the console
        logCommands(renderer.runtime.commandBuffer);
    }
};
