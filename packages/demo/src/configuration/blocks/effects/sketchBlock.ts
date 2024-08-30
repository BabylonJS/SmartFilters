import type { Effect } from "@babylonjs/core/Materials/effect";
import { type SmartFilter, type IDisableableBlock, type RuntimeData } from "@babylonjs/smart-filters";
import { ShaderBlock, ConnectionPointType, ShaderBinding } from "@babylonjs/smart-filters";
import { BlockNames } from "../blockNames";
import { shaderProgram, uniforms } from "./sketchBlock.shader";

/**
 * The shader bindings for the Sketch block.
 */
export class SketchShaderBinding extends ShaderBinding {
    private readonly _inputTexture: RuntimeData<ConnectionPointType.Texture>;

    /**
     * Creates a new shader binding instance for the Sketch block.
     * @param parentBlock - The parent block
     * @param inputTexture - The input texture
     */
    constructor(parentBlock: IDisableableBlock, inputTexture: RuntimeData<ConnectionPointType.Texture>) {
        super(parentBlock);
        this._inputTexture = inputTexture;
    }

    /**
     * Binds all the required data to the shader when rendering.
     * @param effect - defines the effect to bind the data to
     * @param _width - defines the width of the output. Passed in by ShaderRuntime.
     * @param _height - defines the height of the output. Passed in by ShaderRuntime.
     */
    public override bind(effect: Effect, _width: number, _height: number): void {
        super.bind(effect);
        effect.setTexture(this.getRemappedName(uniforms.input), this._inputTexture.value);
        effect.setFloat2(this.getRemappedName(uniforms.resolution), _width, _height);
    }
}

/**
 * A block that adds a hand-drawn effect to the input texture.
 */
export class SketchBlock extends ShaderBlock {
    /**
     * The class name of the block.
     */
    public static override ClassName = BlockNames.sketch;

    /**
     * The input texture connection point
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
    public getShaderBinding(): ShaderBinding {
        const input = this._confirmRuntimeDataSupplied(this.input);

        return new SketchShaderBinding(this, input);
    }
}
