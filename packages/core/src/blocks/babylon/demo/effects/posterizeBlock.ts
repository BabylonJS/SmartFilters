import type { Effect } from "@babylonjs/core/Materials/effect";

import { type IDisableableBlock, DisableableShaderBlock } from "../../../../blockFoundation/disableableShaderBlock.js";
import type { RuntimeData } from "../../../../connection/connectionPoint.js";
import { ConnectionPointType } from "../../../../connection/connectionPointType.js";
import { DisableableShaderBinding } from "../../../../runtime/shaderRuntime.js";
import { createStrongRef } from "../../../../runtime/strongRef.js";
import type { SmartFilter } from "../../../../smartFilter.js";
import type { ShaderProgram } from "../../../../utils/shaderCodeUtils.js";

import { posterizeBlockType } from "../../../blockTypes.js";
import { babylonDemoEffects } from "../../../blockNamespaces.js";

const shaderProgram: ShaderProgram = {
    fragment: {
        uniform: `
            uniform sampler2D _input_;
            uniform float _intensity_;
            `,

        const: `
            const float _posterizePower_ = 6.0;
            const float _minLevel_ = 2.0;
            const float _maxLevel_ = 256.0;
            
            const float _aspect_ = 1.72;
            `,

        mainFunctionName: "_posterize_",

        mainInputTexture: "_input_",

        functions: [
            {
                name: "_posterize_",
                code: `
                vec4 _posterize_(vec2 vUV)
                {
                    vec4 color = texture2D(_input_, vUV);

                    float posterizeStrength = mix(_minLevel_, _maxLevel_, pow(1. - _intensity_, _posterizePower_));
                    vec3 posterize = vec3(posterizeStrength);
                    color.rgb = floor(color.rgb / (1.0 / posterize)) * (1.0 / posterize);

                    return color;
                }
            `,
            },
        ],
    },
};

/**
 * The shader bindings for the Posterize block.
 */
export class PosterizeShaderBinding extends DisableableShaderBinding {
    private readonly _inputTexture: RuntimeData<ConnectionPointType.Texture>;
    private readonly _intensity: RuntimeData<ConnectionPointType.Float>;

    /**
     * Creates a new shader binding instance for the Posterize block.
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
 * A simple block posterizing the input texture.
 */
export class PosterizeBlock extends DisableableShaderBlock {
    /**
     * The class name of the block.
     */
    public static override ClassName = posterizeBlockType;

    /**
     * The namespace of the block.
     */
    public static override Namespace = babylonDemoEffects;

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

        return new PosterizeShaderBinding(this, input, intensity);
    }
}
