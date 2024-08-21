import type { Effect } from "@babylonjs/core/Materials/effect";

import type { SmartFilter, IDisableableBlock, RuntimeData } from "@babylonjs/smart-filters";
import {
    ShaderBlock,
    ConnectionPointType,
    ShaderBinding,
    injectDisableUniform,
    createStrongRef,
} from "@babylonjs/smart-filters";
import { BlockNames } from "../blockNames";

const shaderProgram = injectDisableUniform({
    fragment: {
        uniform: `
            uniform sampler2D _input_;
            uniform sampler2D _background_;
            uniform vec3 _reference_;
            uniform float _distance_;
            `,

        mainFunctionName: "_greenScreen_",

        mainInputTexture: "_input_",

        functions: [
            {
                name: "_greenScreen_",
                code: `
                vec4 _greenScreen_(vec2 vUV)
                {
                    vec3 color = texture2D(_input_, vUV).rgb;
                    vec3 background = texture2D(_background_, vUV).rgb;
                
                    if (length(color - _reference_) < _distance_) {
                        color = background;
                    }

                    return vec4(color, 1.0);
                }
            `,
            },
        ],
    },
});

/**
 * The shader bindings for the Green block.
 */
export class GreenShaderBinding extends ShaderBinding {
    private readonly _inputTexture: RuntimeData<ConnectionPointType.Texture>;
    private readonly _backgroundTexture: RuntimeData<ConnectionPointType.Texture>;
    private readonly _reference: RuntimeData<ConnectionPointType.Color3>;
    private readonly _distance: RuntimeData<ConnectionPointType.Float>;

    /**
     * Creates a new shader binding instance for the Green block.
     * @param parentBlock - The parent block
     * @param inputTexture - the input texture
     * @param backgroundTexture - the background texture
     * @param reference - the reference color
     * @param distance - the distance from the reference color
     */
    constructor(
        parentBlock: IDisableableBlock,
        inputTexture: RuntimeData<ConnectionPointType.Texture>,
        backgroundTexture: RuntimeData<ConnectionPointType.Texture>,
        reference: RuntimeData<ConnectionPointType.Color3>,
        distance: RuntimeData<ConnectionPointType.Float>
    ) {
        super(parentBlock);
        this._inputTexture = inputTexture;
        this._backgroundTexture = backgroundTexture;
        this._reference = reference;
        this._distance = distance;
    }

    /**
     * Binds all the required data to the shader when rendering.
     * @param effect - defines the effect to bind the data to
     */
    public override bind(effect: Effect): void {
        super.bind(effect);
        effect.setTexture(this.getRemappedName("input"), this._inputTexture.value);
        effect.setTexture(this.getRemappedName("background"), this._backgroundTexture.value);
        effect.setColor3(this.getRemappedName("reference"), this._reference.value);
        effect.setFloat(this.getRemappedName("distance"), this._distance.value);
    }
}

/**
 * A simple block to insert a background in place of a green screen.
 */
export class GreenScreenBlock extends ShaderBlock {
    /**
     * The class name of the block.
     */
    public static override ClassName = BlockNames.greenScreen;

    /**
     * The input texture connection point.
     */
    public readonly input = this._registerInput("input", ConnectionPointType.Texture);

    /**
     * The background texture connection point.
     */
    public readonly background = this._registerInput("background", ConnectionPointType.Texture);

    /**
     * The reference color of the green screen.
     */
    public readonly reference = this._registerInput("reference", ConnectionPointType.Color3);

    /**
     * The "distance" from the color the reference is allowed to have for replacement.
     */
    public readonly distance = this._registerOptionalInput("distance", ConnectionPointType.Float, createStrongRef(0.1));

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
        const background = this._confirmRuntimeDataSupplied(this.background);
        const reference = this._confirmRuntimeDataSupplied(this.reference);
        const distance = this.distance.runtimeData;

        return new GreenShaderBinding(this, input, background, reference, distance);
    }
}
