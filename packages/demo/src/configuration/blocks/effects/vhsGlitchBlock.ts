import type { Effect } from "@babylonjs/core/Materials/effect";
import { type SmartFilter, type IDisableableBlock, type RuntimeData, createStrongRef } from "@babylonjs/smart-filters";
import { ShaderBlock, ConnectionPointType, ShaderBinding } from "@babylonjs/smart-filters";
import { BlockNames } from "../blockNames";
import { shaderProgram, uniforms } from "./vhsGlitchBlock.shader";

/**
 * The shader bindings for the VhsGlitch block.
 */
export class VhsGlitchShaderBinding extends ShaderBinding {
    private readonly _inputTexture: RuntimeData<ConnectionPointType.Texture>;
    private readonly _time: RuntimeData<ConnectionPointType.Float>;

    /**
     * Creates a new shader binding instance for the VHSGlitch block.
     * @param parentBlock - The parent block
     * @param inputTexture - The input texture
     * @param time - The time passed since the start of the effect
     */
    constructor(
        parentBlock: IDisableableBlock,
        inputTexture: RuntimeData<ConnectionPointType.Texture>,
        time: RuntimeData<ConnectionPointType.Float>
    ) {
        super(parentBlock);
        this._inputTexture = inputTexture;
        this._time = time;
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
        effect.setFloat(this.getRemappedName(uniforms.time), this._time.value);
    }
}

/**
 * A block that adds a broken VHS glitch effect to the input texture.
 */
export class VhsGlitchBlock extends ShaderBlock {
    /**
     * The class name of the block.
     */
    public static override ClassName = BlockNames.vhsGlitch;

    /**
     * The input texture connection point
     */
    public readonly input = this._registerInput("input", ConnectionPointType.Texture);

    /**
     * The time connection point to animate the effect.
     */
    public readonly time = this._registerOptionalInput("time", ConnectionPointType.Float, createStrongRef(0.3));

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
    public getShaderBinding(): ShaderBinding {
        const input = this._confirmRuntimeDataSupplied(this.input);
        const time = this.time.runtimeData;

        return new VhsGlitchShaderBinding(this, input, time);
    }
}
