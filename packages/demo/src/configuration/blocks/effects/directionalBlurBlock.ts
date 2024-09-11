import type { Effect } from "@babylonjs/core/Materials/effect";

import type { SmartFilter, IDisableableBlock, RuntimeData } from "@babylonjs/smart-filters";
import { ShaderBlock, ConnectionPointType, ShaderBinding, injectDisableUniform } from "@babylonjs/smart-filters";

const shaderProgram = injectDisableUniform({
    fragment: {
        uniform: `
                uniform vec2 _texelStep_;
                uniform sampler2D _input_;
            `,

        uniformSingle: `
                uniform float[7] _weights_;
            `,

        mainFunctionName: "_directionalBlur_",

        mainInputTexture: "_input_",

        functions: [
            {
                name: "_directionalBlur_",
                code: `
                vec4 _directionalBlur_(vec2 vUV) {
                    vec2 start = vUV - 3.0 * _texelStep_;
    
                    vec3 finalWeightedColor = vec3(0., 0., 0.);
                
                    float totalWeight = 0.;
                    for (int i = 0; i < 7; i++)
                    {
                        vec2 fetchUV = start + _texelStep_ * float(i);
                        fetchUV = clamp(fetchUV, 0., 1.);
                
                        finalWeightedColor += texture2D(_input_, fetchUV).rgb * _weights_[i];
                    }
                
                    return vec4(finalWeightedColor, 1.);
                }
            `,
            },
        ],
    },
});

const wideWeights = Float32Array.from([0.05, 0.1, 0.2, 0.3, 0.2, 0.1, 0.05]);

/**
 * The shader bindings for the DirectionalBlur block.
 */
export class DirectionalBlurShaderBinding extends ShaderBinding {
    private readonly _inputTexture: RuntimeData<ConnectionPointType.Texture>;
    private readonly _blurHorizontalWidth: number;
    private readonly _blurVerticalWidth: number;

    /**
     * Creates a new shader binding instance for the DirectionalBlur block.
     * @param parentBlock - The parent block
     * @param inputTexture - The input texture
     * @param blurHorizontalWidth - The horizontal blur width
     * @param blurVerticalWidth - The vertical blur width
     */
    constructor(
        parentBlock: IDisableableBlock,
        inputTexture: RuntimeData<ConnectionPointType.Texture>,
        blurHorizontalWidth: number,
        blurVerticalWidth: number
    ) {
        super(parentBlock);
        this._inputTexture = inputTexture;
        this._blurHorizontalWidth = blurHorizontalWidth;
        this._blurVerticalWidth = blurVerticalWidth;
    }

    /**
     * Binds all the required data to the shader when rendering.
     * @param effect - defines the effect to bind the data to
     * @param width - defines the width of the output
     * @param height - defines the height of the output
     */
    public override bind(effect: Effect, width: number, height: number): void {
        super.bind(effect);

        // Global pass Setup
        effect.setFloatArray(this.getRemappedName("weights"), wideWeights);

        // V blur
        effect.setTexture(this.getRemappedName("input"), this._inputTexture.value);

        // Texel size
        const texelWidth = this._blurHorizontalWidth / width;
        const texelHeight = this._blurVerticalWidth / height;
        effect.setFloat2(this.getRemappedName("texelStep"), texelWidth, texelHeight);
    }
}

/**
 * A block performing a directional "gaussian" blur.
 *
 * It is aggregated as part of the @see BlurBlock.
 */
export class DirectionalBlurBlock extends ShaderBlock {
    /**
     * The class name of the block.
     */
    public static override ClassName = "DirectionalBlurBlock";

    /**
     * The input texture connection point.
     */
    public readonly input = this._registerInput("input", ConnectionPointType.Texture);

    /**
     * Defines how smaller we should make the target compared to the screen size.
     */
    public blurTextureRatio = 0.5;

    /**
     * Defines the horizontal strength of the blur.
     */
    public blurHorizontalWidth = 0;

    /**
     * Defines the vertical strength of the blur.
     */
    public blurVerticalWidth = 1;

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
        super(smartFilter, name, true);
    }

    /**
     * Prepares the block for runtime.
     * This is called by the smart filter just before creating the smart filter runtime.
     */
    public override prepareForRuntime(): void {
        super.prepareForRuntime();

        this._textureRatio = this.blurTextureRatio;
    }

    /**
     * Get the class instance that binds all the required data to the shader (effect) when rendering.
     * @returns The class instance that binds the data to the effect
     */
    public getShaderBinding(): ShaderBinding {
        const input = this._confirmRuntimeDataSupplied(this.input);

        return new DirectionalBlurShaderBinding(this, input, this.blurHorizontalWidth, this.blurVerticalWidth);
    }
}
