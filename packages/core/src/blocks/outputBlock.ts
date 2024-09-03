import type { InitializationData, SmartFilter } from "../smartFilter";
import { ConnectionPointType } from "../connection/connectionPointType.js";
import { BaseBlock } from "./baseBlock.js";
import { CopyBlock } from "./copyBlock.js";
import { ShaderRuntime } from "../runtime/shaderRuntime.js";
import type { Nullable } from "@babylonjs/core/types";
import type { ThinRenderTargetTexture } from "@babylonjs/core/Materials/Textures/thinRenderTargetTexture";
import { registerFinalRenderCommand } from "../utils/renderTargetUtils.js";

/**
 * The output block of a smart filter.
 *
 * Only the smart filter will internally create and host the output block.
 * It should not be exported through the main index.ts module.
 */
export class OutputBlock extends BaseBlock {
    /**
     * The class name of the block.
     */
    public static override ClassName = "OutputBlock";

    /**
     * Input connection point of the output block.
     * This takes a texture as input.
     */
    public readonly input = this._registerInput("input", ConnectionPointType.Texture);

    /**
     * If supplied, the Smart Filter will render into this texture. Otherwise, it renders
     * into the the canvas or WebGL context the ThinEngine is using for rendering.
     */
    public renderTargetTexture: Nullable<ThinRenderTargetTexture> = null;

    private _copyBlock: CopyBlock | null;

    /**
     * Create a new output block.
     * @param smartFilter - The smart filter this block belongs to
     */
    constructor(smartFilter: SmartFilter) {
        super(smartFilter, "output");

        this._copyBlock = null;
    }

    private _getCopyBlock(): CopyBlock {
        if (!this._copyBlock) {
            this._copyBlock = new CopyBlock(this.smartFilter, "copy");
            this._copyBlock.input.runtimeData = this.input.runtimeData;
        }

        return this._copyBlock;
    }

    /**
     * Prepares all blocks for runtime by traversing the graph.
     */
    public override prepareForRuntime(): void {
        this.visit({}, (block: BaseBlock, _extraData: Object) => {
            if (block !== this) {
                block.prepareForRuntime();
            }
        });
    }

    /**
     * Propagates the runtime data for all graph blocks.
     */
    public override propagateRuntimeData(): void {
        this.visit({}, (block: BaseBlock, _extraData: Object) => {
            if (block !== this) {
                block.propagateRuntimeData();
            }
        });
    }

    /**
     * Generates the commands needed to execute the block at runtime and gathers promises for initialization work
     * @param initializationData - The initialization data to use
     * @param finalOutput - Defines if the block is the final output of the smart filter
     */
    public override generateCommandsAndGatherInitPromises(
        initializationData: InitializationData,
        finalOutput: boolean
    ): void {
        const copyBlock = this._getCopyBlock();
        const runtime = initializationData.runtime;

        const shaderBlockRuntime = new ShaderRuntime(
            runtime.effectRenderer,
            copyBlock.getShaderProgram(),
            copyBlock.getShaderBinding()
        );
        initializationData.initializationPromises.push(shaderBlockRuntime.onReadyAsync);
        runtime.registerResource(shaderBlockRuntime);

        registerFinalRenderCommand(this.renderTargetTexture, runtime, this, shaderBlockRuntime);

        super.generateCommandsAndGatherInitPromises(initializationData, finalOutput);
    }
}
