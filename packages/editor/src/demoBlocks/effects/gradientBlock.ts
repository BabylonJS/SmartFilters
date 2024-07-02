import type { Effect } from "@babylonjs/core/Materials/effect";
import type { ThinTexture } from "@babylonjs/core/Materials/Textures/thinTexture";
import type { IColor4Like } from "@babylonjs/core/Maths/math.like";

import type { SmartFilter, StrongRef, IDisableableBlock } from "@babylonjs/smart-filters";
import { ShaderBlock, ConnectionPointType, ShaderBinding, injectDisableUniform } from "@babylonjs/smart-filters";

const shaderProgram = injectDisableUniform({
    fragment: {
        uniform: `
            uniform sampler2D _input_;
            uniform vec4 _colorA_;
            uniform vec4 _colorB_;
            `,

        mainFunctionName: "_gradient_",

        mainInputTexture: "_input_",

        functions: [
            {
                name: "_gradient_",
                code: `
                vec4 _gradient_(vec2 vUV) {
                    float invertYUV = 1. - vUV.y;
                    vec3 color = texture2D(_input_, vUV).rgb;

                    vec4 effectColor = mix(_colorA_, _colorB_, invertYUV);
                    vec3 bg = mix(color, effectColor.rgb, effectColor.a);

                    return vec4(bg, 1.0);
                }
            `,
            },
        ],
    },
});

/**
 * The shader bindings for the GradientBlock.
 */
export class GradientBinding extends ShaderBinding {
    private readonly _inputTexture: StrongRef<ThinTexture>;
    private readonly _colorA: StrongRef<IColor4Like>;
    private readonly _colorB: StrongRef<IColor4Like>;

    /**
     * Creates a new shader binding instance for the two-tone block.
     * @param parentBlock - The parent block
     * @param inputTexture - The input texture
     * @param colorA - The first color
     * @param colorB - The first color
     */
    constructor(
        parentBlock: IDisableableBlock,
        inputTexture: StrongRef<ThinTexture>,
        colorA: StrongRef<IColor4Like>,
        colorB: StrongRef<IColor4Like>
    ) {
        super(parentBlock);
        this._inputTexture = inputTexture;
        this._colorA = colorA;
        this._colorB = colorB;
    }

    /**
     * Binds all the required data to the shader when rendering.
     * @param effect - defines the effect to bind the data to
     */
    public override bind(effect: Effect): void {
        super.bind(effect);
        effect.setTexture(this.getRemappedName("input"), this._inputTexture.value);
        effect.setDirectColor4(this.getRemappedName("colorA"), this._colorA.value);
        effect.setDirectColor4(this.getRemappedName("colorB"), this._colorB.value);
    }
}

/**
 * Applies a gradient effect to the input texture.
 */
export class GradientBlock extends ShaderBlock {
    /**
     * The class name of the block.
     */
    public static override ClassName = "GradientBlock";

    /**
     * The input texture connection point.
     */
    public readonly input = this._registerInput("input", ConnectionPointType.Texture);

    /**
     * The first color.
     */
    public readonly colorA = this._registerInput("colorA", ConnectionPointType.Color4);

    /**
     * The second color.
     */
    public readonly colorB = this._registerInput("colorB", ConnectionPointType.Color4);

    /**
     * The shader program (vertex and fragment code) to use to render the block
     */
    public static override ShaderCode = shaderProgram;

    /**
     * Instantiates a new Block.
     * @param smartFilter - The video filter this block belongs to
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
        const colorA = this._confirmRuntimeDataSupplied(this.colorA);
        const colorB = this._confirmRuntimeDataSupplied(this.colorB);

        return new GradientBinding(this, input, colorA, colorB);
    }
}
