import { Observable } from "@babylonjs/core/Misc/observable.js";
import type { ThinEngine } from "@babylonjs/core/Engines/thinEngine";
import type { Nullable } from "@babylonjs/core/types";
import { StateManager } from "@babylonjs/shared-ui-components/nodeGraphSystem/stateManager.js";
import { LockObject } from "@babylonjs/shared-ui-components/tabs/propertyGrids/lockObject.js";
import { SmartFilter, type SmartFilterRuntime } from "@babylonjs/smart-filters";
import { RegisterDefaultInput } from "./graphSystem/registerDefaultInput.js";
import { RegisterElbowSupport } from "./graphSystem/registerElbowSupport.js";
import { RegisterNodePortDesign } from "./graphSystem/registerNodePortDesign.js";
import type { LogEntry } from "./components/log/logComponent";

export type TexturePreset = {
    name: string;
    url: string;
};

export class GlobalState {
    engine: ThinEngine;

    smartFilter: SmartFilter;

    hostElement: HTMLElement;

    hostDocument: Document;

    hostWindow: Window;

    stateManager: StateManager;

    lockObject = new LockObject();

    pointerOverCanvas: boolean = false;

    onLogRequiredObservable = new Observable<LogEntry>();

    onPopupClosedObservable = new Observable<void>();

    onZoomToFitRequiredObservable = new Observable<void>();

    onReOrganizedRequiredObservable = new Observable<void>();

    onResetRequiredObservable = new Observable<boolean>();

    onRuntimeCreatedObservable = new Observable<SmartFilterRuntime>();

    texturePresets: TexturePreset[];

    private _runtime: Nullable<SmartFilterRuntime> = null;
    public get runtime(): Nullable<SmartFilterRuntime> {
        return this._runtime;
    }
    public set runtime(value: Nullable<SmartFilterRuntime>) {
        if (value === this._runtime) {
            return;
        }
        this._runtime = value;
        if (value) {
            this.onRuntimeCreatedObservable.notifyObservers(value);
        }
    }

    public constructor(
        engine: ThinEngine,
        smartFilter: Nullable<SmartFilter>,
        hostElement: HTMLElement,
        texturePresets: TexturePreset[] = []
    ) {
        this.stateManager = new StateManager();
        this.stateManager.data = this;
        this.stateManager.lockObject = this.lockObject;

        RegisterElbowSupport(this.stateManager);
        RegisterNodePortDesign(this.stateManager);
        RegisterDefaultInput(this.stateManager);

        this.engine = engine;
        this.smartFilter = smartFilter ?? new SmartFilter("New Filter");
        this.hostElement = hostElement;
        this.hostDocument = hostElement.ownerDocument!;
        this.hostWindow = hostElement.ownerDocument!.defaultView!;
        this.stateManager.hostDocument = this.hostDocument;
        this.texturePresets = texturePresets;
    }
}
