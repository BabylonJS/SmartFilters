import type { ThinEngine } from "@babylonjs/core/Engines/thinEngine";
import * as react from "react";
import * as reactDOM from "react-dom";
import { GlobalState } from "./globalState.js";
import { GraphEditor } from "./graphEditor.js";
import { RegisterToDisplayManagers } from "./graphSystem/registerToDisplayLedger.js";
import { RegisterToPropertyTabManagers } from "./graphSystem/registerToPropertyLedger.js";
import { RegisterTypeLedger } from "./graphSystem/registerToTypeLedger.js";
import { Popup } from "./sharedComponents/popup.js";
import type { SmartFilter, SmartFilterRuntime } from "@babylonjs/smart-filters";

export type SmartFilterEditorOptions = {
    engine: ThinEngine;

    filter?: SmartFilter;

    hostElement?: HTMLElement;

    onRuntimeCreated?: (runtime: SmartFilterRuntime) => void;
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
        RegisterToDisplayManagers();
        RegisterToPropertyTabManagers();
        RegisterTypeLedger();

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

        const globalState = new GlobalState(options.engine, options.filter ?? null, hostElement);

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

        if (options.onRuntimeCreated) {
            globalState.onRuntimeCreatedObservable.add(options.onRuntimeCreated);
        }
    }
}
