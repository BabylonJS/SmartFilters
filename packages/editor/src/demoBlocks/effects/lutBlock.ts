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
            uniform sampler2D _lutTexture_;
            uniform float _intensity_;
            uniform float _squareCount_;
            uniform float _flipY_;
            `,

        mainFunctionName: "_lut_",

        mainInputTexture: "_input_",

        functions: [
            {
                name: "_lut_",
                code: `
                vec4 _lut_(vec2 vUV) {
                    vec4 color = texture2D(_input_, vUV);

                    float tableWidth = _squareCount_ - 1.;
                    float squareSize = 1. / _squareCount_;
                    float squarePxSize = squareSize / _squareCount_;

                    float rCoord = color.r * (tableWidth * squarePxSize) + squarePxSize * .5; 

                    float gCoord = (color.g * tableWidth + .5) / _squareCount_;

                    float bCoord1 = floor(color.b * tableWidth);
                    float bCoord2 = min(bCoord1 + 1., tableWidth);
                    
                    vec4 slice1Color = texture2D(_lutTexture_, vec2(
                        rCoord + bCoord1 * squareSize,
                        gCoord
                    ));

                    vec4 slice2Color = texture2D(_lutTexture_, vec2(
                        rCoord + bCoord2 * squareSize,
                        gCoord
                    ));

                    float bOffset = mod(color.b * tableWidth, 1.);
                
                    vec4 result = mix(slice1Color, slice2Color, bOffset);

                    return vec4(mix(color.rgb, result.rgb, _intensity_), 1.);
                }
            `,
            },
        ],
    },
});

/**
 * The shader bindings for the LUT block.
 */
export class LUTBinding extends ShaderBinding {
    private readonly _inputTexture: StrongRef<ThinTexture>;
    private readonly _intensity: StrongRef<number>;
    private readonly _lutTexture: StrongRef<ThinTexture>;
    private readonly _squareCount: number;

    /**
     * Creates a new shader binding instance for the Contrast block.
     * @param parentBlock - The parent block
     * @param inputTexture - The input texture
     * @param lutTexture - The LUT texture
     * @param intensity - The intensity of the effect
     * @param squareCount - The number of slices in the LUT texture (as well as the number of rows & columns in each slice)
     */
    constructor(
        parentBlock: IDisableableBlock,
        inputTexture: StrongRef<ThinTexture>,
        lutTexture: StrongRef<ThinTexture>,
        intensity: StrongRef<number>,
        squareCount: number
    ) {
        super(parentBlock);
        this._inputTexture = inputTexture;
        this._intensity = intensity;
        this._lutTexture = lutTexture;
        this._squareCount = squareCount;
    }

    /**
     * Binds all the required data to the shader when rendering.
     * @param effect - defines the effect to bind the data to
     */
    public override bind(effect: Effect): void {
        super.bind(effect);
        effect.setTexture(this.getRemappedName("input"), this._inputTexture.value);
        effect.setTexture(this.getRemappedName("lutTexture"), this._lutTexture.value);
        effect.setFloat(this.getRemappedName("intensity"), this._intensity.value);
        effect.setFloat(this.getRemappedName("squareCount"), this._squareCount);
    }
}

/**
 * Applies a LUT effect to the input texture.
 */
export class LUTBlock extends ShaderBlock {
    private readonly _squareCount: number;

    /**
     * The class name of the block.
     */
    public static override ClassName = "LUTBlock";

    /**
     * The input texture connection point.
     */
    public readonly input = this._registerInput("input", ConnectionPointType.Texture);

    /**
     * The LUT texture connection point.
     */
    public readonly lut = this._registerInput("lut", ConnectionPointType.Texture);

    /**
     * The intensity connection point.
     */
    public readonly intensity = this._registerOptionalInput(
        "intensity",
        ConnectionPointType.Float,
        createStrongRef(1.0)
    );

    /**
     * The shader program (vertex and fragment code) to use to render the block
     */
    public static override ShaderCode = shaderProgram;

    /**
     * Instantiates a new Block.
     * @param smartFilter - The smart filter this block belongs to
     * @param name - The friendly name of the block
     * @param squareCount - The number of slices in the LUT texture (as well as the number of rows & columns in each slice)
     */
    constructor(smartFilter: SmartFilter, name: string, squareCount: number) {
        super(smartFilter, name);
        this._squareCount = squareCount;
    }

    /**
     * Get the class instance that binds all the required data to the shader (effect) when rendering.
     * @returns The class instance that binds the data to the effect
     */
    public getShaderBinding(): ShaderBinding {
        const input = this._confirmRuntimeDataSupplied(this.input);
        const lutTexture = this._confirmRuntimeDataSupplied(this.lut);
        const intensity = this.intensity.runtimeData;

        return new LUTBinding(this, input, lutTexture, intensity, this._squareCount);
    }
}
