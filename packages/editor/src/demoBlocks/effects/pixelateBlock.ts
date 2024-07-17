import type { Effect } from "@babylonjs/core/Materials/effect";

import type { SmartFilter, IDisableableBlock, RuntimeData } from "@babylonjs/smart-filters";
import {
    ShaderBlock,
    ConnectionPointType,
    ShaderBinding,
    injectDisableUniform,
    createStrongRef,
} from "@babylonjs/smart-filters";

const shaderProgram = injectDisableUniform({
    fragment: {
        uniform: `
            uniform sampler2D _input_;
            uniform float _intensity_;
            `,

        const: `
            const float _videoPixelatePower_ = 6.0;
            const float _videoPixelateMin_ = 10.0;
            const float _videoPixelateMax_ = 1920.0;
            
            const float _aspect_ = 1.72;
            `,

        mainFunctionName: "_pixelate_",

        mainInputTexture: "_input_",

        functions: [
            {
                name: "_pixelate_",
                code: `
                vec4 _pixelate_(vec2 vUV)
                {
                    float pixelateStrength = mix(_videoPixelateMin_, _videoPixelateMax_, pow(1. - _intensity_, _videoPixelatePower_));
                
                    vec2 pixelate = vec2(pixelateStrength * _aspect_, pixelateStrength);
                
                    vec2 pixelateStep = floor(pixelate * vUV) / pixelate;
                
                    return vec4(texture2D(_input_, pixelateStep).rgb, 1.);
                }
            `,
            },
        ],
    },
});

/**
 * The shader bindings for the Pixelate block.
 */
export class PixelateShaderBinding extends ShaderBinding {
    private readonly _inputTexture: RuntimeData<ConnectionPointType.Texture>;
    private readonly _intensity: RuntimeData<ConnectionPointType.Float>;

    /**
     * Creates a new shader binding instance for the Kaleidoscope block.
     * @param parentBlock - The parent block
     * @param inputTexture - The input texture
     * @param intensity - The intensity of the effect
     */
    constructor(
        parentBlock: IDisableableBlock,
        inputTexture: RuntimeData<ConnectionPointType.Texture>,
        intensity: RuntimeData<ConnectionPointType.Float>
    ) {
        super(parentBlock);
        this._inputTexture = inputTexture;
        this._intensity = intensity;
    }

    /**
     * Binds all the required data to the shader when rendering.
     * @param effect - defines the effect to bind the data to
     */
    public override bind(effect: Effect): void {
        super.bind(effect);
        effect.setTexture(this.getRemappedName("input"), this._inputTexture.value);
        effect.setFloat(this.getRemappedName("intensity"), this._intensity.value);
    }
}

/**
 * A simple block pixelating the input texture.
 */
export class PixelateBlock extends ShaderBlock {
    /**
     * The class name of the block.
     */
    public static override ClassName = "PixelateBlock";

    /**
     * The input texture connection point.
     */
    public readonly input = this._registerInput("input", ConnectionPointType.Texture);

    /**
     * The intensity connection point.
     */
    public readonly intensity = this._registerOptionalInput(
        "intensity",
        ConnectionPointType.Float,
        createStrongRef(0.3)
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
        const intensity = this.intensity.runtimeData;

        return new PixelateShaderBinding(this, input, intensity);
    }
}
