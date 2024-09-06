import type { ThinEngine } from "@babylonjs/core/Engines/thinEngine.js";
import type { ConnectionPointType, IDisposable, RuntimeData } from "@babylonjs/smart-filters";
import { WebCamSession } from "./webCamSession";

/**
 * Manages the runtime of WebCam input block, hooking it up to a texture, responding to changes in source,
 * and disposing of it when done.
 */
export class WebCamRuntime implements IDisposable {
    private readonly _engine: ThinEngine;
    private readonly _textureOutput: RuntimeData<ConnectionPointType.Texture>;
    private _currentSession: WebCamSession | undefined;
    public _deviceId: string | undefined;

    public get deviceId(): string | undefined {
        return this._deviceId;
    }

    public set deviceId(value: string | undefined) {
        if (this._deviceId !== value) {
            this._deviceId = value;
            this._refresh();
        }
    }

    constructor(engine: ThinEngine, textureOutput: RuntimeData<ConnectionPointType.Texture>) {
        this._engine = engine;
        this._textureOutput = textureOutput;
    }

    private _refresh(): void {
        if (this._currentSession) {
            this._currentSession.dispose();
            this._currentSession = undefined;
        }

        if (this._deviceId) {
            this._currentSession = new WebCamSession(this._engine, this._textureOutput, this._deviceId);
            this._currentSession.load().catch((e) => {
                console.error("Failed to load webcam", e);
            });
        }
    }

    public dispose(): void {
        if (this._currentSession) {
            this._currentSession.dispose();
            this._currentSession = undefined;
        }
    }
}
