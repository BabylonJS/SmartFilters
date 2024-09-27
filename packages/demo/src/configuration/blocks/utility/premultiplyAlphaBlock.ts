import type { Effect } from "@babylonjs/core/Materials/effect";
import type { SmartFilter, IDisableableBlock, RuntimeData } from "@babylonjs/smart-filters";
import { ShaderBlock, ConnectionPointType, ShaderBinding, injectDisableUniform } from "@babylonjs/smart-filters";
import { BlockNames } from "../blockNames";

const shaderProgram = injectDisableUniform({
    fragment: {
        uniform: `
            uniform sampler2D _input_;
            `,

        mainFunctionName: "_premultiply_",

        mainInputTexture: "_input_",

        functions: [
            {
                name: "_premultiply_",
                code: `
                vec4 _premultiply_(vec2 vUV) {
                    vec4 color = texture2D(_input_, vUV);
                    return vec4(color.rgb * color.a, color.a);
                }
            `,
            },
        ],
    },
});

/**
 * The shader bindings for the PremultiplyAlpha block.
 */
export class PremultiplyAlphaShaderBinding extends ShaderBinding {
    private readonly _inputTexture: RuntimeData<ConnectionPointType.Texture>;

    /**
     * Creates a new shader binding instance for the PremultiplyAlpha block.
     * @param parentBlock - The parent block
     * @param inputTexture - The input texture
     */
    constructor(parentBlock: IDisableableBlock, inputTexture: RuntimeData<ConnectionPointType.Texture>) {
        super(parentBlock);
        this._inputTexture = inputTexture;
    }

    /**
     * Binds all the required data to the shader when rendering.
     * @param effect - defines the effect to bind the data to
     */
    public override bind(effect: Effect): void {
        super.bind(effect);
        effect.setTexture(this.getRemappedName("input"), this._inputTexture.value);
    }
}

/**
 * A utility block that premultiplies the input texture against its alpha.
 * This is useful for preserving transparency when the WebGL context expects colors with pre-multiplied alpha (true by default).
 */
export class PremultiplyAlphaBlock extends ShaderBlock {
    /**
     * The class name of the block.
     */
    public static override ClassName = BlockNames.premultiplyAlpha;

    /**
     * The input texture connection point.
     */
    public readonly input = this._registerInput("input", ConnectionPointType.Texture);

    /**
     * The shader program (vertex and fragment code) to use to render the block
     */
    public static override ShaderCode = shaderProgram;

    /**
     * Instantiates a new block.
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

        return new PremultiplyAlphaShaderBinding(this, input);
    }
}
