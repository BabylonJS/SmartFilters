// For demo and non-commercial usage only
import type { Effect } from "@babylonjs/core/Materials/effect";
import {
    type SmartFilter,
    type IDisableableBlock,
    type RuntimeData,
    createStrongRef,
    DisableableShaderBinding,
    DisableableShaderBlock,
} from "@babylonjs/smart-filters";
import { ConnectionPointType } from "@babylonjs/smart-filters";
import { BlockNames } from "../blockNames";
import { babylonDemoEffects } from "../blockNamespaces";
import { shaderProgram, uniforms } from "./softThresholdBlock.shader";

/**
 * The shader bindings for the SoftThreshold block.
 */
export class SoftThresholdShaderBinding extends DisableableShaderBinding {
    private readonly _inputTexture: RuntimeData<ConnectionPointType.Texture>;
    private readonly _threshold: RuntimeData<ConnectionPointType.Float>;

    /**
     * Creates a new shader binding instance for the SoftThreshold block.
     * @param parentBlock - The parent block
     * @param inputTexture - The input texture
     * @param threshold - The threshold at which to apply the softness
     */
    constructor(
        parentBlock: IDisableableBlock,
        inputTexture: RuntimeData<ConnectionPointType.Texture>,
        threshold: RuntimeData<ConnectionPointType.Float>
    ) {
        super(parentBlock);
        this._inputTexture = inputTexture;
        this._threshold = threshold;
    }

    /**
     * Binds all the required data to the shader when rendering.
     * @param effect - defines the effect to bind the data to
     * @param _width - defines the width of the output. Passed in by ShaderRuntime.
     * @param _height - defines the height of the output. Passed in by ShaderRuntime.
     */
    public override bind(effect: Effect, _width: number, _height: number): void {
        super.bind(effect);
        effect.setTexture(this.getRemappedName(uniforms.input), this._inputTexture.value);
        effect.setFloat2(this.getRemappedName(uniforms.resolution), _width, _height);
        effect.setFloat(this.getRemappedName(uniforms.threshold), this._threshold.value);
    }
}

/**
 * A simple block that adds a high contrast, black-and-white effect to the input texture.
 */
export class SoftThresholdBlock extends DisableableShaderBlock {
    /**
     * The class name of the block.
     */
    public static override ClassName = BlockNames.softThreshold;

    /**
     * The namespace of the block.
     */
    public static override Namespace = babylonDemoEffects;

    /**
     * The input texture connection point
     */
    public readonly input = this._registerInput("input", ConnectionPointType.Texture);

    /**
     * The threshold at which to apply the softness.
     */
    public readonly threshold = this._registerOptionalInput(
        "threshold",
        ConnectionPointType.Float,
        createStrongRef(0.3)
    );

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
        const threshold = this._confirmRuntimeDataSupplied(this.threshold);

        return new SoftThresholdShaderBinding(this, input, threshold);
    }
}
