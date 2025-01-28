/**
 * ----------------------------------------------------------------------------
 * Data Types Used For Block Serialization
 * ----------------------------------------------------------------------------
 */

import type { ConnectionPointType, ConnectionPointValue } from "../../connection/connectionPointType";
import type { ShaderProgram } from "../../utils/shaderCodeUtils";

/**
 * The V1 definition of a serialized block.
 */
export type SerializedBlockDefinitionV1 = {
    /**
     * The format version of the serialized data (not the version of the block definition itself).
     */
    version: 1;

    /**
     * The type used to refer to the block in serialized SmartFilters and in the editor UI.
     * The application doing the deserialization will use this to instantiate the correct block definition.
     * Block types are expected to be unique and their behavior should be semantically equivalent across implementations
     * (their results must be similar enough that the differences are not perceivable).
     */
    blockType: string;

    /**
     * The shader program for the block.
     */
    shaderProgram: ShaderProgram;

    /**
     * The input connection points of the block.
     */
    inputConnectionPoints: AnySerializedInputConnectionPointV1[];

    /**
     * If true, the optimizer will not attempt to optimize this block.
     */
    disableOptimization: boolean;
};

/**
 * A V1 serialized input connection point of any supported type on a serialized block.
 */
export type AnySerializedInputConnectionPointV1 =
    | SerializedInputConnectionPointV1<ConnectionPointType.Boolean>
    | SerializedInputConnectionPointV1<ConnectionPointType.Color3>
    | SerializedInputConnectionPointV1<ConnectionPointType.Color4>
    | SerializedInputConnectionPointV1<ConnectionPointType.Float>
    | SerializedInputConnectionPointV1<ConnectionPointType.Texture>
    | SerializedInputConnectionPointV1<ConnectionPointType.Vector2>;

/**
 * A V1 type-specific input connection point on a serialized block, used to ensure type and defaultValue are compatible.
 */
export type SerializedInputConnectionPointV1<U extends ConnectionPointType> = {
    /**
     * The name of the connection point.
     */
    name: string;

    /**
     * The type of the connection point.
     */
    type: U;

    /**
     * The optional default value of the connection point.
     */
    defaultValue?: ConnectionPointValue<U>;
};
