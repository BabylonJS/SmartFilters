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
import { shaderProgram, uniforms } from "../generators/fireworksBlock.shader";

/**
 * The shader bindings for the Fireworks block.
 */
export class FireworksShaderBinding extends DisableableShaderBinding {
    private readonly _inputTexture: RuntimeData<ConnectionPointType.Texture>;
    private readonly _time: RuntimeData<ConnectionPointType.Float>;
    private readonly _fireworks: RuntimeData<ConnectionPointType.Float>;
    private readonly _fireworkSparks: RuntimeData<ConnectionPointType.Float>;

    /**
     * Creates a new shader binding instance for the Fireworks block.
     * @param parentBlock - The parent block
     * @param inputTexture - The input texture
     * @param time - The time passed since the start of the effect
     * @param fireworks - The number of fireworks to display
     * @param fireworkSparks - The number of sparks per firework
     */
    constructor(
        parentBlock: IDisableableBlock,
        inputTexture: RuntimeData<ConnectionPointType.Texture>,
        time: RuntimeData<ConnectionPointType.Float>,
        fireworks: RuntimeData<ConnectionPointType.Float>,
        fireworkSparks: RuntimeData<ConnectionPointType.Float>
    ) {
        super(parentBlock);
        this._inputTexture = inputTexture;
        this._time = time;
        this._fireworks = fireworks;
        this._fireworkSparks = fireworkSparks;
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
        effect.setFloat(this.getRemappedName(uniforms.aspectRatio), _width / _height);
        effect.setFloat(this.getRemappedName(uniforms.time), this._time.value);
        effect.setFloat(this.getRemappedName(uniforms.fireworks), this._fireworks.value);
        effect.setFloat(this.getRemappedName(uniforms.fireworkSparks), this._fireworkSparks.value);
    }
}

/**
 * A block that adds a fireworks effect overlaid on the input texture.
 */
export class FireworksBlock extends DisableableShaderBlock {
    /**
     * The class name of the block.
     */
    public static override ClassName = BlockNames.fireworks;

    /**
     * The input texture connection point
     */
    public readonly input = this._registerInput("input", ConnectionPointType.Texture);

    /**
     * The time connection point to animate the effect.
     */
    public readonly time = this._registerOptionalInput("time", ConnectionPointType.Float, createStrongRef(0.3));

    /**
     * The number of fireworks at a time, as a connection point.
     */
    public readonly fireworks = this._registerOptionalInput(
        "fireworks",
        ConnectionPointType.Float,
        createStrongRef(8.0)
    );

    /**
     * The number of sparks per firework, as a connection point.
     */
    public readonly fireworkSparks = this._registerOptionalInput(
        "fireworkSparks",
        ConnectionPointType.Float,
        createStrongRef(128.0)
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
        super(smartFilter, name, false);
    }

    /**
     * Get the class instance that binds all the required data to the shader (effect) when rendering.
     * @returns The class instance that binds the data to the effect
     */
    public getShaderBinding(): DisableableShaderBinding {
        const input = this._confirmRuntimeDataSupplied(this.input);
        const time = this.time.runtimeData;
        const fireworks = this.fireworks.runtimeData;
        const fireworkSparks = this.fireworkSparks.runtimeData;

        return new FireworksShaderBinding(this, input, time, fireworks, fireworkSparks);
    }
}
