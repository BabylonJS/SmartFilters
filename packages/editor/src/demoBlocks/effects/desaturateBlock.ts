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
            const float _aspect_ = 1.72;
            `,

        mainFunctionName: "_desaturate_",

        mainInputTexture: "_input_",

        functions: [
            {
                name: "_desaturate_",
                code: `
                vec4 _desaturate_(vec2 vUV)
                {
                    float saturationStrength = 1. - _intensity_;

                    vec3 color = texture2D(_input_, vUV).rgb;
                
                    float tempMin = min(min(color.x, color.y), color.z);
                    float tempMax = max(max(color.x, color.y), color.z);
                    float tempMerge = 0.5 * (tempMin + tempMax);
                
                    return vec4(mix(color, vec3(tempMerge, tempMerge, tempMerge), saturationStrength), 1.0);
                }
            `,
            },
        ],
    },
});

/**
 * The shader bindings for the Desaturate block.
 */
export class DesaturateShaderBinding extends ShaderBinding {
    private readonly _inputTexture: StrongRef<ThinTexture>;
    private readonly _intensity: StrongRef<number>;

    /**
     * Creates a new shader binding instance for the Desaturate block.
     * @param parentBlock - The parent block
     * @param inputTexture - The input texture
     * @param intensity - The intensity of the desaturation
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
 * A simple block to desaturate the input texture.
 */
export class DesaturateBlock extends ShaderBlock {
    /**
     * The class name of the block.
     */
    public static override ClassName = "DesaturateBlock";

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

        return new DesaturateShaderBinding(this, input, intensity);
    }
}
