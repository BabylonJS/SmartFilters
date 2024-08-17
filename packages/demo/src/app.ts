import "@babylonjs/core/Engines/Extensions/engine.dynamicTexture";
import "@babylonjs/core/Engines/Extensions/engine.videoTexture";
import "@babylonjs/core/Engines/Extensions/engine.rawTexture";
import "@babylonjs/core/Misc/fileTools";
import { type SmartFilter } from "@babylonjs/smart-filters";
import { SmartFilterRenderer } from "./smartFilterRenderer";
import { SmartFilterEditor } from "@babylonjs/smart-filters-editor";
import { createThinEngine } from "./helpers/createThinEngine";
import { SmartFilterLoader } from "./smartFilterLoader";
import { smartFilterManifests } from "./configuration/smartFilters";
import { getBlockDeserializers } from "./configuration/blockDeserializers";

// Hardcoded options there is no UI for
const useTextureAnalyzer: boolean = false;
// TODO: add UI for toggling between regular and optimized graphs
const optimize: boolean = false;

// Manage our HTML elements
const editActionLink = document.getElementById("editActionLink")!;
const smartFilterSelect = document.getElementById("smartFilterSelect")! as HTMLSelectElement;
const canvas = document.getElementById("renderCanvas")! as HTMLCanvasElement;

// Create our services
const engine = createThinEngine(canvas);
const renderer = new SmartFilterRenderer(engine);
const smartFilterLoader = new SmartFilterLoader(engine, renderer, smartFilterManifests, getBlockDeserializers());

// Track the current Smart Filter
let currentSmartFilter: SmartFilter | undefined;

// When SmartFilters are loaded, update currentSmartFilter and start rendering
smartFilterLoader.onSmartFilterLoadedObservable.add((smartFilter) => {
    SmartFilterEditor.Hide();
    currentSmartFilter = smartFilter;
    renderer.startRendering(currentSmartFilter, useTextureAnalyzer).catch((err: unknown) => {
        console.error("Could not start rendering", err);
    });
});

// Load the initial SmartFilter
// todo move this down or make mroe asyc
const snippetToken = location.hash.substring(1).split("#")[0];
if (snippetToken) {
    smartFilterLoader.loadFromSnippet(snippetToken, optimize);
} else {
    smartFilterLoader.loadFromManifest(smartFilterLoader.defaultSmartFilterName, optimize);
}

// Set up hash change handler
window.addEventListener("hashchange", () => {
    // Get the snippet token (the first token) from the hash
    const snippetToken = location.hash.substring(1).split("#")[0] || undefined;
    if (!snippetToken) {
        return;
    }

    // If it exists and is new, load the new SmartFilter
    smartFilterLoader.loadFromSnippet(snippetToken, optimize);
});

// Populate the smart filter <select> list
smartFilterLoader.manifests.forEach((manifest) => {
    const option = document.createElement("option");
    option.value = manifest.name;
    option.innerText = manifest.name;
    //option.selected = manifest.name === initialSmartFilter;
    smartFilterSelect?.appendChild(option);
});

// Set up SmartFilter <select> handler
smartFilterSelect.addEventListener("change", () => {
    const manifest = smartFilterManifests.find((manifest) => manifest.name === smartFilterSelect.value);
    if (manifest) {
        smartFilterLoader.loadFromManifest(smartFilterSelect.value, optimize);
    }
});

// Set up editor button
editActionLink.onclick = async () => {
    if (currentSmartFilter) {
        const module = await import(/* webpackChunkName: "smartFilterEditor" */ "./helpers/launchEditor");
        module.launchEditor(currentSmartFilter, engine, renderer, smartFilterLoader);
    }
};
