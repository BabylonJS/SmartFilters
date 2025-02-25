import type { Effect } from "@babylonjs/core/Materials/effect";
import { type SmartFilter, type RuntimeData } from "@babylonjs/smart-filters";
import { DisableableShaderBlock, ConnectionPointType, DisableableShaderBinding } from "@babylonjs/smart-filters";
import { BlockNames } from "../blockNames.js";
import { babylonDemoEffects } from "../blockNamespaces";
import { shaderProgram, uniforms } from "./blackAndWhiteBlock.shader.js";

/**
 * The shader bindings for the BlackAndWhite block.
 */
export class BlackAndWhiteShaderBinding extends DisableableShaderBinding {
    private readonly _inputTexture: RuntimeData<ConnectionPointType.Texture>;

    /**
     * Creates a new shader binding instance for the BlackAndWhite block.
     * @param parentBlock - The parent block
     * @param inputTexture - The input texture
     */
    constructor(parentBlock: DisableableShaderBlock, inputTexture: RuntimeData<ConnectionPointType.Texture>) {
        super(parentBlock);
        this._inputTexture = inputTexture;
    }

    /**
     * Binds all the required data to the shader when rendering.
     * @param effect - defines the effect to bind the data to
     */
    public override bind(effect: Effect): void {
        super.bind(effect);
        effect.setTexture(this.getRemappedName(uniforms.input), this._inputTexture.value);
    }
}

/**
 * A simple block converting the input texture to black and white.
 */
export class BlackAndWhiteBlock extends DisableableShaderBlock {
    /**
     * The class name of the block.
     */
    public static override ClassName = BlockNames.blackAndWhite;

    /**
     * The namespace of the block.
     */
    public static override Namespace = babylonDemoEffects;

    /**
     * The input texture connection point.
     */
    public readonly input = this._registerInput("input", ConnectionPointType.Texture);

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

        return new BlackAndWhiteShaderBinding(this, input);
    }
}
