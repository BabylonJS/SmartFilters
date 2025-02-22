import "@babylonjs/core/Engines/Extensions/engine.dynamicTexture";
import "@babylonjs/core/Engines/Extensions/engine.videoTexture";
import "@babylonjs/core/Engines/Extensions/engine.rawTexture";
import "@babylonjs/core/Misc/fileTools";
import { SmartFilterRenderer } from "./smartFilterRenderer";
import { SmartFilterEditorControl } from "@babylonjs/smart-filters-editor-control";
import { createThinEngine } from "./helpers/createThinEngine";
import { SmartFilterLoader, SmartFilterSource, type SmartFilterLoadedEvent } from "./smartFilterLoader";
import { smartFilterManifests } from "./configuration/smartFilters";
import { blockFactory } from "./configuration/blockFactory";
import { inputBlockDeserializer } from "./configuration/inputBlockDeserializer";
import { getSnippet, setSnippet } from "./helpers/hashFunctions";
import { TextureRenderHelper } from "./textureRenderHelper";
import { SmartFilterDeserializer, type ISerializedBlockV1, type SmartFilter } from "@babylonjs/smart-filters";
import { hookupBackgroundOption } from "./backgroundOption";
import { CustomBlockManager } from "./customBlockManager";
import type { ThinEngine } from "@babylonjs/core/Engines/thinEngine";

type CurrentSmartFilterState = {
    smartFilter: SmartFilter;
    optimizedSmartFilter?: SmartFilter;
    source: SmartFilterSource;
};

// Hardcoded options there is no UI for
const renderToTextureInsteadOfCanvas: boolean = false;

// Constants
const LocalStorageSmartFilterName = "SmartFilterName";
const LocalStorageOptimizeName = "OptimizeSmartFilter";

// Manage our HTML elements
const editActionLink = document.getElementById("editActionLink")!;
const smartFilterSelect = document.getElementById("smartFilterSelect")! as HTMLSelectElement;
const canvas = document.getElementById("renderCanvas")! as unknown as HTMLCanvasElement;
const inRepoSelection = document.getElementById("inRepoSelection")!;
const snippetAndFileFooter = document.getElementById("snippetAndFileFooter")!;
const sourceName = document.getElementById("sourceName")!;
const version = document.getElementById("version")!;
const optimizeCheckbox = document.getElementById("optimizeCheckbox") as HTMLInputElement;
const errorContainer = document.getElementById("errorContainer")! as HTMLDivElement;
const errorMessage = document.getElementById("errorMessage")! as HTMLDivElement;
const errorCloseButton = document.getElementById("errorCloseButton")! as HTMLButtonElement;

// Background option
hookupBackgroundOption();

// Create our services
const engine = createThinEngine(canvas);
const renderer = new SmartFilterRenderer(engine, localStorage.getItem(LocalStorageOptimizeName) === "true");
const textureRenderHelper = renderToTextureInsteadOfCanvas ? new TextureRenderHelper(engine, renderer) : null;
const customBlockManager = new CustomBlockManager(engine);
const smartFilterDeserializer = new SmartFilterDeserializer(
    (
        smartFilter: SmartFilter,
        engine: ThinEngine,
        serializedBlock: ISerializedBlockV1,
        smartFilterDeserializer: SmartFilterDeserializer
    ) => {
        return blockFactory(smartFilter, engine, serializedBlock, customBlockManager, smartFilterDeserializer);
    },
    inputBlockDeserializer
);

const smartFilterLoader = new SmartFilterLoader(
    engine,
    renderer,
    smartFilterManifests,
    smartFilterDeserializer,
    textureRenderHelper
);

// Track the current Smart Filter
let currentSmartFilterState: CurrentSmartFilterState | undefined;

// Init TextureRenderHelper if we are using one
if (textureRenderHelper) {
    textureRenderHelper.startAsync().catch((err: unknown) => {
        showError(`Could not start TextureRenderHelper: ${err}`);
    });
}

function renderCurrentSmartFilter(hideEditor: boolean = true) {
    if (hideEditor) {
        SmartFilterEditorControl.Hide();
    }

    const smartFilterState = currentSmartFilterState;
    if (!smartFilterState) {
        return;
    }

    console.log(`Rendering SmartFilter "${smartFilterState.smartFilter.name}"`, renderer.optimize ? "[optimized]" : "");

    renderer
        .startRendering(smartFilterState.smartFilter)
        .then((smartFilterRendered: SmartFilter) => {
            closeError();
            if (renderer.optimize) {
                smartFilterState.optimizedSmartFilter = smartFilterRendered;
            }
        })
        .catch((err: unknown) => {
            showError(`Could not start rendering: ${err}`);
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
            await smartFilterLoader.loadFromSnippet(snippetToken, version);
        } else {
            const smartFilterName =
                localStorage.getItem(LocalStorageSmartFilterName) || smartFilterLoader.defaultSmartFilterName;
            await smartFilterLoader.loadFromManifest(smartFilterName);
        }
    } catch (e) {
        showError(`Could not load SmartFilter: ${e}`);
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
            currentSmartFilterState.smartFilter,
            engine,
            renderer,
            smartFilterLoader,
            showError,
            closeError,
            customBlockManager
        );
    }
};

// Set up the optimize checkbox
optimizeCheckbox.checked = renderer.optimize;
optimizeCheckbox.onchange = () => {
    localStorage.setItem(LocalStorageOptimizeName, optimizeCheckbox.checked.toString());
    renderer.optimize = optimizeCheckbox.checked;
    renderCurrentSmartFilter(false);
};

// Display the current version by loading the version.json file
fetch("./version.json").then((response: Response) => {
    response.text().then((text: string) => {
        const versionInfo = JSON.parse(text);
        version.textContent = versionInfo.versionToDisplay;
    });
});

// Error handling
errorCloseButton.addEventListener("click", closeError);
function showError(message: string) {
    console.error(message);
    errorMessage.textContent = message;
    errorContainer.style.display = "grid";
}
function closeError() {
    errorContainer.style.display = "none";
}
