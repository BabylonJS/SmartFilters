import type { ShaderBinding } from "../runtime/shaderRuntime";
import type { SerializedBlockDefinition } from "../serialization/serializedBlockDefinition";
import type { SmartFilter } from "../smartFilter";
// import type { ShaderProgram } from "../utils/shaderCodeUtils";
import { ShaderBlock } from "./shaderBlock.js";

/**
 * A block which loads a SerializedBlockDefinition for use in a SmartFilter.
 */
export class CustomShaderBlock extends ShaderBlock {
    // private readonly _shaderProgram: ShaderProgram;

    /**
     * The class name of the block.
     */
    public static override ClassName = "ShaderBlock";

    /**
     * Instantiates a new deserialized shader block.
     * @param smartFilter - The smart filter this block belongs to
     * @param name - Defines the name of the block
     * @param blockDefinition - The block definition to use
     */
    constructor(smartFilter: SmartFilter, name: string, blockDefinition: SerializedBlockDefinition) {
        super(smartFilter, name, blockDefinition.disableOptimization);
        // this._shaderProgram = serializedBlock.shaderProgram;

        // Register input connection points

        // TODO: is there any need to create class properties for each input connection point?
    }

    /**
     * TODO: do we need to keep this?
     */
    public override getShaderBinding(): ShaderBinding {
        throw new Error("Not implemented");
        // return new SerializedShaderBlockShaderBinding(this, this._shaderProgram);
    }
}
