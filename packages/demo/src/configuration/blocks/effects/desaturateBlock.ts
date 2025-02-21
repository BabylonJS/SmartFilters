import type { Effect } from "@babylonjs/core/Materials/effect";

import type { SmartFilter, IDisableableBlock, RuntimeData, ShaderProgram } from "@babylonjs/smart-filters";
import {
    ConnectionPointType,
    createStrongRef,
    DisableableShaderBlock,
    DisableableShaderBinding,
} from "@babylonjs/smart-filters";
import { BlockNames, BlockNamespaces } from "../blockNames";

const shaderProgram: ShaderProgram = {
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

                    vec4 color = texture2D(_input_, vUV);
                
                    float tempMin = min(min(color.x, color.y), color.z);
                    float tempMax = max(max(color.x, color.y), color.z);
                    float tempMerge = 0.5 * (tempMin + tempMax);
                
                    return vec4(mix(color.rgb, vec3(tempMerge, tempMerge, tempMerge), saturationStrength), color.a);
                }
            `,
            },
        ],
    },
};

/**
 * The shader bindings for the Desaturate block.
 */
export class DesaturateShaderBinding extends DisableableShaderBinding {
    private readonly _inputTexture: RuntimeData<ConnectionPointType.Texture>;
    private readonly _intensity: RuntimeData<ConnectionPointType.Float>;

    /**
     * Creates a new shader binding instance for the Desaturate block.
     * @param parentBlock - The parent block
     * @param inputTexture - The input texture
     * @param intensity - The intensity of the desaturation
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
 * A simple block to desaturate the input texture.
 */
export class DesaturateBlock extends DisableableShaderBlock {
    /**
     * The class name of the block.
     */
    public static override ClassName = BlockNames.desaturate;

    /**
     * The namespace of the block.
     */
    public static override Namespace = BlockNamespaces.babylonDemoEffects;

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
    public getShaderBinding(): DisableableShaderBinding {
        const input = this._confirmRuntimeDataSupplied(this.input);
        const intensity = this.intensity.runtimeData;

        return new DesaturateShaderBinding(this, input, intensity);
    }
}
