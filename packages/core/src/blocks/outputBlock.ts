import type { InitializationData, SmartFilter } from "../smartFilter";
import { ConnectionPointType } from "../connection/connectionPointType.js";
import { BaseBlock } from "./baseBlock.js";
import { ShaderBinding, ShaderRuntime } from "../runtime/shaderRuntime.js";
import type { Nullable } from "@babylonjs/core/types";
import type { RenderTargetWrapper } from "@babylonjs/core/Engines/renderTargetWrapper";
import { registerFinalRenderCommand } from "../utils/renderTargetUtils.js";
import type { RuntimeData } from "../connection/connectionPoint";
import type { Effect } from "@babylonjs/core/Materials/effect";
import { shaderProgram, uniforms } from "./outputBlock.shader.js";

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
     * If supplied, the Smart Filter will render into this RenderTargetWrapper. Otherwise, it renders
     * into the the canvas or WebGL context the ThinEngine is using for rendering.
     */
    public renderTargetWrapper: Nullable<RenderTargetWrapper> = null;

    /**
     * Create a new output block.
     * @param smartFilter - The smart filter this block belongs to
     */
    constructor(smartFilter: SmartFilter) {
        super(smartFilter, "output");
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
        this._confirmRuntimeDataSupplied(this.input);
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
        // In the case that this OutputBlock is directly connected to a texture InputBlock, we must
        // use a shader to copy the texture to the render target texture.
        if (this.input.connectedTo?.ownerBlock.isInput && this.input.runtimeData) {
            const runtime = initializationData.runtime;

            const shaderBlockRuntime = new ShaderRuntime(
                runtime.effectRenderer,
                shaderProgram,
                new OutputShaderBinding(this.input.runtimeData)
            );
            initializationData.initializationPromises.push(shaderBlockRuntime.onReadyAsync);
            runtime.registerResource(shaderBlockRuntime);

            registerFinalRenderCommand(this.renderTargetWrapper, runtime, this, shaderBlockRuntime);

            super.generateCommandsAndGatherInitPromises(initializationData, finalOutput);
        }
    }
}

/**
 * Shader binding to use when the OutputBlock is directly connected to a texture InputBlock.
 */
class OutputShaderBinding extends ShaderBinding {
    private readonly _inputTexture: RuntimeData<ConnectionPointType.Texture>;

    /**
     * Creates a new shader binding instance.
     * @param inputTexture - defines the input texture to copy
     */
    constructor(inputTexture: RuntimeData<ConnectionPointType.Texture>) {
        super();
        this._inputTexture = inputTexture;
    }

    /**
     * Binds all the required data to the shader when rendering.
     * @param effect - defines the effect to bind the data to
     * @internal
     */
    public override bind(effect: Effect): void {
        effect.setTexture(this.getRemappedName(uniforms.input), this._inputTexture.value);
    }
}
