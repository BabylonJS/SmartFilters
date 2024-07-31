import "@babylonjs/core/Engines/Extensions/engine.dynamicTexture";
import "@babylonjs/core/Engines/Extensions/engine.videoTexture";
import "@babylonjs/core/Engines/Extensions/engine.rawTexture";
import "@babylonjs/core/Misc/fileTools";
import { SmartFilterSerializer, type SmartFilter } from "@babylonjs/smart-filters";
import { SmartFilterRenderer } from "./smartFilterRenderer";
import { SmartFilterEditor } from "@babylonjs/smart-filters-editor";
import { createThinEngine } from "./createThinEngine";
import { SmartFilterLoader } from "./smartFilterLoader";
import { smartFilterManifests } from "./configuration/smartFilters";
import { getBlockDeserializers } from "./configuration/blockDeserializers";
import { blocksUsingDefaultSerialization, additionalBlockSerializers } from "./configuration/blockSerializers";

// Hardcoded options there is no UI for
const useTextureAnalyzer: boolean = false;
// TODO: add UI for toggling between regular and optimized graphs
const optimize: boolean = false;

// Constants
const LocalStorageSmartFilterName = "SmartFilterName";

// Manage our HTML elements
const editActionLink = document.getElementById("editActionLink")!;
const smartFilterSelect = document.getElementById("smartFilterSelect")! as HTMLSelectElement;
const canvas = document.getElementById("renderCanvas")! as HTMLCanvasElement;

// Create our services
const engine = createThinEngine(canvas);
const renderer = new SmartFilterRenderer(engine);
const smartFilterLoader = new SmartFilterLoader(engine, smartFilterManifests, getBlockDeserializers());

// Track the current Smart Filter
let currentSmartFilter: SmartFilter | undefined;

/**
 * Loads a SmartFilter
 * @param name - The name of the SmartFilter to load
 * @param optimize - If true, the SmartFilter will be automatically optimized
 */
async function loadSmartFilter(name: string, optimize: boolean): Promise<void> {
    SmartFilterEditor.Hide();
    localStorage.setItem(LocalStorageSmartFilterName, name);
    currentSmartFilter = await smartFilterLoader.loadSmartFilter(name, optimize);
    renderer.startRendering(currentSmartFilter, useTextureAnalyzer).catch((err: unknown) => {
        console.error("Could not start rendering", err);
    });

    // Demonstrate the serializer - TODO: do this on button press then trigger a download instead
    const serializer = new SmartFilterSerializer(blocksUsingDefaultSerialization, additionalBlockSerializers);
    console.log(JSON.stringify(serializer.serialize(currentSmartFilter), null, 2));
}

// Load the initial SmartFilter
const initialSmartFilterName =
    localStorage.getItem(LocalStorageSmartFilterName) || smartFilterLoader.defaultSmartFilterName;
loadSmartFilter(initialSmartFilterName, optimize);

// Populate the smart filter <select> list
smartFilterLoader.manifests.forEach((manifest) => {
    const option = document.createElement("option");
    option.value = manifest.name;
    option.innerText = manifest.name;
    option.selected = manifest.name === initialSmartFilterName;
    smartFilterSelect?.appendChild(option);
});

// Set up SmartFilter <select> handler
smartFilterSelect.addEventListener("change", () => {
    loadSmartFilter(smartFilterSelect.value, optimize);
});

// Set up editor button
editActionLink.onclick = async () => {
    if (currentSmartFilter) {
        const module = await import(/* webpackChunkName: "smartFilterEditor" */ "./launchEditor");
        module.launchEditor(currentSmartFilter, engine, renderer);
    }
};
