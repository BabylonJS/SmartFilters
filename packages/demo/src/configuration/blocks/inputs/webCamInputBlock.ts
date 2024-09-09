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

export class WebCamInputBlock extends InputBlock<ConnectionPointType.Texture> {
    private readonly _engine: ThinEngine;
    private _webCamRuntime: WebCamRuntime | undefined;
    private _webCamSource: WebCamSource | undefined;

    public get webcamSource(): WebCamSource | undefined {
        return this._webCamSource;
    }

    public readonly onWebCamSourceChanged: Observable<WebCamSource | undefined> = new Observable<
        WebCamSource | undefined
    >(undefined);

    constructor(smartFilter: SmartFilter, engine: ThinEngine) {
        super(smartFilter, WebCamInputBlockName, ConnectionPointType.Texture, createStrongRef(null));
        this._engine = engine;

        this.onWebCamSourceChanged.add(this._onWebCamSourceChanged.bind(this));

        WebCamInputBlock.EnumerateWebCamSources().then((sources) => {
            if (sources.length > 0) {
                this.onWebCamSourceChanged.notifyObservers(sources[0]);
            }
        });
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

    public override generateCommandsAndGatherInitPromises(
        initializationData: InitializationData,
        _finalOutput: boolean
    ): void {
        this._webCamRuntime = new WebCamRuntime(this._engine, this.runtimeValue);
        this._webCamRuntime.deviceId = this._webCamSource?.id || "";
        initializationData.disposableResources.push(this._webCamRuntime);
    }

    private async _onWebCamSourceChanged(webCamSource: WebCamSource | undefined): Promise<void> {
        if (this._webCamRuntime) {
            this._webCamRuntime.deviceId = webCamSource?.id || "";
        }
        this._webCamSource = webCamSource;
    }
}
