import "@babylonjs/core/Engines/Extensions/engine.dynamicTexture";
import "@babylonjs/core/Engines/Extensions/engine.videoTexture";
import "@babylonjs/core/Engines/Extensions/engine.rawTexture";
import "@babylonjs/core/Misc/fileTools";
import {
    type BaseBlock,
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
import { getInputNodePropertyComponent } from "./configuration/editor/getInputNodePropertyComponent";
import { CustomInputDisplayManager } from "./configuration/editor/customInputDisplayManager";
import { createInputBlock } from "./configuration/editor/createInputBlock";
import { blockEditorRegistrations } from "./configuration/editor/blockEditorRegistrations";
import type { IBlockEditorRegistration } from "./configuration/editor/IBlockEditorRegistration";

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
const blockTooltips: { [key: string]: string } = {};
const allBlockNames: { [key: string]: string[] } = {};
blockEditorRegistrations.forEach((registration: IBlockEditorRegistration) => {
    blockTooltips[registration.name] = registration.tooltip;
    if (typeof allBlockNames[registration.category] === "object") {
        allBlockNames[registration.category]!.push(registration.name);
    } else {
        allBlockNames[registration.category] = [registration.name];
    }
});
const getBlockFromString = (blockType: string, smartFilter: SmartFilter): BaseBlock | null => {
    const registration = blockEditorRegistrations.find((r) => r.name === blockType);
    if (registration && registration.factory) {
        return registration.factory(smartFilter);
    }
    return null;
};

const blockRegistration: BlockRegistration = {
    getIsUniqueBlock,
    getBlockFromString,
    getInputNodePropertyComponent,
    createInputBlock,
    allBlockNames,
    blockTooltips,
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
