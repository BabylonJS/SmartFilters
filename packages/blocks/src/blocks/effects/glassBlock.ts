import type { Effect } from "@babylonjs/core/Materials/effect";

import {
    type SmartFilter,
    type IDisableableBlock,
    type RuntimeData,
    DisableableShaderBinding,
    DisableStrategy,
    type ShaderProgram,
} from "@babylonjs/smart-filters";
import { ConnectionPointType, DisableableShaderBlock } from "@babylonjs/smart-filters";
import { BlockNames } from "../blockNames.js";

const shaderProgram: ShaderProgram = {
    fragment: {
        uniform: `
            uniform sampler2D _input_;
            uniform float _time_;
            uniform bool _disabled_;
            `,

        mainFunctionName: "_glass_",

        mainInputTexture: "_input_",

        functions: [
            {
                name: "_glass_",
                code: `
                vec4 _glass_(vec2 vUV)
                {
                    vec2 uv = vUV;
                    if (!_disabled_) {
                        vUV = vUV * 0.7 + 0.15;
                    }
                    vec4 color = texture2D(_input_, vUV);
                    if (_disabled_) {
                        return color;
                    }
                
                    color = vec4(color.rgb, _mask_(uv) * color.a);
                
                    return mix(_shadow_(uv), vec4(color.rgb, 1.), color.a);
                }
            `,
            },
            {
                name: "_timeFn_",
                code: `
                float _timeFn_()
                {
                    float x = _time_ / 1.8 - 0.2;

                    float a = .6;
                    float y = 0.;
                    y += 1.2 * smoothstep(0., a, x) / (1. / a);
                    y += 3. * pow(max(x, 0.8) - 0.8, 2.);
                    y += x / 10.;
                
                    return y;
                }
            `,
            },
            {
                name: "_mask_",
                code: `
                float _mask_(vec2 st)
                {
                    return clamp(-abs(350. * (st.x - 1.38 * _timeFn_() + .20 + .18 * st.y)) + 50., 0., 1.);
                }
            `,
            },
            {
                name: "_shadowMask_",
                code: `
                float _shadowMask_(vec2 st)
                {
                    return clamp(-abs(10. * (st.x - 1.38 * _timeFn_() + .14 + .18 * st.y)) + 1.9, 0., 1.);
                }
            `,
            },
            {
                name: "_shadow_",
                code: `
                vec4 _shadow_(vec2 st)
                {
                    return vec4(vec3(0.), smoothstep(0., 1., _shadowMask_(st) * 0.5));
                }
            `,
            },
        ],
    },
};

/**
 * The shader bindings for the Glass block.
 */
export class GlassShaderBinding extends DisableableShaderBinding {
    private readonly _inputTexture: RuntimeData<ConnectionPointType.Texture>;
    private readonly _time: RuntimeData<ConnectionPointType.Float>;

    /**
     * Creates a new shader binding instance for the Glass block.
     * @param parentBlock - The parent block
     * @param inputTexture - the input texture
     * @param time - the time
     */
    constructor(
        parentBlock: IDisableableBlock,
        inputTexture: RuntimeData<ConnectionPointType.Texture>,
        time: RuntimeData<ConnectionPointType.Float>
    ) {
        super(parentBlock);
        this._inputTexture = inputTexture;
        this._time = time;
    }

    /**
     * Binds all the required data to the shader when rendering.
     * @param effect - defines the effect to bind the data to
     */
    public override bind(effect: Effect): void {
        super.bind(effect);
        effect.setTexture(this.getRemappedName("input"), this._inputTexture.value);
        effect.setFloat(this.getRemappedName("time"), this._time.value);
    }
}

/**
 * A block performing a glass looking like effect.
 */
export class GlassBlock extends DisableableShaderBlock {
    /**
     * The class name of the block.
     */
    public static override ClassName = BlockNames.glass;

    /**
     * The input texture connection point.
     */
    public readonly input = this._registerInput("input", ConnectionPointType.Texture);

    /**
     * The time connection point.
     */
    public readonly time = this._registerInput("time", ConnectionPointType.Float);

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
        super(smartFilter, name, false, DisableStrategy.Manual);
    }

    /**
     * Get the class instance that binds all the required data to the shader (effect) when rendering.
     * @returns The class instance that binds the data to the effect
     */
    public getShaderBinding(): DisableableShaderBinding {
        const input = this._confirmRuntimeDataSupplied(this.input);
        const time = this._confirmRuntimeDataSupplied(this.time);

        return new GlassShaderBinding(this, input, time);
    }
}
