import type { Effect } from "@babylonjs/core/Materials/effect";

import type { SmartFilter, IDisableableBlock, RuntimeData } from "@babylonjs/smart-filters";
import {
    ConnectionPointType,
    createStrongRef,
    DisableableShaderBlock,
    DisableableShaderBinding,
    DisableStrategy,
} from "@babylonjs/smart-filters";
import { BlockNames } from "../blockNames";
import { shaderProgram, uniforms } from "./pixelateBlock.shader";

/**
 * The shader bindings for the Pixelate block.
 */
export class PixelateShaderBinding extends DisableableShaderBinding {
    private readonly _inputTexture: RuntimeData<ConnectionPointType.Texture>;
    private readonly _intensity: RuntimeData<ConnectionPointType.Float>;

    /**
     * Creates a new shader binding instance for the Kaleidoscope block.
     * @param parentBlock - The parent block
     * @param inputTexture - The input texture
     * @param intensity - The intensity of the effect
     */
    constructor(
        parentBlock: IDisableableBlock,
        inputTexture: RuntimeData<ConnectionPointType.Texture>,
        intensity: RuntimeData<ConnectionPointType.Float>
    ) {
        super(parentBlock);
        this._inputTexture = inputTexture;
        this._intensity = intensity;
    }

    /**
     * Binds all the required data to the shader when rendering.
     * @param effect - defines the effect to bind the data to
     */
    public override bind(effect: Effect): void {
        super.bind(effect);
        effect.setTexture(this.getRemappedName(uniforms.input), this._inputTexture.value);
        effect.setFloat(this.getRemappedName(uniforms.intensity), this._intensity.value);
    }
}

/**
 * A simple block pixelating the input texture.
 */
export class PixelateBlock extends DisableableShaderBlock {
    /**
     * The class name of the block.
     */
    public static override ClassName = BlockNames.pixelate;

    /**
     * The input texture connection point.
     */
    public readonly input = this._registerInput("input", ConnectionPointType.Texture);

    /**
     * The intensity connection point.
     */
    public readonly intensity = this._registerOptionalInput(
        "intensity",
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
        super(smartFilter, name, false, DisableStrategy.Manual);
    }

    /**
     * Get the class instance that binds all the required data to the shader (effect) when rendering.
     * @returns The class instance that binds the data to the effect
     */
    public getShaderBinding(): DisableableShaderBinding {
        const input = this._confirmRuntimeDataSupplied(this.input);
        const intensity = this.intensity.runtimeData;

        return new PixelateShaderBinding(this, input, intensity);
    }
}
