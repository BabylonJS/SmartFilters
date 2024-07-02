import type { Effect } from "@babylonjs/core/Materials/effect";
import type { ThinTexture } from "@babylonjs/core/Materials/Textures/thinTexture";

import type { SmartFilter, StrongRef, IDisableableBlock } from "@babylonjs/smart-filters";
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
            const float contrastIntensity = 0.44;
            `,

        mainFunctionName: "_contrast_",

        mainInputTexture: "_input_",

        functions: [
            {
                name: "_contrast_",
                code: `
                vec4 _contrast_(vec2 vUV) {
                    vec3 color = texture2D(_input_, vUV).rgb;

                    float contrastLMin = mix(-2., 0., _intensity_ * 2.0);
                    float contrastLMax = mix(3., 1., _intensity_ * 2.0);
                
                    vec3 contrastMin = _remap_(color, contrastLMin, contrastLMax, 0., 1.);
                
                    float intensityMapped = _remap_(_intensity_, 0.5, 1., 0., 1.0);
                    float contrastHMin = mix(0., 0.45, intensityMapped);
                    float contrastHMax = mix(1., 0.5, intensityMapped);
                
                    vec3 contrastMax = _remap_(color, contrastHMin, contrastHMax, 0., 1.);
                
                    return vec4(mix(contrastMin, contrastMax, step(_intensity_, 0.5)), 1.0);
                }
            `,
            },
            {
                name: "_remap_",
                code: `
                float _remap_(float i, float smin, float smax, float dmin, float dmax) {
                    return dmin + (i - smin) * (dmax - dmin) / (smax - smin);
                }
                
                vec3 _remap_(vec3 i, float smin, float smax, float dmin, float dmax) {
                    return dmin + (i - smin) * (dmax - dmin) / (smax - smin);
                }
            `,
            },
        ],
    },
});

/**
 * The shader bindings for the Contrast block.
 */
export class ContrastShaderBinding extends ShaderBinding {
    private readonly _inputTexture: StrongRef<ThinTexture>;
    private readonly _intensity: StrongRef<number>;

    /**
     * Creates a new shader binding instance for the Contrast block.
     * @param parentBlock - The parent block
     * @param inputTexture - The input texture
     * @param intensity - The intensity of the effect
     */
    constructor(parentBlock: IDisableableBlock, inputTexture: StrongRef<ThinTexture>, intensity: StrongRef<number>) {
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
 * A simple block to change the contrast of a texture.
 */
export class ContrastBlock extends ShaderBlock {
    /**
     * The class name of the block.
     */
    public static override ClassName = "ContrastBlock";

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
        createStrongRef(0.5)
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

        return new ContrastShaderBinding(this, input, intensity);
    }
}
