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
     * An optional BlockRegistration object which provides the information
     * required for the Editor to be able to display Smart Filter blocks in
     * the picker for the user to add to the Smart Filter. Note that each application
     * may have its own set of blocks, so this information must be passed in and not
     * baked into the editor.
     */
    blockRegistration?: BlockRegistration;

    /**
     * The Smart Filter to edit
     */
    filter?: SmartFilter;

    /**
     * The host element to draw the editor in. If undefined, a popup window will be used.
     */
    hostElement?: HTMLElement;

    /**
     * If supplied, a save button will appear in the editor, and this callback will be called
     * when it is clicked to initiate the download of the serialized version of the Smart Filter.
     */
    downloadSmartFilter?: () => void;

    /**
     * If supplied, a load button will appear in the editor, and when the user clicks it,
     * this callback will be passed the serialized Smart Filter file. The callback should
     * load the file and return the new SmartFilter.
     */
    loadSmartFilter?: (file: File) => Promise<SmartFilter>;

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
     * An optional callback, which if supplied, is called when the editor determines that
     * the graph has changed and the runtime needs to be rebuilt. If not supplied, structural changes
     * to the graph will be ignored.
     */
    rebuildRuntime?: (smartFilter: SmartFilter) => void;

    /**
     * An optional callback, which if supplied allows the texture input blocks to allow the user
     * to set the texture to user supplied images or videos. If not supplied, texture input blocks
     * are read only.
     */
    reloadAssets?: (smartFilter: SmartFilter) => void;
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
            options.blockRegistration ?? null,
            hostElement,
            options.downloadSmartFilter ?? null,
            options.loadSmartFilter ?? null,
            options.rebuildRuntime ?? null,
            options.reloadAssets ?? null,
            options.saveToSnippetServer,
            options.texturePresets
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
