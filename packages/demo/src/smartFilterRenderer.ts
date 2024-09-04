import { Observable } from "@babylonjs/core/Misc/observable.js";
import type { ThinEngine } from "@babylonjs/core/Engines/thinEngine";
import type { Nullable } from "@babylonjs/core/types";
import {
    ConnectionPointType,
    type InputBlock,
    type SmartFilter,
    type SmartFilterRuntime,
} from "@babylonjs/smart-filters";
import { RenderTargetGenerator } from "@babylonjs/smart-filters";
import { loadTextureInputBlockAsset } from "@babylonjs/smart-filters-editor";
import { registerAnimations } from "./helpers/registerAnimations";

/**
 * Simple example of rendering a Smart Filter
 */
export class SmartFilterRenderer {
    private _assetDisposeWork: (() => void)[] = [];
    private _animationDisposeWork: Nullable<() => void> = null;

    /**
     * Callback called before rendering the filter every frame.
     */
    public readonly beforeRenderObservable: Observable<void>;

    /**
     * Callback called after rendering the filter every frame.
     */
    public readonly afterRenderObservable: Observable<void>;

    /**
     * The engine used to render the filter.
     */
    public readonly engine: ThinEngine;

    /**
     * The current runtime to render the filter.
     */
    public runtime: Nullable<SmartFilterRuntime> = null;

    /**
     * Creates a new smart filter renderer.
     * @param engine - the engine to use to render the filter
     */
    public constructor(engine: ThinEngine) {
        this.engine = engine;
        this.beforeRenderObservable = new Observable<void>();
        this.afterRenderObservable = new Observable<void>();

        this.engine.depthCullingState.depthTest = false;
        this.engine.stencilState.stencilTest = false;
    }

    /**
     * Starts rendering the filter. (won't stop until dispose is called)
     */
    public async startRendering(filter: SmartFilter, optimizeTextures = false) {
        const rtg = new RenderTargetGenerator(optimizeTextures);
        const runtime = await filter.createRuntimeAsync(this.engine, rtg);

        await this._loadAssets(filter);
        this._loadAnimations(filter);

        console.log("Number of render targets created: " + rtg.numTargetsCreated);

        this._setRuntime(runtime);
        return this.runtime;
    }

    /**
     * Sets the runtime to render.
     */
    private _setRuntime(runtime: SmartFilterRuntime) {
        this.engine.stopRenderLoop();

        // Dispose the previous runtime.
        if (this.runtime) {
            this.runtime.dispose();
        }

        this.engine.runRenderLoop(() => {
            this.beforeRenderObservable.notifyObservers();

            runtime.render();

            this.afterRenderObservable.notifyObservers();
        });

        this.runtime = runtime;
    }

    /**
     * If the SmartFilter had any assets, such as images or videos for input texture blocks,
     * and the necessary information to rehydrate them is present in the editor data, load
     * those assets now.
     * @param smartFilter - The SmartFilter to load assets for
     */
    private async _loadAssets(smartFilter: SmartFilter): Promise<void> {
        // Dispose all previous assets
        for (const work of this._assetDisposeWork) {
            work();
        }
        this._assetDisposeWork.length = 0;

        for (const block of smartFilter.attachedBlocks) {
            if (block.getClassName() === "InputBlock" && (block as any).type === ConnectionPointType.Texture) {
                const inputBlock = block as InputBlock<ConnectionPointType.Texture>;
                const dispose = await loadTextureInputBlockAsset(inputBlock, this.engine, this.beforeRenderObservable);
                if (dispose) {
                    this._assetDisposeWork.push(dispose);
                }
            }
        }
    }

    private _loadAnimations(smartFilter: SmartFilter): void {
        if (this._animationDisposeWork) {
            this._animationDisposeWork();
        }

        this._animationDisposeWork = registerAnimations(smartFilter, this);
    }
}
