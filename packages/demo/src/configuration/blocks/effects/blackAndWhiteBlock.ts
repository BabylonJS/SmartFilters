import type { Effect } from "@babylonjs/core/Materials/effect";
import type { SmartFilter, IDisableableBlock, RuntimeData } from "@babylonjs/smart-filters";
import { ShaderBlock, ConnectionPointType, ShaderBinding, injectDisableUniform } from "@babylonjs/smart-filters";
import { BlackAndWhiteBlockName } from "../blockNames";

const shaderProgram = injectDisableUniform({
    fragment: {
        uniform: `
            uniform sampler2D _input_;
            `,

        mainFunctionName: "_blackAndWhite_",

        mainInputTexture: "_input_",

        functions: [
            {
                name: "_blackAndWhite_",
                code: `
                vec4 _blackAndWhite_(vec2 vUV) {
                    vec3 color = texture2D(_input_, vUV).rgb;
                
                    float luminance = dot(color, vec3(0.3, 0.59, 0.11));
                    vec3 bg = vec3(luminance, luminance, luminance);
                
                    return vec4(bg, 1.0);
                }
            `,
            },
        ],
    },
});

/**
 * The shader bindings for the BlackAndWhite block.
 */
export class BlackAndWhiteShaderBinding extends ShaderBinding {
    private readonly _inputTexture: RuntimeData<ConnectionPointType.Texture>;

    /**
     * Creates a new shader binding instance for the BlackAndWhite block.
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
 * A simple block converting the input texture to black and white.
 */
export class BlackAndWhiteBlock extends ShaderBlock {
    /**
     * The class name of the block.
     */
    public static override ClassName = BlackAndWhiteBlockName;

    /**
     * The input texture connection point.
     */
    public readonly input = this._registerInput("input", ConnectionPointType.Texture);

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

        return new BlackAndWhiteShaderBinding(this, input);
    }
}
