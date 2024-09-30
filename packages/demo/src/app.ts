import "@babylonjs/core/Engines/Extensions/engine.dynamicTexture";
import "@babylonjs/core/Engines/Extensions/engine.videoTexture";
import "@babylonjs/core/Engines/Extensions/engine.rawTexture";
import "@babylonjs/core/Misc/fileTools";
import { SmartFilterRenderer } from "./smartFilterRenderer";
import { SmartFilterEditor } from "@babylonjs/smart-filters-editor";
import { createThinEngine } from "./helpers/createThinEngine";
import { SmartFilterLoader, SmartFilterSource, type SmartFilterLoadedEvent } from "./smartFilterLoader";
import { smartFilterManifests } from "./configuration/smartFilters";
import { getBlockDeserializers, inputBlockDeserializer } from "./configuration/blockDeserializers";
import { getSnippet, setSnippet } from "./helpers/hashFunctions";
import { TextureRenderHelper } from "./textureRenderHelper";
import type { SmartFilter } from "@babylonjs/smart-filters";

type CurrentSmartFilterState = {
    smartFilter: SmartFilter;
    optimizedSmartFilter?: SmartFilter;
    source: SmartFilterSource;
};

// Hardcoded options there is no UI for
const useTextureAnalyzer: boolean = false;
const renderToTextureInsteadOfCanvas: boolean = false;

// Constants
const LocalStorageSmartFilterName = "SmartFilterName";
const LocalStorageOptimizeName = "OptimizeSmartFilter";
const LocalStorageEditOptimizedName = "EditOptimizedSmartFilter";

// Load settings from localStorage
let optimize: boolean = localStorage.getItem(LocalStorageOptimizeName) === "true";
let editOptimized: boolean = localStorage.getItem(LocalStorageEditOptimizedName) === "true";

// Manage our HTML elements
const editActionLink = document.getElementById("editActionLink")!;
const smartFilterSelect = document.getElementById("smartFilterSelect")! as HTMLSelectElement;
const canvas = document.getElementById("renderCanvas")! as HTMLCanvasElement;
const inRepoSelection = document.getElementById("inRepoSelection")!;
const snippetAndFileFooter = document.getElementById("snippetAndFileFooter")!;
const sourceName = document.getElementById("sourceName")!;
const version = document.getElementById("version")!;
const optimizeCheckbox = document.getElementById("optimize") as HTMLInputElement;
const editOptimizedCheckbox = document.getElementById("editOptimized") as HTMLInputElement;

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
let currentSmartFilterState: CurrentSmartFilterState | undefined;

// Init TextureRenderHelper if we are using one
if (textureRenderHelper) {
    textureRenderHelper.startAsync().catch((err: unknown) => {
        console.error("Could not start TextureRenderHelper", err);
    });
}

function renderCurrentSmartFilter() {
    SmartFilterEditor.Hide();

    const smartFilterState = currentSmartFilterState;
    if (!smartFilterState) {
        return;
    }

    console.log(`Rendering SmartFilter "${smartFilterState.smartFilter.name}"`, optimize ? "[optimized]" : "");

    renderer
        .startRendering(smartFilterState.smartFilter, optimize, useTextureAnalyzer)
        .then((smartFilterRendered: SmartFilter) => {
            if (optimize) {
                smartFilterState.optimizedSmartFilter = smartFilterRendered;
            }
        })
        .catch((err: unknown) => {
            console.error("Could not start rendering", err);
        });

    // Ensure hash is empty if we're not loading from a snippet
    if (smartFilterState.source !== SmartFilterSource.Snippet) {
        history.replaceState(null, "", window.location.pathname);
    }

    // In case we fell back to the default (in-repo) SmartFilter, update the <select>
    if (
        smartFilterState.source === SmartFilterSource.InRepo &&
        smartFilterSelect.value !== smartFilterState.smartFilter.name
    ) {
        localStorage.setItem(LocalStorageSmartFilterName, smartFilterState.smartFilter.name);
        smartFilterSelect.value = smartFilterState.smartFilter.name;
    }

    // Set appropriate footer elements based on source
    switch (smartFilterState.source) {
        case SmartFilterSource.InRepo:
            sourceName.textContent = "";
            inRepoSelection.style.display = "block";
            snippetAndFileFooter.style.display = "none";
            break;
        case SmartFilterSource.Snippet:
            sourceName.textContent = "snippet server";
            inRepoSelection.style.display = "none";
            snippetAndFileFooter.style.display = "block";
            break;
        case SmartFilterSource.File:
            sourceName.textContent = "local file";
            inRepoSelection.style.display = "none";
            snippetAndFileFooter.style.display = "block";
            break;
    }
}
// Whenever a new SmartFilter is loaded, update currentSmartFilter and start rendering
smartFilterLoader.onSmartFilterLoadedObservable.add((loadResult: SmartFilterLoadedEvent) => {
    currentSmartFilterState = loadResult;
    renderCurrentSmartFilter();
});

/**
 * Checks the hash for a snippet token and loads the SmartFilter if one is found.
 * Otherwise, loads the last in-repo SmartFilter or the default.
 */
async function loadFromHash() {
    const [snippetToken, version] = getSnippet();

    try {
        if (snippetToken) {
            // Reset hash with our formatting to keep it looking consistent
            setSnippet(snippetToken, version, false);
            smartFilterLoader.loadFromSnippet(snippetToken, version);
        } else {
            const smartFilterName =
                localStorage.getItem(LocalStorageSmartFilterName) || smartFilterLoader.defaultSmartFilterName;
            smartFilterLoader.loadFromManifest(smartFilterName);
        }
    } catch (e) {
        smartFilterLoader.loadFromManifest(smartFilterLoader.defaultSmartFilterName);
    }
}

// Initial load and hashchange listener
loadFromHash();
window.addEventListener("hashchange", loadFromHash);

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
    try {
        smartFilterLoader.loadFromManifest(smartFilterSelect.value);
    } catch (e) {
        smartFilterLoader.loadFromManifest(smartFilterLoader.defaultSmartFilterName);
    }
});

// Set up editor button
editActionLink.onclick = async () => {
    if (currentSmartFilterState) {
        const module = await import(/* webpackChunkName: "smartFilterEditor" */ "./helpers/launchEditor");
        module.launchEditor(
            editOptimized && currentSmartFilterState.optimizedSmartFilter
                ? currentSmartFilterState.optimizedSmartFilter
                : currentSmartFilterState.smartFilter,
            engine,
            renderer,
            smartFilterLoader
        );
    }
};

// Set up the optimize checkbox
optimizeCheckbox.checked = optimize;
optimizeCheckbox.onchange = () => {
    localStorage.setItem(LocalStorageOptimizeName, optimizeCheckbox.checked.toString());
    optimize = optimizeCheckbox.checked;
    renderCurrentSmartFilter();
};

// Set up the edit optimized checkbox
editOptimizedCheckbox.checked = editOptimized;
editOptimizedCheckbox.onchange = () => {
    localStorage.setItem(LocalStorageEditOptimizedName, editOptimizedCheckbox.checked.toString());
    editOptimized = editOptimizedCheckbox.checked;
};

// Display the current version by loading the version.json file
fetch("./version.json").then((response: Response) => {
    response.text().then((text: string) => {
        const versionInfo = JSON.parse(text);
        version.textContent = versionInfo.versionToDisplay;
    });
});
