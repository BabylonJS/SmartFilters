import { Observable } from "@babylonjs/core/Misc/observable.js";
import type { ThinEngine } from "@babylonjs/core/Engines/thinEngine";
import type { Nullable } from "@babylonjs/core/types";
import { StateManager } from "@babylonjs/shared-ui-components/nodeGraphSystem/stateManager.js";
import { LockObject } from "@babylonjs/shared-ui-components/tabs/propertyGrids/lockObject.js";
import { type BaseBlock, SmartFilter } from "@babylonjs/smart-filters";
import { RegisterDefaultInput } from "./graphSystem/registerDefaultInput.js";
import { RegisterElbowSupport } from "./graphSystem/registerElbowSupport.js";
import { RegisterNodePortDesign } from "./graphSystem/registerNodePortDesign.js";
import type { LogEntry } from "./components/log/logComponent";
import type { BlockRegistration } from "./smartFilterEditor";
import type { GraphNode } from "@babylonjs/shared-ui-components/nodeGraphSystem/graphNode.js";

export type TexturePreset = {
    name: string;
    url: string;
};

export class GlobalState {
    engine: ThinEngine;

    smartFilter: SmartFilter;

    blockRegistration: Nullable<BlockRegistration>;

    hostElement: HTMLElement;

    hostDocument: Document;

    hostWindow: Window;

    stateManager: StateManager;

    lockObject = new LockObject();

    pointerOverCanvas: boolean = false;

    onGetNodeFromBlock: (block: BaseBlock) => Nullable<GraphNode> = () => null;

    onLogRequiredObservable = new Observable<LogEntry>();

    onPopupClosedObservable = new Observable<void>();

    onZoomToFitRequiredObservable = new Observable<void>();

    onReOrganizedRequiredObservable = new Observable<void>();

    onResetRequiredObservable = new Observable<boolean>();

    onSaveEditorDataRequiredObservable = new Observable<void>();

    texturePresets: TexturePreset[];

    downloadSmartFilter: Nullable<() => void>;

    loadSmartFilter: Nullable<(file: File) => Promise<SmartFilter>>;

    saveToSnippetServer?: (() => void) | undefined;

    rebuildRuntime: (smartFilter: SmartFilter) => void;

    reloadAssets: (smartFilter: SmartFilter) => void;

    public constructor(
        engine: ThinEngine,
        smartFilter: Nullable<SmartFilter>,
        blockRegistration: Nullable<BlockRegistration>,
        hostElement: HTMLElement,
        downloadSmartFilter: Nullable<() => void>,
        loadSmartFilter: Nullable<(file: File) => Promise<SmartFilter>>,
        rebuildRuntime: (smartFilter: SmartFilter) => void,
        reloadAssets: (smartFilter: SmartFilter) => void,
        saveToSnippetServer?: () => void,
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
        this.blockRegistration = blockRegistration;
        this.hostElement = hostElement;
        this.hostDocument = hostElement.ownerDocument!;
        this.hostWindow = hostElement.ownerDocument!.defaultView!;
        this.stateManager.hostDocument = this.hostDocument;
        this.downloadSmartFilter = downloadSmartFilter;
        this.loadSmartFilter = loadSmartFilter;
        this.saveToSnippetServer = saveToSnippetServer;
        this.texturePresets = texturePresets;
        this.rebuildRuntime = rebuildRuntime;
        this.reloadAssets = reloadAssets;
    }
}
