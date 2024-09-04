import type { ThinEngine } from "@babylonjs/core/Engines/thinEngine";
import * as react from "react";
import * as reactDOM from "react-dom";
import { GlobalState, type TexturePreset } from "./globalState.js";
import { GraphEditor } from "./graphEditor.js";
import { RegisterToDisplayManagers } from "./graphSystem/registerToDisplayLedger.js";
import { RegisterToPropertyTabManagers } from "./graphSystem/registerToPropertyLedger.js";
import { RegisterTypeLedger } from "./graphSystem/registerToTypeLedger.js";
import { Popup } from "./sharedComponents/popup.js";
import type { AnyInputBlock, BaseBlock, SmartFilter } from "@babylonjs/smart-filters";
import type { Nullable } from "@babylonjs/core/types.js";
import type { Observable } from "@babylonjs/core/Misc/observable.js";

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
     * If there is an InputBlock that needs special property setting UI, this function should return that UI, otherwise null.
     * @param inputBlock - The selected InputBlock
     * @param globalState - The global state
     * @returns The UI for the input block, or null if the input block does not need special UI
     */
    getInputNodePropertyComponent(inputBlock: AnyInputBlock, globalState: GlobalState): Nullable<JSX.Element>;

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
};

const filterEditorPopupId = "filter-editor";

/**
 * Class used to create a node editor
 */
export class SmartFilterEditor {
    private static _CurrentState: GlobalState;

    /**
     * Show the node editor
     * @param options - defines the options to use to configure the node editor
     */
    public static Show(options: SmartFilterEditorOptions) {
        if (this._CurrentState) {
            const popupWindow = (Popup as any)[filterEditorPopupId];
            if (popupWindow) {
                popupWindow.close();
            }
        }

        // Initial setup
        let hostElement = options.hostElement;

        if (!hostElement) {
            hostElement = Popup.CreatePopup("BABYLON.JS Smart Filter EDITOR", filterEditorPopupId, 1500, 800)!;
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

        // if (options.customLoadObservable) {
        //     options.customLoadObservable.add((data) => {
        //         SerializationTools.Deserialize(data, globalState);
        //         globalState.mode = options.nodeMaterial.mode;
        //         globalState.onResetRequiredObservable.notifyObservers(false);
        //         globalState.onBuiltObservable.notifyObservers();
        //     });
        // }

        this._CurrentState = globalState;

        globalState.hostWindow.addEventListener("beforeunload", () => {
            globalState.onPopupClosedObservable.notifyObservers();
        });

        // Close the popup window when the page is refreshed or scene is disposed
        const popupWindow = (Popup as any)[filterEditorPopupId];
        if (globalState.smartFilter && popupWindow) {
            options.engine.onDisposeObservable.addOnce(() => {
                if (popupWindow) {
                    popupWindow.close();
                }
            });
            window.onbeforeunload = () => {
                const popupWindow = (Popup as any)[filterEditorPopupId];
                if (popupWindow) {
                    popupWindow.close();
                }
            };
        }
    }

    public static Hide() {
        const popupWindow = (Popup as any)[filterEditorPopupId];
        if (popupWindow) {
            popupWindow.close();
        }
    }
}
