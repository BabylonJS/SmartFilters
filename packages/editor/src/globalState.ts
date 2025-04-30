import { Observable } from "@babylonjs/core/Misc/observable.js";
import type { ThinEngine } from "@babylonjs/core/Engines/thinEngine";
import type { Nullable } from "@babylonjs/core/types";
import { StateManager } from "@babylonjs/shared-ui-components/nodeGraphSystem/stateManager.js";
import { LockObject } from "@babylonjs/shared-ui-components/tabs/propertyGrids/lockObject.js";
import { type BaseBlock, type ConnectionPoint, SmartFilter } from "@babylonjs/smart-filters";
import type { IBlockRegistration } from "@babylonjs/smart-filters-blocks";
import { RegisterDefaultInput } from "./graphSystem/registerDefaultInput.js";
import { RegisterElbowSupport } from "./graphSystem/registerElbowSupport.js";
import { RegisterNodePortDesign } from "./graphSystem/registerNodePortDesign.js";
import type { LogEntry } from "./components/log/logComponent";
import type { GraphNode } from "@babylonjs/shared-ui-components/nodeGraphSystem/graphNode.js";
import type { BlockEditorRegistration } from "./configuration/blockEditorRegistration.js";
import type { IPortData } from "@babylonjs/shared-ui-components/nodeGraphSystem/interfaces/portData.js";
import { BlockTools } from "./blockTools.js";
import { ObservableProperty } from "./helpers/observableProperty.js";

export type TexturePreset = {
    name: string;
    url: string;
};

const PreviewBackgroundStorageKey = "PreviewBackground";
export const DefaultPreviewAspectRatio = "1.33333";
export const PreviewAspectRatioKey = "PreviewAspectRatio";

export class GlobalState {
    private _previewBackground: string;

    engine: Nullable<ThinEngine>;

    onNewEngine: Nullable<(engine: ThinEngine) => void>;

    onSmartFilterLoadedObservable: Nullable<Observable<SmartFilter>>;

    optimizerEnabled: Nullable<ObservableProperty<boolean>>;

    previewAspectRatio: ObservableProperty<string> = new ObservableProperty<string>(
        localStorage.getItem(PreviewAspectRatioKey) ?? DefaultPreviewAspectRatio
    );

    smartFilter: SmartFilter;

    blockEditorRegistration: BlockEditorRegistration;

    hostElement: HTMLElement;

    hostDocument: Document;

    hostWindow: Window;

    stateManager: StateManager;

    beforeRenderObservable: Observable<void>;

    lockObject = new LockObject();

    pointerOverCanvas: boolean = false;

    onGetNodeFromBlock: (block: BaseBlock) => Nullable<GraphNode> = () => null;

    onLogRequiredObservable: Observable<LogEntry>;

    onPopupClosedObservable = new Observable<void>();

    onZoomToFitRequiredObservable = new Observable<void>();

    onReOrganizedRequiredObservable = new Observable<void>();

    onResetRequiredObservable = new Observable<boolean>();

    onPreviewResetRequiredObservable = new Observable<void>();

    onSaveEditorDataRequiredObservable: Observable<void>;

    onlyShowCustomBlocksObservable = new Observable<boolean>();

    texturePresets: TexturePreset[];

    downloadSmartFilter?: () => void;

    loadSmartFilter?: (file: File, engine: ThinEngine) => Promise<Nullable<SmartFilter>>;

    saveToSnippetServer?: (() => void) | undefined;

    rebuildRuntime: () => void;

    reloadAssets: () => void;

    addCustomBlock?: (serializedData: string) => void;

    deleteCustomBlock?: (blockRegistration: IBlockRegistration) => void;

    public get previewBackground(): string {
        return this._previewBackground;
    }

    public set previewBackground(value: string) {
        this._previewBackground = value;
        localStorage.setItem(PreviewBackgroundStorageKey, value);
    }

    public constructor(
        engine: Nullable<ThinEngine>,
        onNewEngine: Nullable<(engine: ThinEngine) => void>,
        onSmartFilterLoadedObservable: Nullable<Observable<SmartFilter>>,
        optimizerEnabled: Nullable<ObservableProperty<boolean>>,
        smartFilter: Nullable<SmartFilter>,
        blockEditorRegistration: BlockEditorRegistration,
        hostElement: HTMLElement,
        beforeRenderObservable: Observable<void>,
        rebuildRuntime: () => void,
        reloadAssets: () => void,
        downloadSmartFilter?: () => void,
        loadSmartFilter?: (file: File, engine: ThinEngine) => Promise<Nullable<SmartFilter>>,
        saveToSnippetServer?: () => void,
        texturePresets: TexturePreset[] = [],
        addCustomBlock?: (serializedData: string) => void,
        deleteCustomBlock?: (blockRegistration: IBlockRegistration) => void,
        onLogRequiredObservable?: Observable<LogEntry>,
        onSaveEditorDataRequiredObservable?: Observable<void>
    ) {
        this.stateManager = new StateManager();
        this.stateManager.data = this;
        this.stateManager.lockObject = this.lockObject;
        this.stateManager.getPortColor = (portData: IPortData) => {
            return BlockTools.GetColorFromConnectionNodeType((portData.data as ConnectionPoint).type);
        };

        RegisterElbowSupport(this.stateManager);
        RegisterNodePortDesign(this.stateManager);
        RegisterDefaultInput(this.stateManager);

        this.engine = engine;
        this.onNewEngine = onNewEngine;
        this.onSmartFilterLoadedObservable = onSmartFilterLoadedObservable;
        this.optimizerEnabled = optimizerEnabled;
        this.smartFilter = smartFilter ?? new SmartFilter("New Filter");
        this.blockEditorRegistration = blockEditorRegistration;
        this.hostElement = hostElement;
        this.hostDocument = hostElement.ownerDocument!;
        this.hostWindow = hostElement.ownerDocument!.defaultView!;
        this.stateManager.hostDocument = this.hostDocument;
        this.downloadSmartFilter = downloadSmartFilter;
        this.loadSmartFilter = loadSmartFilter;
        this.saveToSnippetServer = saveToSnippetServer;
        this.texturePresets = texturePresets;
        this.beforeRenderObservable = beforeRenderObservable;
        this.rebuildRuntime = rebuildRuntime;
        this.reloadAssets = reloadAssets;
        this.addCustomBlock = addCustomBlock;
        this.deleteCustomBlock = deleteCustomBlock;

        this.onLogRequiredObservable = onLogRequiredObservable ?? new Observable<LogEntry>();
        this.onSaveEditorDataRequiredObservable = onSaveEditorDataRequiredObservable ?? new Observable<void>();

        this._previewBackground = localStorage.getItem(PreviewBackgroundStorageKey) ?? "grid";
    }
}
