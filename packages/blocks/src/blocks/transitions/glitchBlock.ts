import type { Effect } from "@babylonjs/core/Materials/effect";

import type { SmartFilter, IDisableableBlock, RuntimeData, ShaderProgram } from "@babylonjs/smart-filters";
import { ConnectionPointType, DisableableShaderBinding, DisableableShaderBlock } from "@babylonjs/smart-filters";
import { BlockNames } from "../blockNames.js";
import { babylonDemoTransitions } from "../blockNamespaces";

// Based on https://github.com/akella/webGLImageTransitions/blob/master/js/demo5.js

const shaderProgram: ShaderProgram = {
    fragment: {
        uniform: `
            uniform sampler2D _textureA_;
            uniform sampler2D _textureB_;
            uniform float _mix_;
            `,

        const: `
            const float _INTENSITY_ = 0.3;
            `,

        mainFunctionName: "_glitch_",

        mainInputTexture: "_textureB_",

        functions: [
            {
                name: "_glitch_",
                code: `
                vec4 _glitch_(vec2 vUV)
                {
                    vec4 baseA = texture2D(_textureA_, vUV);
                    vec4 baseB = texture2D(_textureB_, vUV);
                
                    float displaceA = (baseA.r + baseA.g + baseA.b) * 0.33;
                    float displaceB = (baseB.r + baseB.g + baseB.b) * 0.33;
                
                    vec2 offsetCoordA = vec2(vUV.x, vUV.y + _mix_ * displaceB * _INTENSITY_);
                    vec4 colorA = texture2D(_textureA_, offsetCoordA);
                
                    vec2 offsetCoordB = vec2(vUV.x, vUV.y + (1. - _mix_) * displaceA * _INTENSITY_);
                    vec4 colorB = texture2D(_textureB_, offsetCoordB);
                
                    return mix(colorA, colorB, _mix_);
                }
            `,
            },
        ],
    },
};

/**
 * The shader bindings for the Glitch block.
 */
export class GlitchShaderBinding extends DisableableShaderBinding {
    private readonly _textureA: RuntimeData<ConnectionPointType.Texture>;
    private readonly _textureB: RuntimeData<ConnectionPointType.Texture>;
    private readonly _mix: RuntimeData<ConnectionPointType.Float>;

    /**
     * Creates a new shader binding instance for the Glitch block.
     * @param parentBlock - The parent block
     * @param textureA - The first texture
     * @param textureB - The second texture
     * @param mix - The mix value between the two textures
     */
    constructor(
        parentBlock: IDisableableBlock,
        textureA: RuntimeData<ConnectionPointType.Texture>,
        textureB: RuntimeData<ConnectionPointType.Texture>,
        mix: RuntimeData<ConnectionPointType.Float>
    ) {
        super(parentBlock);
        this._textureA = textureA;
        this._textureB = textureB;
        this._mix = mix;
    }

    /**
     * Binds all the required data to the shader when rendering.
     * @param effect - defines the effect to bind the data to
     */
    public override bind(effect: Effect): void {
        super.bind(effect);
        effect.setTexture(this.getRemappedName("textureA"), this._textureA.value);
        effect.setTexture(this.getRemappedName("textureB"), this._textureB.value);
        effect.setFloat(this.getRemappedName("mix"), this._mix.value);
    }
}

/**
 * A block simulating a glitch effect to transition between two textures according to the mix value.
 */
export class GlitchBlock extends DisableableShaderBlock {
    /**
     * The class name of the block.
     */
    public static override ClassName = BlockNames.glitch;

    /**
     * The namespace of the block.
     */
    public static override Namespace = babylonDemoTransitions;

    /**
     * The first texture connection point.
     */
    public readonly textureA = this._registerInput("textureA", ConnectionPointType.Texture);

    /**
     * The second texture connection point.
     */
    public readonly textureB = this._registerInput("textureB", ConnectionPointType.Texture);

    /**
     * The connection point containing the transition value between 0 (textureA) and 1 (textureB).
     */
    public readonly mix = this._registerInput("mix", ConnectionPointType.Float);

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
        const textureA = this._confirmRuntimeDataSupplied(this.textureA);
        const textureB = this._confirmRuntimeDataSupplied(this.textureB);
        const mix = this._confirmRuntimeDataSupplied(this.mix);

        return new GlitchShaderBinding(this, textureA, textureB, mix);
    }
}
