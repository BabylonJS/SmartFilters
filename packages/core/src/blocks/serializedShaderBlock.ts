import type { ShaderBinding } from "../runtime/shaderRuntime";
import type { SmartFilter } from "../smartFilter";
import { ShaderBlock } from "./shaderBlock.js";

/**
 */
export class SerializedShaderBlock extends ShaderBlock {
    /**
     * The class name of the block.
     */
    public static override ClassName = "ShaderBlock";

    /**
     * Instantiates a new block.
     * @param smartFilter - Defines the smart filter the block belongs to
     * @param name - Defines the name of the block
     * @param serializedShader - The serialized shader to load
     * @param disableOptimization - Defines if the block should not be optimized (default: false)
     */
    constructor(
        smartFilter: SmartFilter,
        name: string,
        serializedShader: string,
        disableOptimization: boolean = false
    ) {
        super(smartFilter, name, disableOptimization);
        console.log(serializedShader);
    }

    /**
     * asdf
     */
    public override getShaderBinding(): ShaderBinding {
        throw new Error("Method not implemented.");
    }
}
