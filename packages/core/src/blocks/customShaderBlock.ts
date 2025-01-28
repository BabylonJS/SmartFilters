import type { Effect } from "@babylonjs/core/Materials/effect";
import { ConnectionPointType } from "../connection/connectionPointType.js";
import { ShaderBinding } from "../runtime/shaderRuntime.js";
import { createStrongRef } from "../runtime/strongRef.js";
import type { SerializedBlockDefinition } from "../serialization/serializedBlockDefinition";
import type {
    AnySerializedInputConnectionPointV1,
    SerializedInputConnectionPointV1,
} from "../serialization/v1/blockSerialization.types";
import type { SmartFilter } from "../smartFilter";
// import type { ShaderProgram } from "../utils/shaderCodeUtils";
import { ShaderBlock } from "./shaderBlock.js";
import type { RuntimeData } from "../connection/connectionPoint";

/**
 * The binding for a CustomShaderBlock
 */
class CustomShaderBlockBinding extends ShaderBinding {
    private readonly _inputsWithRuntimeData: AnyInputWithRuntimeData[];

    /**
     * Creates a new shader binding instance for the CustomShaderBlock block.
     * @param inputsWithRuntimeData - The input connection points of the block
     */
    public constructor(inputsWithRuntimeData: AnyInputWithRuntimeData[]) {
        super();
        this._inputsWithRuntimeData = inputsWithRuntimeData;
    }

    /**
     * Binds all the required data to the shader when rendering.
     * @param effect - defines the effect to bind the data to
     */
    public override bind(effect: Effect): void {
        let remappedName: string;
        for (const input of this._inputsWithRuntimeData) {
            remappedName = this.getRemappedName(input.name);
            switch (input.type) {
                case ConnectionPointType.Float:
                    effect.setFloat(remappedName, input.runtimeData.value);
                    break;
                case ConnectionPointType.Texture:
                    effect.setTexture(remappedName, input.runtimeData.value);
                    break;
                case ConnectionPointType.Color3:
                    effect.setColor3(remappedName, input.runtimeData.value);
                    break;
                case ConnectionPointType.Color4:
                    effect.setDirectColor4(remappedName, input.runtimeData.value);
                    break;
                case ConnectionPointType.Boolean:
                    effect.setBool(remappedName, input.runtimeData.value);
                    break;
                case ConnectionPointType.Vector2:
                    effect.setVector2(remappedName, input.runtimeData.value);
                    break;
            }
        }
    }
}

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
     * Gets the shader binding for the custom shader block.
     * @returns The shader binding for the custom shader block
     */
    public override getShaderBinding(): ShaderBinding {
        const inputs = this.inputs;

        const inputsWithRuntimeData = inputs.map((input) => {
            return {
                name: input.name,
                type: input.type,
                runtimeData: this._confirmRuntimeDataSupplied(input),
            };
        });

        return new CustomShaderBlockBinding(inputsWithRuntimeData);
    }
}

/**
 * Represents an input with its runtime data, enforcing type safety.
 */
type InputWithRuntimeData<U extends ConnectionPointType> = {
    /**
     * asdf
     */
    name: string;

    /**
     * asdf
     */
    type: U;

    /**
     * asdf
     */
    runtimeData: RuntimeData<U>;
};

/**
 * All possible input types with runtime data.
 */
type AnyInputWithRuntimeData =
    | InputWithRuntimeData<ConnectionPointType.Boolean>
    | InputWithRuntimeData<ConnectionPointType.Color3>
    | InputWithRuntimeData<ConnectionPointType.Color4>
    | InputWithRuntimeData<ConnectionPointType.Float>
    | InputWithRuntimeData<ConnectionPointType.Texture>
    | InputWithRuntimeData<ConnectionPointType.Vector2>;
