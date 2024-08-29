import { ThinTexture } from "@babylonjs/core/Materials/Textures/thinTexture.js";
import type { ThinEngine } from "@babylonjs/core";
import { ConnectionPointType, InputBlock, RenderTargetGenerator, SmartFilter } from "@babylonjs/smart-filters";
import type { SmartFilterRenderer } from "./smartFilterRenderer";

/**
 * Helper class which makes it easy to render a texture to a Canvas, using a trivial Smart Filter graph.
 * This is used to test having Smart Filters render to a texture instead of a Canvas. The texture
 * another Smart Filter renders to can be rendered to the Canvas for display using this helper.
 */
export class TextureRenderHelper {
    private _started = false;
    private readonly _smartFilter: SmartFilter;
    private readonly _renderer: SmartFilterRenderer;
    private readonly _engine: ThinEngine;

    /**
     * The texture to be drawn to the Canvas. This can be used as the target output texture of
     * another Smart Filter graph to test the output of that graph.
     */
    public readonly inputTexture: ThinTexture;

    public constructor(engine: ThinEngine, renderer: SmartFilterRenderer) {
        const internalTexture = engine.createTexture(null, true, true, null);
        this.inputTexture = new ThinTexture(internalTexture);

        this._smartFilter = new SmartFilter("TextureRenderHelper");
        const inputBlock = new InputBlock(
            this._smartFilter,
            "inputTexture",
            ConnectionPointType.Texture,
            this.inputTexture
        );
        inputBlock.output.connectTo(this._smartFilter.output);

        this._engine = engine;
        this._renderer = renderer;
    }

    public async startAsync(): Promise<void> {
        if (this._started) {
            return;
        }
        this._started = true;

        const rtg = new RenderTargetGenerator(false);
        const runtime = await this._smartFilter.createRuntimeAsync(this._engine, rtg);

        this._renderer.afterRenderObservable.add(() => {
            runtime.render();
        });
    }
}
