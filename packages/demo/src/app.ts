import "@babylonjs/core/Engines/Extensions/engine.dynamicTexture";
import "@babylonjs/core/Engines/Extensions/engine.videoTexture";
import "@babylonjs/core/Engines/Extensions/engine.rawTexture";
import "@babylonjs/core/Misc/fileTools";
import { type SmartFilter } from "@babylonjs/smart-filters";
import { SmartFilterRenderer } from "./smartFilterRenderer";
import { SmartFilterEditor } from "@babylonjs/smart-filters-editor";
import { createThinEngine } from "./helpers/createThinEngine";
import { SmartFilterLoader, SmartFilterSource, type SmartFilterLoadedEvent } from "./smartFilterLoader";
import { smartFilterManifests } from "./configuration/smartFilters";
import { getBlockDeserializers } from "./configuration/blockDeserializers";
import { getSnippet } from "./helpers/hashFunctions";

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
const inRepoFooter = document.getElementById("inRepoFooter")!;
const defaultFooter = document.getElementById("defaultFooter")!;
const sourceName = document.getElementById("sourceName")!;

// Create our services
const engine = createThinEngine(canvas);
const renderer = new SmartFilterRenderer(engine);
const smartFilterLoader = new SmartFilterLoader(engine, renderer, smartFilterManifests, getBlockDeserializers());

// Track the current Smart Filter
let currentSmartFilter: SmartFilter | undefined;
let currentSource: SmartFilterSource | undefined;

// Whenever a new SmartFilter is loaded, update currentSmartFilter and start rendering
smartFilterLoader.onSmartFilterLoadedObservable.add((event: SmartFilterLoadedEvent) => {
    SmartFilterEditor.Hide();
    currentSmartFilter = event.smartFilter;
    currentSource = event.source;
    renderer.startRendering(currentSmartFilter, useTextureAnalyzer).catch((err: unknown) => {
        console.error("Could not start rendering", err);
    });

    // Ensure hash is empty if we're not loading from a snippet
    if (event.source !== SmartFilterSource.Snippet) {
        history.replaceState(null, "", window.location.pathname);
    }

    // In case we fell back to the default SmartFilter (in-repo), update the <select>
    if (event.source === SmartFilterSource.InRepo && smartFilterSelect.value !== currentSmartFilter.name) {
        localStorage.setItem(LocalStorageSmartFilterName, currentSmartFilter.name);
        smartFilterSelect.value = currentSmartFilter.name;
    }

    // Set appropriate footer
    inRepoFooter.style.display = currentSource === SmartFilterSource.InRepo ? "block" : "none";
    defaultFooter.style.display = currentSource === SmartFilterSource.InRepo ? "none" : "block";
    sourceName.textContent = currentSource === SmartFilterSource.Snippet ? "snippet server" : "local file";
});

/**
 * Checks the hash for a snippet token and loads the SmartFilter if one is found.
 * Otherwise, loads the last in-repo SmartFilter or the default.
 */
async function checkHash() {
    const [snippetToken, version] = getSnippet();

    if (snippetToken) {
        smartFilterLoader.loadFromSnippet(snippetToken, version, optimize);
    } else {
        const smartFilterName =
            localStorage.getItem(LocalStorageSmartFilterName) || smartFilterLoader.defaultSmartFilterName;
        smartFilterLoader.loadFromManifest(smartFilterName, optimize);
    }
}

// Initial load and hashchange listener
checkHash();
window.addEventListener("hashchange", checkHash);

// Populate the smart filter <select> list
smartFilterLoader.manifests.forEach((manifest) => {
    const option = document.createElement("option");
    option.value = manifest.name;
    option.innerText = manifest.name;
    option.selected = manifest.name === localStorage.getItem(LocalStorageSmartFilterName);
    smartFilterSelect?.appendChild(option);
});

// Set up SmartFilter <select> handler
smartFilterSelect.addEventListener("change", () => {
    localStorage.setItem(LocalStorageSmartFilterName, smartFilterSelect.value);
    smartFilterLoader.loadFromManifest(smartFilterSelect.value, optimize);
});

// Set up editor button
editActionLink.onclick = async () => {
    if (currentSmartFilter) {
        const module = await import(/* webpackChunkName: "smartFilterEditor" */ "./helpers/launchEditor");
        module.launchEditor(currentSmartFilter, engine, renderer, smartFilterLoader);
    }
};
