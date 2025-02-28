import type { Effect } from "@babylonjs/core/Materials/effect";

import type { SmartFilter, IDisableableBlock, RuntimeData, ShaderProgram } from "@babylonjs/smart-filters";
import { ConnectionPointType, DisableableShaderBlock, DisableableShaderBinding } from "@babylonjs/smart-filters";
import { BlockNames } from "../blockNames.js";
import { babylonDemoEffectsNamespace } from "../blockNamespaces.js";

const shaderProgram: ShaderProgram = {
    fragment: {
        uniform: `
            uniform sampler2D _input_;
            uniform float _amount_;
            `,

        mainFunctionName: "_exposure_",

        mainInputTexture: "_input_",

        functions: [
            {
                name: "_exposure_",
                code: `
                vec4 _exposure_(vec2 vUV) {
                    vec4 color = texture2D(_input_, vUV);
                    return vec4(color.rgb * _amount_, color.a);
                }
            `,
            },
        ],
    },
};

/**
 * The shader bindings for the ExposureBlock.
 */
export class ExposureBinding extends DisableableShaderBinding {
    private readonly _inputTexture: RuntimeData<ConnectionPointType.Texture>;
    private readonly _amount: RuntimeData<ConnectionPointType.Float>;

    /**
     * Creates a new shader binding instance for the exposure block.
     * @param parentBlock - The parent block
     * @param inputTexture - The input texture
     * @param amount - The exposure adjustment amount (1.0 means no adjustment)
     */
    constructor(
        parentBlock: IDisableableBlock,
        inputTexture: RuntimeData<ConnectionPointType.Texture>,
        amount: RuntimeData<ConnectionPointType.Float>
    ) {
        super(parentBlock);
        this._inputTexture = inputTexture;
        this._amount = amount;
    }

    /**
     * Binds all the required data to the shader when rendering.
     * @param effect - defines the effect to bind the data to
     */
    public override bind(effect: Effect): void {
        super.bind(effect);
        effect.setTexture(this.getRemappedName("input"), this._inputTexture.value);
        effect.setFloat(this.getRemappedName("amount"), this._amount.value);
    }
}

/**
 * Applies an exposure adjustment to the input texture.
 */
export class ExposureBlock extends DisableableShaderBlock {
    /**
     * The class name of the block.
     */
    public static override ClassName = BlockNames.exposure;

    /**
     * The namespace of the block.
     */
    public static override Namespace = babylonDemoEffectsNamespace;

    /**
     * The input texture connection point.
     */
    public readonly input = this._registerInput("input", ConnectionPointType.Texture);

    /**
     * The amount of exposure adjustment to apply (1.0 is no adjustment).
     */
    public readonly amount = this._registerInput("amount", ConnectionPointType.Float);

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
        const amount = this._confirmRuntimeDataSupplied(this.amount);

        return new ExposureBinding(this, input, amount);
    }
}
