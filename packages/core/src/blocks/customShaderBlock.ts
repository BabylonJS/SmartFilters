import type { ShaderBinding } from "../runtime/shaderRuntime";
import type { SerializedBlockDefinition } from "../serialization/serializedBlockDefinition";
import type { SmartFilter } from "../smartFilter";
// import type { ShaderProgram } from "../utils/shaderCodeUtils";
import { ShaderBlock } from "./shaderBlock.js";

/**
 * A block which loads a SerializedBlockDefinition for use in a SmartFilter.
 */
export class CustomShaderBlock extends ShaderBlock {
    /**
     * Deserializes a CustomShaderBlock from a serialized block definition.
     * @param smartFilter - The smart filter this block belongs to
     * @param name - Defines the name of the block
     * @param blockDefinition - The serialized block definition
     * @returns The deserialized CustomShaderBlock instance
     */
    public static Create(
        smartFilter: SmartFilter,
        name: string,
        blockDefinition: SerializedBlockDefinition
    ): CustomShaderBlock {
        return new CustomShaderBlock(smartFilter, name, blockDefinition.blockType, blockDefinition.disableOptimization);
    }

    /**
     * The class name of the block.
     */
    public static override ClassName = "CustomShaderBlock";

    /**
     * Instantiates a new deserialized shader block.
     * @param smartFilter - The smart filter this block belongs to
     * @param name - Defines the name of the block
     * @param blockType - The type of the block
     * @param disableOptimization - If true, this optimizer will not attempt to optimize this block
     */
    private constructor(smartFilter: SmartFilter, name: string, blockType: string, disableOptimization: boolean) {
        super(smartFilter, name, blockType, disableOptimization);
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
