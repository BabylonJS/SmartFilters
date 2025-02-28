import type { Effect } from "@babylonjs/core/Materials/effect";

import {
    type SmartFilter,
    type IDisableableBlock,
    type RuntimeData,
    DisableableShaderBinding,
} from "@babylonjs/smart-filters";
import { ConnectionPointType, DisableableShaderBlock } from "@babylonjs/smart-filters";
import { BlockNames } from "../blockNames.js";
import { babylonDemoEffectsNamespace } from "../blockNamespaces.js";
import { uniforms, shaderProgram } from "./maskBlock.shader.js";

/**
 * The shader bindings for the Mask block.
 */
export class MaskShaderBinding extends DisableableShaderBinding {
    private readonly _inputTexture: RuntimeData<ConnectionPointType.Texture>;
    private readonly _maskTexture: RuntimeData<ConnectionPointType.Texture>;

    /**
     * Creates a new shader binding instance for the Mask block.
     * @param parentBlock - The parent block
     * @param inputTexture - the input texture
     * @param maskTexture - the mask texture
     */
    constructor(
        parentBlock: IDisableableBlock,
        inputTexture: RuntimeData<ConnectionPointType.Texture>,
        maskTexture: RuntimeData<ConnectionPointType.Texture>
    ) {
        super(parentBlock);
        this._inputTexture = inputTexture;
        this._maskTexture = maskTexture;
    }

    /**
     * Binds all the required data to the shader when rendering.
     * @param effect - defines the effect to bind the data to
     */
    public override bind(effect: Effect): void {
        super.bind(effect);
        effect.setTexture(this.getRemappedName(uniforms.input), this._inputTexture.value);
        effect.setTexture(this.getRemappedName(uniforms.mask), this._maskTexture.value);
    }
}

/**
 * A simple block to apply a mask from one texture to the color of another texture
 */
export class MaskBlock extends DisableableShaderBlock {
    /**
     * The class name of the block.
     */
    public static override ClassName = BlockNames.mask;

    /**
     * The namespace of the block.
     */
    public static override Namespace = babylonDemoEffectsNamespace;

    /**
     * The input texture connection point.
     */
    public readonly input = this._registerInput("input", ConnectionPointType.Texture);

    /**
     * The mask texture connection point.
     */
    public readonly mask = this._registerInput("mask", ConnectionPointType.Texture);
    /**
     * The shader program (vertex and fragment code) to use to render the block
     */
    public static override ShaderCode = shaderProgram;

    /**
     * Instantiates a new Block.
     * @param smartFilter - The smart filter this block belongs to
     * @param name - The friendly name of the block
     */
    constructor(smartFilter: SmartFilter, name: string) {
        super(smartFilter, name);
    }

    /**
     * Get the class instance that binds all the required data to the shader (effect) when rendering.
     * @returns The class instance that binds the data to the effect
     */
    public getShaderBinding(): DisableableShaderBinding {
        const input = this._confirmRuntimeDataSupplied(this.input);
        const mask = this._confirmRuntimeDataSupplied(this.mask);

        return new MaskShaderBinding(this, input, mask);
    }
}
