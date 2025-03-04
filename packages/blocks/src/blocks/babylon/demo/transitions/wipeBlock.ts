import type { Effect } from "@babylonjs/core/Materials/effect";

import {
    type ShaderProgram,
    DisableableShaderBinding,
    type RuntimeData,
    ConnectionPointType,
    type IDisableableBlock,
    DisableableShaderBlock,
    type SmartFilter,
} from "@babylonjs/smart-filters";

import { babylonDemoTransitionsNamespace } from "../../../blockNamespaces.js";
import { wipeBlockType } from "../../../blockTypes.js";

const shaderProgram: ShaderProgram = {
    fragment: {
        const: `
            const float HALF_PI = 1.57079632679;
            const float LARGE = 10000.0;
            `,
        uniform: `
            uniform sampler2D _textureA_;
            uniform sampler2D _textureB_;
            uniform float _mix_;
            `,

        mainFunctionName: "_wipe_",

        mainInputTexture: "_textureB_",

        functions: [
            {
                name: "_wipe_",
                code: `
                vec4 _wipe_(vec2 vUV)
                {
                    vec4 colorA = texture2D(_textureA_, vUV);
                    vec4 colorB = texture2D(_textureB_, vUV);
                    return mix(colorB, colorA, step(_mix_, vUV.y));
                }
            `,
            },
        ],
    },
};

/**
 * The shader bindings for the Wipe block.
 */
export class WipeShaderBinding extends DisableableShaderBinding {
    private readonly _textureA: RuntimeData<ConnectionPointType.Texture>;
    private readonly _textureB: RuntimeData<ConnectionPointType.Texture>;
    private readonly _mix: RuntimeData<ConnectionPointType.Float>;

    /**
     * Creates a new shader binding instance for the Wipe block.
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
 * A block simulating a wipe effect to transition between two textures according to the mix value.
 */
export class WipeBlock extends DisableableShaderBlock {
    /**
     * The class name of the block.
     */
    public static override ClassName = wipeBlockType;

    /**
     * The namespace of the block.
     */
    public static override Namespace = babylonDemoTransitionsNamespace;

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

        return new WipeShaderBinding(this, textureA, textureB, mix);
    }
}
