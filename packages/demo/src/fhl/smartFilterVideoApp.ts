import type { videoEffects } from "@microsoft/teams-js";
import { ThinEngine } from "@babylonjs/core/Engines/thinEngine";
import { Texture } from "@babylonjs/core/Materials/Textures/texture";
import type { SmartFilterRuntime } from "@babylonjs/smart-filters";
import type { Nullable } from "@babylonjs/core/types";
import { ThinTexture } from "@babylonjs/core/Materials/Textures/thinTexture";
import "@babylonjs/core/Engines/Extensions/engine.dynamicTexture";
import type { InternalTexture } from "@babylonjs/core/Materials/Textures/internalTexture";
import { ReactionsSmartFilter } from "./reactionsSmartFilter";
import type { IEffect } from "./effects/IEffect";
import { LikeEffect } from "./effects/likeEffect";
import type { Observable } from "@babylonjs/core/Misc/observable";

export const SMART_FILTER_EFFECT_ID = "f71bd30b-c5e9-48ff-b039-42bc19df95a8";
export const LOCAL_SMART_FILTER_EFFECT_ID = "fb9f0fab-9eb9-4756-8588-8dc3c6ad04d0";

export class SmartFilterVideoApp {
    private _outputCanvas: HTMLCanvasElement;
    private _onLikeClickedObservable: Observable<void>;

    private _engine: ThinEngine;
    private _internalInputTexture: InternalTexture;
    private _inputTexture: ThinTexture;
    private _smartFilter: ReactionsSmartFilter;
    private _currentEffect: Nullable<IEffect> = null;
    private _smartFilterRuntime: Nullable<SmartFilterRuntime> = null;

    constructor(outputCanvas: HTMLCanvasElement, onLikeClickedObservable: Observable<void>) {
        this._outputCanvas = outputCanvas;
        this._onLikeClickedObservable = onLikeClickedObservable;

        this._engine = new ThinEngine(this._outputCanvas);

        // Create Dynamic Texture
        this._internalInputTexture = this._engine.createDynamicTexture(
            this._outputCanvas.width,
            this._outputCanvas.height,
            false,
            Texture.BILINEAR_SAMPLINGMODE
        );
        this._inputTexture = new ThinTexture(this._internalInputTexture);

        // Create Smart Filter
        this._smartFilter = new ReactionsSmartFilter(this._engine);
    }

    public async initRuntime(): Promise<void> {
        this._smartFilterRuntime = await this._smartFilter.initRuntime(this._inputTexture);

        // Listen to button clicks
        this._onLikeClickedObservable.add(() => {
            console.log("Like button clicked");
            this._startEffect(new LikeEffect(this._smartFilter));
        });
    }

    public videoEffectSelected(effectId: string | undefined): Promise<void> {
        console.log("videoEffectSelected() called", effectId);
        return Promise.resolve();
    }

    private _startEffect(effect: IEffect): void {
        if (this._currentEffect) {
            this._currentEffect.stop(false);
        }

        this._currentEffect = effect;
        this._currentEffect.onEffectCompleted.add(() => {
            console.log("Effect completed");
            if (this._currentEffect == effect) {
                this._currentEffect = null;
            }
        });
        this._currentEffect.start();
    }

    async videoFrameHandler(frame: videoEffects.VideoFrameData): Promise<VideoFrame> {
        try {
            const videoFrame = frame.videoFrame as VideoFrame;

            if (this._currentEffect === null) {
                return videoFrame;
            }

            this._engine.updateDynamicTexture(this._internalInputTexture, videoFrame as unknown as any, true);

            this._engine.beginFrame();
            this._smartFilterRuntime!.render();
            this._engine.endFrame();

            const outputVideoFrame = new VideoFrame(this._outputCanvas, {
                displayHeight: videoFrame.displayHeight,
                displayWidth: videoFrame.displayWidth,
                timestamp: videoFrame.timestamp,
            });

            return outputVideoFrame;
        } catch (e) {
            console.error(e);
            throw e;
        }
    }

    async videoBufferHandler(
        _videoBufferData: videoEffects.VideoBufferData,
        _notifyVideoFrameProcessed: () => void,
        _notifyError: (error: string) => void
    ) {
        console.error("videoBufferHandler was called and is not yet implemented");
    }
}
