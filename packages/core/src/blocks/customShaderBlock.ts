import type { ConnectionPointType } from "../connection/connectionPointType";
import type { ShaderBinding } from "../runtime/shaderRuntime";
import { createStrongRef } from "../runtime/strongRef.js";
import type { SerializedBlockDefinition } from "../serialization/serializedBlockDefinition";
import type {
    AnySerializedInputConnectionPointV1,
    SerializedInputConnectionPointV1,
} from "../serialization/v1/blockSerialization.types";
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
        // When a new version of SerializedBlockDefinition is created, this function should be updated to handle the new properties.

        return new CustomShaderBlock(
            smartFilter,
            name,
            blockDefinition.disableOptimization,
            blockDefinition.blockType,
            blockDefinition.inputConnectionPoints
        );
    }

    /**
     * The class name of the block.
     */
    public static override ClassName = "CustomShaderBlock";

    /**
     * Instantiates a new deserialized shader block.
     * @param smartFilter - The smart filter this block belongs to
     * @param name - Defines the name of the block
     * @param disableOptimization - If true, this optimizer will not attempt to optimize this block
     * @param blockType - The type of the block
     * @param inputConnectionPoints - The input connection points of the block
     */
    private constructor(
        smartFilter: SmartFilter,
        name: string,
        disableOptimization: boolean,
        blockType: string,
        inputConnectionPoints: AnySerializedInputConnectionPointV1[]
    ) {
        super(smartFilter, name, disableOptimization, blockType);

        for (const input of inputConnectionPoints) {
            this._registerSerializedInputConnectionPointV1(input);
        }

        // this._shaderProgram = serializedBlock.shaderProgram;

        // Register input connection points

        // TODO: is there any need to create class properties for each input connection point?
    }

    /**
     * Checks a specific input connection point type to see if it has a default value, and registers the input
     * connection point accordingly.
     * @param connectionPoint - The input connection point to register
     */
    private _registerSerializedInputConnectionPointV1<U extends ConnectionPointType>(
        connectionPoint: SerializedInputConnectionPointV1<U>
    ): void {
        if (connectionPoint.defaultValue !== undefined) {
            this._registerOptionalInput(
                connectionPoint.name,
                connectionPoint.type,
                createStrongRef(connectionPoint.defaultValue)
            );
        } else {
            this._registerInput(connectionPoint.name, connectionPoint.type);
        }
    }

    /**
     * TODO: do we need to keep this?
     */
    public override getShaderBinding(): ShaderBinding {
        throw new Error("Not implemented");
        // return new SerializedShaderBlockShaderBinding(this, this._shaderProgram);
    }
}
