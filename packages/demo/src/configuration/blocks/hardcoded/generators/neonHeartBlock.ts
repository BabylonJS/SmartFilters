// For demo and non-commercial usage only
import type { Effect } from "@babylonjs/core/Materials/effect";
import {
    type SmartFilter,
    type IDisableableBlock,
    type RuntimeData,
    DisableableShaderBinding,
} from "@babylonjs/smart-filters";
import { ConnectionPointType, createStrongRef, DisableableShaderBlock } from "@babylonjs/smart-filters";
import { shaderProgram, uniforms } from "./neonHeartBlock.shader";
import { BlockNames } from "../blockNames";
import { Color3 } from "@babylonjs/core/Maths/math.color";

/**
 * The shader bindings for the Neon Heart block.
 */
export class NeonHeartShaderBinding extends DisableableShaderBinding {
    private readonly _inputTexture: RuntimeData<ConnectionPointType.Texture>;
    private readonly _time: RuntimeData<ConnectionPointType.Float>;
    private readonly _color1: RuntimeData<ConnectionPointType.Color3>;
    private readonly _color2: RuntimeData<ConnectionPointType.Color3>;

    /**
     * Creates a new shader binding instance for the Neon Heart block.
     * @param parentBlock - The parent block
     * @param inputTexture - The input texture
     * @param time - The time passed since the start of the effect
     * @param color1 - The first color of the heart
     * @param color2 - The second color of the heart
     */
    constructor(
        parentBlock: IDisableableBlock,
        inputTexture: RuntimeData<ConnectionPointType.Texture>,
        time: RuntimeData<ConnectionPointType.Float>,
        color1: RuntimeData<ConnectionPointType.Color3>,
        color2: RuntimeData<ConnectionPointType.Color3>
    ) {
        super(parentBlock);
        this._inputTexture = inputTexture;
        this._time = time;
        this._color1 = color1;
        this._color2 = color2;
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
        effect.setColor3(this.getRemappedName(uniforms.color1), this._color1.value);
        effect.setColor3(this.getRemappedName(uniforms.color2), this._color2.value);
    }
}

/**
 * A procedural block that draws an animated neon heart around the center of the input texture.
 */
export class NeonHeartBlock extends DisableableShaderBlock {
    /**
     * The class name of the block.
     */
    public static override ClassName = BlockNames.neonHeart;

    /**
     * The texture connection point.
     */
    public readonly input = this._registerInput("input", ConnectionPointType.Texture);

    /**
     * The time connection point.
     */
    public readonly time = this._registerOptionalInput("time", ConnectionPointType.Float, createStrongRef(0.3));

    /**
     * The color1 connection point, controlling the first color of the heart.
     */
    public readonly color1 = this._registerOptionalInput(
        "color1",
        ConnectionPointType.Color3,
        createStrongRef(new Color3(1.0, 0.05, 0.3))
    );

    /**
     * The color2 connection point, controlling the second color of the heart.
     */
    public readonly color2 = this._registerOptionalInput(
        "color2",
        ConnectionPointType.Color3,
        createStrongRef(new Color3(0.1, 0.4, 1.0))
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
        const time = this.time.runtimeData;
        const color1 = this.color1.runtimeData;
        const color2 = this.color2.runtimeData;

        return new NeonHeartShaderBinding(this, input, time, color1, color2);
    }
}
