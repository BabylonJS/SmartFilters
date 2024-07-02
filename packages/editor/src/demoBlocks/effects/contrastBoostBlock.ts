import type { Effect } from "@babylonjs/core/Materials/effect";
import type { ThinTexture } from "@babylonjs/core/Materials/Textures/thinTexture";

import type { SmartFilter, StrongRef, IDisableableBlock } from "@babylonjs/smart-filters";
import { ShaderBlock, ConnectionPointType, ShaderBinding, injectDisableUniform } from "@babylonjs/smart-filters";

const shaderProgram = injectDisableUniform({
    fragment: {
        uniform: `
            uniform sampler2D _input_;
            uniform float _amount_;
            `,

        mainFunctionName: "_contrastBoost_",

        mainInputTexture: "_input_",

        functions: [
            {
                name: "_contrastBoost_",
                code: `
                vec4 _contrastBoost_(vec2 vUV) {
                    vec3 color = texture2D(_input_, vUV).rgb;
                    vec3 resultHighContrast = clamp(color.rgb * color.rgb * (3.0 - 2.0 * _amount_), 0., 1.);

                    // Increase contrast: apply simple shoulder-toe high contrast curve
                    vec3 bg = mix(color.rgb, resultHighContrast, _amount_);

                    return vec4(bg, 1.0);
                }
            `,
            },
        ],
    },
});

/**
 * The shader bindings for the ContrastBoostBlock.
 */
export class ContrastBoostBinding extends ShaderBinding {
    private readonly _inputTexture: StrongRef<ThinTexture>;
    private readonly _amount: StrongRef<number>;

    /**
     * Creates a new shader binding instance for the contrast boost block.
     * @param parentBlock - The parent block
     * @param inputTexture - The input texture
     * @param amount - The contrast boost amount
     */
    constructor(parentBlock: IDisableableBlock, inputTexture: StrongRef<ThinTexture>, amount: StrongRef<number>) {
        super(parentBlock);
        this._inputTexture = inputTexture;
        this._amount = amount;
    }

    /**
     * Binds all the required data to the shader when rendering.
     * @param effect - defines the effect to bind the data to
     */
    public override bind(effect: Effect): void {
        super.bind(effect);
        effect.setTexture(this.getRemappedName("input"), this._inputTexture.value);
        effect.setFloat(this.getRemappedName("amount"), this._amount.value);
    }
}

/**
 * Applies a contrast boost effect to the input texture.
 */
export class ContrastBoostBlock extends ShaderBlock {
    /**
     * The class name of the block.
     */
    public static override ClassName = "ContrastBoostBlock";

    /**
     * The input texture connection point.
     */
    public readonly input = this._registerInput("input", ConnectionPointType.Texture);

    /**
     * The contrast boost amount connection point.
     */
    public readonly amount = this._registerInput("amount", ConnectionPointType.Float);

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
        const amount = this._confirmRuntimeDataSupplied(this.amount);

        return new ContrastBoostBinding(this, input, amount);
    }
}
