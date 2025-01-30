import type { Effect } from "@babylonjs/core/Materials/effect";
import { ConnectionPointType } from "../connection/connectionPointType.js";
import { ShaderBinding } from "../runtime/shaderRuntime.js";
import { createStrongRef } from "../runtime/strongRef.js";
import type { SerializedBlockDefinition } from "../serialization/serializedBlockDefinition";
import type { SerializedInputConnectionPointV1 } from "../serialization/v1/blockSerialization.types";
import type { SmartFilter } from "../smartFilter";
import type { ShaderProgram } from "../utils/shaderCodeUtils";
import { ShaderBlock } from "./shaderBlock.js";
import type { RuntimeData } from "../connection/connectionPoint";

/**
 * The binding for a CustomShaderBlock
 */
class CustomShaderBlockBinding extends ShaderBinding {
    private readonly _bindSteps: ((effect: Effect) => void)[] = [];

    /**
     * Creates a new shader binding instance for the CustomShaderBlock block.
     * @param inputsWithRuntimeData - The input connection points of the block
     */
    public constructor(inputsWithRuntimeData: AnyInputWithRuntimeData[]) {
        super();

        for (const input of inputsWithRuntimeData) {
            switch (input.type) {
                case ConnectionPointType.Float:
                    this._bindSteps.push((effect) => {
                        effect.setFloat(this.getRemappedName(input.name), input.runtimeData.value);
                    });
                    break;
                case ConnectionPointType.Texture:
                    this._bindSteps.push((effect) => {
                        effect.setTexture(this.getRemappedName(input.name), input.runtimeData.value);
                    });
                    break;
                case ConnectionPointType.Color3:
                    this._bindSteps.push((effect) => {
                        effect.setColor3(this.getRemappedName(input.name), input.runtimeData.value);
                    });
                    break;
                case ConnectionPointType.Color4:
                    this._bindSteps.push((effect) => {
                        effect.setDirectColor4(this.getRemappedName(input.name), input.runtimeData.value);
                    });
                    break;
                case ConnectionPointType.Boolean:
                    this._bindSteps.push((effect) => {
                        effect.setBool(this.getRemappedName(input.name), input.runtimeData.value);
                    });
                    break;
                case ConnectionPointType.Vector2:
                    this._bindSteps.push((effect) => {
                        effect.setVector2(this.getRemappedName(input.name), input.runtimeData.value);
                    });
                    break;
            }
        }
    }

    /**
     * Binds all the required data to the shader when rendering.
     * @param effect - The effect to bind the data to
     */
    public override bind(effect: Effect): void {
        for (let i = 0; i < this._bindSteps.length; i++) {
            this._bindSteps[i]!(effect);
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
            blockDefinition.inputConnectionPoints,
            blockDefinition.shaderProgram
        );
    }

    /**
     * The class name of the block.
     */
    public static override ClassName = "CustomShaderBlock";

    private readonly _shaderProgram: ShaderProgram;
    private readonly _blockType: string;

    /**
     * The type of the block - used when serializing / deserializing the block, and in the editor.
     */
    public override get blockType(): string {
        return this._blockType;
    }

    /**
     * Instantiates a new custom shader block.
     * @param smartFilter - The smart filter this block belongs to
     * @param name - The name of the block
     * @param disableOptimization - If true, this optimizer will not attempt to optimize this block
     * @param blockType - The type of the block
     * @param inputConnectionPoints - The input connection points of the
     * @param shaderProgram - The shader program for the block
     */
    private constructor(
        smartFilter: SmartFilter,
        name: string,
        disableOptimization: boolean,
        blockType: string,
        inputConnectionPoints: SerializedInputConnectionPointV1[],
        shaderProgram: ShaderProgram
    ) {
        super(smartFilter, name, disableOptimization);
        this._blockType = blockType;

        for (const input of inputConnectionPoints) {
            this._registerSerializedInputConnectionPointV1(input);
        }

        this._shaderProgram = shaderProgram;
    }

    /**
     * Gets the shader program to use to render the block.
     * @returns The shader program to use to render the block
     */
    public override getShaderProgram() {
        return this._shaderProgram;
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
     * The name of the input connection point
     */
    name: string;

    /**
     * The type of the input connection point
     */
    type: U;

    /**
     * The runtime data for the input connection point
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
