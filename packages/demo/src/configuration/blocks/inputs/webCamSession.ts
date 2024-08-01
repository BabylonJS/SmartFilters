import type { ThinEngine } from "@babylonjs/core/Engines/thinEngine.js";
import type { InternalTexture } from "@babylonjs/core/Materials/Textures/internalTexture.js";
import { ThinTexture } from "@babylonjs/core/Materials/Textures/thinTexture.js";
import type { ConnectionPointType, RuntimeData } from "@babylonjs/smart-filters";

/**
 * Manages the lifecycle of a WebCam session, hooking it up to a texture, and disposing of it when done.
 */
export class WebCamSession {
    private readonly _engine: ThinEngine;
    private readonly _textureOutput: RuntimeData<ConnectionPointType.Texture>;

    private _isDisposed = false;
    private _hiddenVideo: HTMLVideoElement | undefined;
    private _internalVideoTexture: InternalTexture | undefined;
    private _videoTexture: ThinTexture | undefined;
    private _mediaStream: MediaStream | undefined;
    public _deviceId: string | undefined;

    public get deviceId(): string | undefined {
        return this._deviceId;
    }

    constructor(engine: ThinEngine, textureOutput: RuntimeData<ConnectionPointType.Texture>) {
        this._engine = engine;
        this._textureOutput = textureOutput;
    }

    /**
     * Loads the WebCam, creates a ThinTexture from it, and sets that texture in textureOutput provided to the constructor.
     * @param deviceId - the id of the WebCam device to use, or undefined to use the default WebCam.
     */
    public async loadWebCam(deviceId: string | undefined): Promise<void> {
        const width = 640;
        const height = 480;

        const mediaTrackConstraints: MediaTrackConstraints = {
            width,
            height,
        };
        this._deviceId = deviceId;
        if (deviceId) {
            mediaTrackConstraints.deviceId = deviceId;
        }
        const stream = await navigator.mediaDevices.getUserMedia({
            video: mediaTrackConstraints,
            audio: false,
        });
        this._mediaStream = stream;

        if (this._isDisposed) {
            this._disposeMediaStream();
            return;
        }

        const hiddenVideo = document.createElement("video");
        this._hiddenVideo = hiddenVideo;
        document.body.append(hiddenVideo);

        hiddenVideo.style.position = "absolute";
        hiddenVideo.style.top = "0";
        hiddenVideo.style.visibility = "hidden";

        hiddenVideo.setAttribute("playsinline", "");
        hiddenVideo.muted = true;
        hiddenVideo.autoplay = true;
        hiddenVideo.loop = true;
        hiddenVideo.width = width;
        hiddenVideo.height = height;

        const internalVideoTexture = this._engine.createDynamicTexture(
            hiddenVideo.videoWidth,
            hiddenVideo.videoHeight,
            false,
            2
        );
        this._internalVideoTexture = internalVideoTexture;
        this._videoTexture = new ThinTexture(internalVideoTexture);

        hiddenVideo.onerror = () => {
            throw "Failed to load WebCam";
        };

        hiddenVideo.onloadeddata = () => {
            const update = () => {
                if (this._isDisposed) {
                    return;
                }

                if (hiddenVideo.readyState >= hiddenVideo.HAVE_CURRENT_DATA) {
                    this._engine.updateVideoTexture(internalVideoTexture, hiddenVideo, false);
                }

                hiddenVideo.requestVideoFrameCallback(update);
            };

            hiddenVideo.requestVideoFrameCallback(update);
        };

        hiddenVideo.srcObject = stream;
        this._textureOutput.value = this._videoTexture;
    }

    public dispose(): void {
        this._isDisposed = true;

        this._disposeMediaStream();
        if (this._hiddenVideo) {
            this._hiddenVideo.onloadeddata = null;
            this._hiddenVideo.pause();
            this._hiddenVideo.srcObject = null;
            document.body.removeChild(this._hiddenVideo);
            this._hiddenVideo = undefined;
        }
        if (this._videoTexture) {
            this._videoTexture.dispose();
            this._videoTexture = undefined;
        }
        if (this._internalVideoTexture) {
            this._internalVideoTexture.dispose();
            this._internalVideoTexture = undefined;
        }
    }

    private _disposeMediaStream(): void {
        if (this._mediaStream) {
            this._mediaStream.getTracks().forEach((track) => track.stop());
            this._mediaStream = undefined;
        }
    }
}
