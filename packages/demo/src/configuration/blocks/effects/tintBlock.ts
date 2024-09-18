import type { Effect } from "@babylonjs/core/Materials/effect";
import type { SmartFilter, IDisableableBlock, RuntimeData } from "@babylonjs/smart-filters";
import { ShaderBlock, ConnectionPointType, ShaderBinding, createStrongRef } from "@babylonjs/smart-filters";
import { BlockNames } from "../blockNames";
import { uniforms, shaderProgram } from "./tintBlock.shader";
import { Color3 } from "@babylonjs/core/Maths/math.color";

/**
 * The shader bindings for the Tint block.
 */
export class TintShaderBinding extends ShaderBinding {
    private readonly _inputTexture: RuntimeData<ConnectionPointType.Texture>;
    private readonly _tint: RuntimeData<ConnectionPointType.Color3>;
    private readonly _amount: RuntimeData<ConnectionPointType.Float>;

    /**
     * Creates a new shader binding instance for the Tint block.
     * @param parentBlock - The parent block
     * @param inputTexture - the input texture
     * @param tint - the tint to apply
     * @param amount - the amount of tint to apply
     */
    constructor(
        parentBlock: IDisableableBlock,
        inputTexture: RuntimeData<ConnectionPointType.Texture>,
        tint: RuntimeData<ConnectionPointType.Color3>,
        amount: RuntimeData<ConnectionPointType.Float>
    ) {
        super(parentBlock);
        this._inputTexture = inputTexture;
        this._tint = tint;
        this._amount = amount;
    }

    /**
     * Binds all the required data to the shader when rendering.
     * @param effect - defines the effect to bind the data to
     */
    public override bind(effect: Effect): void {
        super.bind(effect);
        effect.setTexture(this.getRemappedName(uniforms.input), this._inputTexture.value);
        effect.setColor3(this.getRemappedName(uniforms.tint), this._tint.value);
        effect.setFloat(this.getRemappedName(uniforms.amount), this._amount.value);
    }
}

/**
 * A simple block to apply a tint to a texture
 */
export class TintBlock extends ShaderBlock {
    /**
     * The class name of the block.
     */
    public static override ClassName = BlockNames.tint;

    /**
     * The input texture connection point.
     */
    public readonly input = this._registerInput("input", ConnectionPointType.Texture);

    /**
     * The tint color connection point.
     */
    public readonly tint = this._registerOptionalInput(
        "tint",
        ConnectionPointType.Color3,
        createStrongRef(new Color3(1, 0, 0))
    );

    /**
     * The strength of the tint, as a connection point.
     */
    public readonly amount = this._registerOptionalInput("amount", ConnectionPointType.Float, createStrongRef(0.25));

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
        const tint = this.tint.runtimeData;
        const amount = this.amount.runtimeData;

        return new TintShaderBinding(this, input, tint, amount);
    }
}
