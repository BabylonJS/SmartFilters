import type { ThinEngine } from "@babylonjs/core/Engines/thinEngine";
import * as react from "react";
import * as reactDOM from "react-dom";
import { GlobalState, type TexturePreset } from "./globalState.js";
import { GraphEditor } from "./graphEditor.js";
import { RegisterToDisplayManagers } from "./graphSystem/registerToDisplayLedger.js";
import { RegisterToPropertyTabManagers } from "./graphSystem/registerToPropertyLedger.js";
import { RegisterTypeLedger } from "./graphSystem/registerToTypeLedger.js";
import type { BaseBlock, SmartFilter } from "@babylonjs/smart-filters";
import type { Nullable } from "@babylonjs/core/types.js";
import type { Observable } from "@babylonjs/core/Misc/observable.js";
import { CreatePopup } from "@babylonjs/shared-ui-components/popupHelper.js";

/**
 * An object that contains all of the information the Editor needs to display and
 * work with a set of Smart Filter blocks.
 */
export type BlockRegistration = {
    /**
     * Some blocks must appear only once in the graph (e.g. OutputBlock) - this function returns true if the block
     * should be unique in the graph.
     * @param block - The block to check
     * @returns true if the block should be unique in the graph
     */
    getIsUniqueBlock: (block: BaseBlock) => boolean;

    /**
     * Given a block's name, this function should return a new instance of that block with default values, or null if
     * the block name is not recognized.
     * @param blockType - The name of the block to create
     * @param smartFilter - The Smart Filter to create the block for
     * @returns A new instance of the block, or null if the block name is not recognized
     */
    getBlockFromString(blockType: string, smartFilter: SmartFilter): Nullable<BaseBlock>;

    /**
     * Intercepts the creation of an input block and can return specialized input blocks.
     * @param globalState - The global state of the editor.
     * @param type - The type of input block to create.
     * @returns Optionally creates an InputBock and returns it, null otherwise
     */
    createInputBlock(globalState: GlobalState, type: string): Nullable<BaseBlock>;

    /**
     * An object that contains the names of all of the blocks, organized by category.
     */
    allBlockNames: { [key: string]: string[] };

    /**
     * An object that contains the tooltips for all of the blocks, keyed by block name.
     */
    blockTooltips: { [key: string]: string };

    /**
     * Optional override of the InputDisplayManager to provide custom display for particular blocks if desired.
     */
    inputDisplayManager?: any;
};

/**
 * Options to configure the Smart Filter Editor
 */
export type SmartFilterEditorOptions = {
    /**
     * The ThinEngine to use
     */
    engine: ThinEngine;

    /**
     * A BlockRegistration object which is responsible for providing the information
     * required for the Editor to be able to display and work with the Smart Filter
     * blocks the application uses. Note that each application may have its own set
     * of blocks, so this information must be passed in and not baked into the editor.
     */
    blockRegistration: BlockRegistration;

    /**
     * The Smart Filter to edit
     */
    filter?: SmartFilter;

    /**
     * The host element to draw the editor in. If undefined, a popup window will be used.
     */
    hostElement?: HTMLElement;

    /**
     * A callback that is responsible for doing the work of initiating a download of the
     * serialized version of the Smart Filter.
     */
    downloadSmartFilter: () => void;

    /**
     * A callback that is responsible for loading a serialized Smart Filter from the provided file,
     * and should then call SmartFilterEditor.Show with the loaded Smart Filter.
     */
    loadSmartFilter: (file: File) => Promise<SmartFilter>;

    /**
     * An optional callback to save the current Smart Filter to the snippet server.
     * If not supplied, the button will not appear in the editor.
     */
    saveToSnippetServer?: () => void;

    /**
     * An optional array of texture presets to display in the editor.
     */
    texturePresets?: TexturePreset[];

    /**
     * An observable that is called before rendering the filter every frame.
     */
    beforeRenderObservable: Observable<void>;

    /**
     * Called when the editor determines that the graph has changed and the runtime needs to be rebuilt.
     */
    rebuildRuntime: (smartFilter: SmartFilter) => void;

    /**
     * Called when the editor determines that the assets (images or videos) need to be reloaded
     */
    reloadAssets: (smartFilter: SmartFilter) => void;

    /**
     * If supplied, the editor will call this function when the user tries to add a custom shader block
     * @param serializedData - The serialized data of the custom shader block
     */
    addCustomShaderBlock?: (serializedData: string) => void;
};

/**
 * Class used to create a node editor
 */
export class SmartFilterEditor {
    private static _CurrentState: GlobalState;
    private static _PopupWindow: Window | null;

    /**
     * Show the node editor
     * @param options - defines the options to use to configure the node editor
     */
    public static Show(options: SmartFilterEditorOptions) {
        if (this._CurrentState) {
            if (this._PopupWindow) {
                this._PopupWindow.close();
            }
        }

        // Initial setup
        let hostElement = options.hostElement;

        if (!hostElement) {
            hostElement = CreatePopup("BABYLON.JS SMART FILTER EDITOR", {
                onWindowCreateCallback: (w) => (this._PopupWindow = w),
                width: 1500,
                height: 800,
            })!;
        }

        const globalState = new GlobalState(
            options.engine,
            options.filter ?? null,
            options.blockRegistration,
            hostElement,
            options.downloadSmartFilter,
            options.loadSmartFilter,
            options.beforeRenderObservable,
            options.rebuildRuntime,
            options.reloadAssets,
            options.saveToSnippetServer,
            options.texturePresets,
            options.addCustomShaderBlock
        );

        RegisterToDisplayManagers(globalState);
        RegisterToPropertyTabManagers();
        RegisterTypeLedger();

        const graphEditor = react.createElement(GraphEditor, {
            globalState: globalState,
        });

        reactDOM.render(graphEditor, hostElement);

        this._CurrentState = globalState;

        globalState.hostWindow.addEventListener("beforeunload", () => {
            globalState.onPopupClosedObservable.notifyObservers();
        });

        // Close the popup window when the page is refreshed or scene is disposed
        if (globalState.smartFilter && this._PopupWindow) {
            options.engine.onDisposeObservable.addOnce(() => {
                if (this._PopupWindow) {
                    this._PopupWindow.close();
                }
            });
            window.onbeforeunload = () => {
                if (this._PopupWindow) {
                    this._PopupWindow.close();
                }
            };
        }
    }

    public static Hide() {
        if (this._PopupWindow) {
            this._PopupWindow.close();
        }
    }
}
