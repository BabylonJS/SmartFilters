/**
 * ----------------------------------------------------------------------------
 * Data Types Used For Block Serialization
 * ----------------------------------------------------------------------------
 */

import type { ConnectionPointType, ConnectionPointValue } from "../../connection/connectionPointType";
import type { ShaderProgram } from "../../utils/shaderCodeUtils";
import type { SerializedBlockDefinitionBase } from "../serializedBlockDefinition";

/**
 * The unique type for the block.
 * The application doing the deserialization will use this to instantiate the correct block type.
 * Block types are expected to be unique and their behavior should be semantically equivalent across versions
 * (their results must be similar enough that the differences are not perceivable).
 */
export type BlockTypeV1 = string;

/**
 * The V1 definition of a serialized block.
 */
export type SerializedBlockDefinitionV1 = SerializedBlockDefinitionBase & {
    /**
     * The format version of the serialized data (not the version of the block definition itself).
     */
    version: 1;

    /**
     * The type of the block used to refer to it in serialized SmartFilters and in the editor UI.
     */
    blockType: BlockTypeV1;

    /**
     * The shader program for the block.
     */
    shaderProgram: ShaderProgram;

    /**
     * The input connection points of the block.
     */
    // TODO: see if this can be exactly the same as the input list the base block tracks
    inputConnectionPoints: AnySerializedInputConnectionPointV1[];

    /**
     * If true, this optimizer will not attempt to optimize this block.
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
