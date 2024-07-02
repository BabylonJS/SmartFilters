import { Observable } from "@babylonjs/core/Misc/observable.js";
import type { ThinEngine } from "@babylonjs/core/Engines/thinEngine";
import type { Nullable } from "@babylonjs/core/types";
import type { SmartFilter, SmartFilterRuntime } from "@babylonjs/smart-filters";
import { RenderTargetGenerator } from "@babylonjs/smart-filters";

/**
 * Simple class representing a filter renderer for POC purpose.
 *
 * It helps managing compat across web and native.
 */
export class SmartFilterRenderer {
    /**
     * Callback called before rendering the filter every frame.
     */
    public readonly beforeRenderObservable: Observable<void>;

    /**
     * The engine used to render the filter.
     */
    public readonly engine: ThinEngine;

    /**
     * The current runtime to render the filter.
     */
    public runtime: Nullable<SmartFilterRuntime> = null;

    /**
     * Creates a new video filter renderer.
     * @param engine - the engine to use to render the filter
     */
    public constructor(engine: ThinEngine) {
        this.engine = engine;
        this.beforeRenderObservable = new Observable<void>();

        this.engine.depthCullingState.depthTest = false;
        this.engine.stencilState.stencilTest = false;
    }

    /**
     * Starts rendering the filter. (won't stop until dispose is called)
     */
    public async startRendering(filter: SmartFilter, optimizeTextures = false) {
        const rtg = new RenderTargetGenerator(optimizeTextures);
        const runtime = await filter.createRuntimeAsync(this.engine, rtg);
        console.log("Number of render targets created: " + rtg.numTargetsCreated);
        this.setRuntime(runtime);
        return this.runtime;
    }

    /**
     * Sets the runtime to render.
     */
    public setRuntime(runtime: SmartFilterRuntime) {
        this.engine.stopRenderLoop();

        // Dispose the previous runtime.
        if (this.runtime) {
            this.runtime.dispose();
        }

        this.engine.runRenderLoop(() => {
            this.beforeRenderObservable.notifyObservers();

            runtime.render();
        });

        this.runtime = runtime;
    }
}
