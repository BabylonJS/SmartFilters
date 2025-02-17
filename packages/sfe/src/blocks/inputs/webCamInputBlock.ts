import type { ThinEngine } from "@babylonjs/core/Engines/thinEngine.js";
import { WebCamRuntime } from "./webCamRuntime.js";
import {
    ConnectionPointType,
    type SmartFilter,
    type InitializationData,
    InputBlock,
    createStrongRef,
    editableInPropertyPage,
    PropertyTypeForEdition,
    type IEditablePropertyListOption,
} from "@babylonjs/smart-filters";
import { Observable } from "@babylonjs/core/Misc/observable.js";

/**
 * A type representing a webcam source
 */
export type WebCamSource = {
    /** The friendly name of the device */
    label: string;
    /** The deviceId */
    value: string;
};

export const WebCamInputBlockName = "WebCam";

const LocalStorageWebcamIdKey = "webCamDeviceId";
const LocalStorageNameKey = "webCamName";
const DefaultWebCamSource: WebCamSource = {
    label: "Default",
    value: "",
};

/**
 * A utility class to manage the webcam sources for the WebCamInputBlock
 */
class WebcamSourceManager {
    /**
     * The list of available webcam sources
     */
    public sources: WebCamSource[] = [];

    /**
     * An observable that is notified when the sources are loaded
     */
    public readonly onSourcesLoaded: Observable<WebCamSource[]> = new Observable(undefined, true);

    /**
     * Creates a new WebcamSourceManager
     */
    constructor() {
        this._updateWebcamSources();
        navigator.mediaDevices.addEventListener("devicechange", () => {
            this._updateWebcamSources();
        });
    }

    private async _updateWebcamSources(): Promise<void> {
        let foundDefault = false;
        const devices = await navigator.mediaDevices.enumerateDevices();
        const sources = devices
            .filter((device: MediaDeviceInfo) => device.kind === "videoinput")
            .map((device: MediaDeviceInfo) => {
                if (device.deviceId === "") {
                    foundDefault = true;
                    return DefaultWebCamSource;
                }
                return {
                    label: device.label,
                    value: device.deviceId,
                };
            });
        if (!foundDefault) {
            sources.unshift(DefaultWebCamSource);
        }

        // Only update if the sources have changed (sometimes, they don't)
        if (JSON.stringify(this.sources) !== JSON.stringify(sources)) {
            this.sources = sources;
            this.onSourcesLoaded.notifyObservers(this.sources);
        }
    }
}

/**
 * A custom InputBlock that exposes webcam feed as a texture
 */
export class WebCamInputBlock extends InputBlock<ConnectionPointType.Texture> {
    private static _WebCamSourceManager: WebcamSourceManager = new WebcamSourceManager();
    private readonly _engine: ThinEngine;
    private _webCamRuntime: WebCamRuntime | undefined;
    private _webCamSource: WebCamSource;

    /**
     * The webcam source
     */
    public get webcamSource(): WebCamSource {
        return this._webCamSource;
    }
    /**
     * The webcam source
     */
    public set webcamSource(webcamSource: WebCamSource) {
        if (this._webCamRuntime) {
            this._webCamRuntime.deviceId = webcamSource.value;
        }
        this._webCamSource = webcamSource;

        // Save the last used webcam source
        localStorage.setItem(LocalStorageWebcamIdKey, webcamSource.value);
        localStorage.setItem(LocalStorageNameKey, webcamSource.label);
    }

    /**
     * The id of the webcam source
     */
    @editableInPropertyPage("Source", PropertyTypeForEdition.List, "PROPERTIES", {
        notifiers: { update: true },
        options: WebCamInputBlock._WebCamSourceManager.onSourcesLoaded as Observable<IEditablePropertyListOption[]>,
        valuesAreStrings: true,
    })
    public set webcamSourceId(id: string) {
        const source = WebCamInputBlock._WebCamSourceManager.sources.find((source) => source.value === id);
        this.webcamSource = source ?? this.webcamSource;
    }

    /**
     * The id of the webcam source
     */
    public get webcamSourceId(): string {
        return this._webCamSource.value;
    }

    /**
     * Creates a new WebCamInputBlock
     * @param smartFilter - the SmartFilter to which this block belongs
     * @param engine - the engine to use to render the webcam
     */
    constructor(smartFilter: SmartFilter, engine: ThinEngine) {
        super(smartFilter, WebCamInputBlockName, ConnectionPointType.Texture, createStrongRef(null));
        this._engine = engine;

        // Load the last used webcam source
        const lastWebCamId = localStorage.getItem(LocalStorageWebcamIdKey);
        const lastWebCamName = localStorage.getItem(LocalStorageNameKey);
        if (lastWebCamId && lastWebCamName) {
            this._webCamSource = {
                label: lastWebCamName,
                value: lastWebCamId,
            };
        } else {
            this._webCamSource = DefaultWebCamSource;
        }
    }

    /**
     * Initializes the webcam runtime
     * @returns the webcam runtime
     */
    public initializeWebCamRuntime(): WebCamRuntime {
        this._webCamRuntime = new WebCamRuntime(this._engine, this.runtimeValue);
        this._webCamRuntime.deviceId = this._webCamSource.value;
        return this._webCamRuntime;
    }

    /**
     * Generates the commands and gathers the initialization promises
     * @param initializationData - the initialization data
     * @param _finalOutput - if true, this is the final output of the SmartFilter
     */
    public override generateCommandsAndGatherInitPromises(
        initializationData: InitializationData,
        _finalOutput: boolean
    ): void {
        initializationData.disposableResources.push(this.initializeWebCamRuntime());
    }
}
