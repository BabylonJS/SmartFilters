// For demo and non-commercial usage only
import type { Effect } from "@babylonjs/core/Materials/effect";
import type { SmartFilter, IDisableableBlock, RuntimeData } from "@babylonjs/smart-filters";
import { ShaderBlock, ConnectionPointType, ShaderBinding, createStrongRef } from "@babylonjs/smart-filters";
import { shaderProgram, uniforms } from "../generators/heartsBlock.shader";
import { BlockNames } from "../blockNames";
import { Color3 } from "@babylonjs/core/Maths/math.color";

/**
 * The shader bindings for the Hearts block.
 */
export class HeartsShaderBinding extends ShaderBinding {
    private readonly _inputTexture: RuntimeData<ConnectionPointType.Texture>;
    private readonly _time: RuntimeData<ConnectionPointType.Float>;
    private readonly _tint: RuntimeData<ConnectionPointType.Color3>;

    /**
     * Creates a new shader binding instance for the hearts block.
     * @param parentBlock - The parent block
     * @param inputTexture - The input texture
     * @param time - The time passed since the start of the effect
     * @param tint - The color tint of the hearts and vignette
     */
    constructor(
        parentBlock: IDisableableBlock,
        inputTexture: RuntimeData<ConnectionPointType.Texture>,
        time: RuntimeData<ConnectionPointType.Float>,
        tint: RuntimeData<ConnectionPointType.Color3>
    ) {
        super(parentBlock);
        this._inputTexture = inputTexture;
        this._time = time;
        this._tint = tint;
    }

    /**
     * Binds all the required data to the shader when rendering.
     * @param effect - defines the effect to bind the data to
     * @param _width - defines the width of the output. Passed in
     * @param _height - defines the height of the output
     */
    public override bind(effect: Effect, _width: number, _height: number): void {
        super.bind(effect);
        effect.setTexture(this.getRemappedName(uniforms.input), this._inputTexture.value);
        effect.setFloat(this.getRemappedName(uniforms.time), this._time.value);
        effect.setFloat(this.getRemappedName(uniforms.aspectRatio), _width / _height);
        effect.setColor3(this.getRemappedName(uniforms.tint), this._tint.value);
    }
}

/**
 * A procedural block that renders a heart-emitting tunnel on the input texture.
 */
export class HeartsBlock extends ShaderBlock {
    /**
     * The class name of the block.
     */
    public static override ClassName = BlockNames.hearts;

    /**
     * The texture connection point.
     */
    public readonly input = this._registerInput("input", ConnectionPointType.Texture);

    /**
     * The time connection point.
     */
    public readonly time = this._registerOptionalInput("time", ConnectionPointType.Float, createStrongRef(0.3));

    /**
     * The tint connection point, controlling the color of the hearts and vignette.
     */
    public readonly tint = this._registerOptionalInput(
        "tint",
        ConnectionPointType.Color3,
        createStrongRef(new Color3(0.9, 0.5, 0.7))
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
    public getShaderBinding(): ShaderBinding {
        const input = this._confirmRuntimeDataSupplied(this.input);
        const time = this.time.runtimeData;
        const tint = this.tint.runtimeData;

        return new HeartsShaderBinding(this, input, time, tint);
    }
}
