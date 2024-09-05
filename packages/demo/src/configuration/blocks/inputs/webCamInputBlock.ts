import { Observable } from "@babylonjs/core/Misc/observable.js";
import type { ThinEngine } from "@babylonjs/core/Engines/thinEngine.js";
import { WebCamSession } from "./webCamSession";
import { ConnectionPointType, type SmartFilter, type RuntimeData, InputBlock } from "@babylonjs/smart-filters";
import type { IMonitorConnectionChanges } from "@babylonjs/smart-filters-editor";

export type WebCamSource = {
    name: string;
    id: string;
};

export const WebCamInputBlockName = "WebCam";

export class WebCamInputBlock extends InputBlock<ConnectionPointType.Texture> implements IMonitorConnectionChanges {
    private readonly _engine: ThinEngine;
    private _webCamSession: WebCamSession | undefined;
    private _webCamSource: WebCamSource | undefined;

    public get webcamSource(): WebCamSource | undefined {
        return this._webCamSource;
    }

    public readonly onWebCamSourceChanged: Observable<WebCamSource | undefined> = new Observable<
        WebCamSource | undefined
    >(undefined);

    constructor(smartFilter: SmartFilter, engine: ThinEngine, initialValue: RuntimeData<ConnectionPointType.Texture>) {
        super(smartFilter, WebCamInputBlockName, ConnectionPointType.Texture, initialValue);
        this._engine = engine;

        this.onWebCamSourceChanged.add(this._onWebCamSourceChanged.bind(this));

        WebCamInputBlock.EnumerateWebCamSources().then((sources) => {
            if (sources.length > 0) {
                this.onWebCamSourceChanged.notifyObservers(sources[0]);
            }
        });
    }

    public onConnectionsChanged(): void {
        this._loadOrUnloadWebCam();
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

    private _onWebCamSourceChanged(webCamSource: WebCamSource | undefined): void {
        this._webCamSource = webCamSource;
        this._loadOrUnloadWebCam();
    }

    private async _loadOrUnloadWebCam(): Promise<void> {
        const shouldBeLoaded = this._webCamSource !== undefined && this.output.endpoints.length > 0;
        const currentWebCamSourceId = this._webCamSource?.id;

        if (
            this._webCamSession &&
            (!shouldBeLoaded || (shouldBeLoaded && this._webCamSession.deviceId !== currentWebCamSourceId))
        ) {
            this._webCamSession.dispose();
            this._webCamSession = undefined;
        }

        if (shouldBeLoaded) {
            this._webCamSession = new WebCamSession(this._engine, this.runtimeValue);
            try {
                await this._webCamSession.loadWebCam(currentWebCamSourceId);
            } catch (e) {
                console.error("Failed to load WebCam", e);
            }
        }
    }
}
