import { Observable } from "@babylonjs/core/Misc/observable.js";
import type { ThinEngine } from "@babylonjs/core/Engines/thinEngine.js";
import { WebCamRuntime } from "./webCamRuntime";
import { ConnectionPointType, type SmartFilter, InputBlock, createStrongRef } from "@babylonjs/smart-filters";
import type { InitializationData } from "core/src/smartFilter";

export type WebCamSource = {
    name: string;
    id: string;
};

export const WebCamInputBlockName = "WebCam";

const LocalStorageWebcamIdKey = "webCamDeviceId";
const LocalStorageNameKey = "webCamName";

export class WebCamInputBlock extends InputBlock<ConnectionPointType.Texture> {
    private readonly _engine: ThinEngine;
    private _webCamRuntime: WebCamRuntime | undefined;
    private _webCamSource: WebCamSource;

    public get webcamSource(): WebCamSource {
        return this._webCamSource;
    }

    public readonly onWebCamSourceChanged: Observable<WebCamSource> = new Observable<WebCamSource>(undefined);

    constructor(smartFilter: SmartFilter, engine: ThinEngine) {
        super(smartFilter, WebCamInputBlockName, ConnectionPointType.Texture, createStrongRef(null));
        this._engine = engine;

        // Load the last used webcam source
        const lastWebCamId = localStorage.getItem(LocalStorageWebcamIdKey);
        const lastWebCamName = localStorage.getItem(LocalStorageNameKey);
        if (lastWebCamId && lastWebCamName) {
            this._webCamSource = {
                id: lastWebCamId,
                name: lastWebCamName,
            };
        } else {
            this._webCamSource = {
                id: "",
                name: "Default",
            };
        }

        this.onWebCamSourceChanged.add(this._onWebCamSourceChanged.bind(this));
    }

    public static async EnumerateWebCamSources(): Promise<WebCamSource[]> {
        const devices = await navigator.mediaDevices.enumerateDevices();

        return devices
            .filter((device: MediaDeviceInfo) => device.kind === "videoinput")
            .map((device: MediaDeviceInfo) => ({
                name: device.label,
                id: device.deviceId,
            }));
    }

    public initializeWebCamRuntime(): WebCamRuntime {
        this._webCamRuntime = new WebCamRuntime(this._engine, this.runtimeValue);
        this._webCamRuntime.deviceId = this._webCamSource.id;
        return this._webCamRuntime;
    }

    public override generateCommandsAndGatherInitPromises(
        initializationData: InitializationData,
        _finalOutput: boolean
    ): void {
        initializationData.disposableResources.push(this.initializeWebCamRuntime());
    }

    private async _onWebCamSourceChanged(webCamSource: WebCamSource): Promise<void> {
        if (this._webCamRuntime) {
            this._webCamRuntime.deviceId = webCamSource.id;
        }
        this._webCamSource = webCamSource;

        // Save the last used webcam source
        localStorage.setItem(LocalStorageWebcamIdKey, webCamSource.id);
        localStorage.setItem(LocalStorageNameKey, webCamSource.name);
    }
}
