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
import { getBlockDeserializers, inputBlockDeserializer } from "./configuration/blockDeserializers";
import { getSnippet, setSnippet } from "./helpers/hashFunctions";
import { TextureRenderHelper } from "./textureRenderHelper";

// Hardcoded options there is no UI for
const useTextureAnalyzer: boolean = false;
const renderToTextureInsteadOfCanvas: boolean = false;

// TODO: add UI for toggling between regular and optimized graphs
const optimize: boolean = true;

// Constants
const LocalStorageSmartFilterName = "SmartFilterName";

// Manage our HTML elements
const editActionLink = document.getElementById("editActionLink")!;
const smartFilterSelect = document.getElementById("smartFilterSelect")! as HTMLSelectElement;
const canvas = document.getElementById("renderCanvas")! as HTMLCanvasElement;
const inRepoFooter = document.getElementById("inRepoFooter")!;
const snippetAndFileFooter = document.getElementById("snippetAndFileFooter")!;
const sourceName = document.getElementById("sourceName")!;
const version = document.getElementById("version")!;

// Create our services
const engine = createThinEngine(canvas);
const renderer = new SmartFilterRenderer(engine);
const textureRenderHelper = renderToTextureInsteadOfCanvas ? new TextureRenderHelper(engine, renderer) : null;
const smartFilterLoader = new SmartFilterLoader(
    engine,
    renderer,
    smartFilterManifests,
    getBlockDeserializers(),
    inputBlockDeserializer,
    textureRenderHelper
);

// Track the current Smart Filter
let currentSmartFilter: SmartFilter | undefined;

// Init TextureRenderHelper if we are using one
if (textureRenderHelper) {
    textureRenderHelper.startAsync().catch((err: unknown) => {
        console.error("Could not start TextureRenderHelper", err);
    });
}

// Whenever a new SmartFilter is loaded, update currentSmartFilter and start rendering
smartFilterLoader.onSmartFilterLoadedObservable.add((event: SmartFilterLoadedEvent) => {
    SmartFilterEditor.Hide();
    currentSmartFilter = event.smartFilter;
    renderer.startRendering(currentSmartFilter, optimize, useTextureAnalyzer).catch((err: unknown) => {
        console.error("Could not start rendering", err);
    });

    // Ensure hash is empty if we're not loading from a snippet
    if (event.source !== SmartFilterSource.Snippet) {
        history.replaceState(null, "", window.location.pathname);
    }

    // In case we fell back to the default (in-repo) SmartFilter, update the <select>
    if (event.source === SmartFilterSource.InRepo && smartFilterSelect.value !== currentSmartFilter.name) {
        localStorage.setItem(LocalStorageSmartFilterName, currentSmartFilter.name);
        smartFilterSelect.value = currentSmartFilter.name;
    }

    // Set appropriate footer elements based on source
    switch (event.source) {
        case SmartFilterSource.InRepo:
            sourceName.textContent = "";
            inRepoFooter.style.display = "block";
            snippetAndFileFooter.style.display = "none";
            break;
        case SmartFilterSource.Snippet:
            sourceName.textContent = "snippet server";
            inRepoFooter.style.display = "none";
            snippetAndFileFooter.style.display = "block";
            break;
        case SmartFilterSource.File:
            sourceName.textContent = "local file";
            inRepoFooter.style.display = "none";
            snippetAndFileFooter.style.display = "block";
            break;
    }
});

/**
 * Checks the hash for a snippet token and loads the SmartFilter if one is found.
 * Otherwise, loads the last in-repo SmartFilter or the default.
 */
async function checkHash() {
    const [snippetToken, version] = getSnippet();

    if (snippetToken) {
        // Reset hash with our formatting to keep it looking consistent
        setSnippet(snippetToken, version, false);
        smartFilterLoader.loadFromSnippet(snippetToken, version);
    } else {
        const smartFilterName =
            localStorage.getItem(LocalStorageSmartFilterName) || smartFilterLoader.defaultSmartFilterName;
        smartFilterLoader.loadFromManifest(smartFilterName);
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
    smartFilterLoader.loadFromManifest(smartFilterSelect.value);
});

// Set up editor button
editActionLink.onclick = async () => {
    if (currentSmartFilter) {
        const module = await import(/* webpackChunkName: "smartFilterEditor" */ "./helpers/launchEditor");
        module.launchEditor(currentSmartFilter, engine, renderer, smartFilterLoader);
    }
};

// Display the current version by loading the version.json file
fetch("./version.json").then((response: Response) => {
    response.text().then((text: string) => {
        const versionInfo = JSON.parse(text);
        version.textContent = versionInfo.versionToDisplay;
    });
});
