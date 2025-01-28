/**
 * ----------------------------------------------------------------------------
 * Data Types Used For Block Serialization
 * ----------------------------------------------------------------------------
 */

import type { IColor3Like, IColor4Like, IVector2Like } from "@babylonjs/core/Maths/math.like";
import type { ConnectionPointType } from "../../connection/connectionPointType";
import type { ShaderProgram } from "../../utils/shaderCodeUtils";
import type { SerializedBlockDefinitionBase } from "../serializedBlockDefinition";

// TODO: rename - className is by convention the real class name - maybe blockType, blockDefinition, or blockClass?

/**
 * The unique name of the class of block.
 * The application doing the deserialization will use this to instantiate the correct block type.
 * Class names are expected to be unique and their behavior should be semantically equivalent across versions
 * (their results must be similar enough that the differences are not perceivable).
 */
export type BlockClassNameV1 = string;

/**
 * The V1 format of a serialized block definition.
 */
export type SerializedBlockDefinitionV1 = SerializedBlockDefinitionBase & {
    /**
     * The version of the serialized block format, not the version of the block itself.
     */
    version: 1;

    /**
     * The class name of the block used to refer to it in serialized SmartFilters and in the editor UI.
     */
    // TODO: rename - className is by convention the real class name
    className: BlockClassNameV1;

    /**
     * The shader program for the block.
     */
    shaderProgram: ShaderProgram;

    /**
     * The input connection points of the block.
     */
    // TODO: see if this can be exactly the same as the input list the base block tracks
    inputConnectionPoints: SerializedInputConnectionPointV1[];

    /**
     * If true, this optimizer will not attempt to optimize this block.
     */
    disableOptimization: boolean;
};

/**
 * A V1 serialized input connection point on a serialized block.
 */
type SerializedInputConnectionPointV1Base = {
    /**
     * The name of the connection point.
     */
    name: string;

    /**
     * The type of the connection point.
     */
    type:
        | ConnectionPointType.Float
        | ConnectionPointType.Texture
        | ConnectionPointType.Color3
        | ConnectionPointType.Color4
        | ConnectionPointType.Boolean
        | ConnectionPointType.Vector2;
};

/**
 * A V1 serialized input connection point on a serialized block.
 */
export type SerializedInputConnectionPointV1 =
    | FloatSerializedInputConnectionPointV1
    | TextureSerializedInputConnectionPointV1
    | Color3SerializedInputConnectionPointV1
    | Color4SerializedInputConnectionPointV1
    | BooleanSerializedInputConnectionPointV1
    | Vector2SerializedInputConnectionPointV1;

/**
 * The V1 serialized input connection point of type float.
 */
type FloatSerializedInputConnectionPointV1 = SerializedInputConnectionPointV1Base & {
    /**
     * The type of the connection point.
     */
    type: ConnectionPointType.Float;

    /**
     * The optional default value of the connection point.
     */
    defaultValue?: number;
};

/**
 * The V1 serialized input connection point of type texture.
 */
type TextureSerializedInputConnectionPointV1 = SerializedInputConnectionPointV1Base & {
    /**
     * The type of the connection point.
     */
    type: ConnectionPointType.Texture;
};

/**
 * The V1 serialized input connection point of type Color3.
 */
type Color3SerializedInputConnectionPointV1 = SerializedInputConnectionPointV1Base & {
    /**
     * The type of the connection point.
     */
    type: ConnectionPointType.Color3;

    /**
     * The optional default value of the connection point.
     */
    defaultValue?: IColor3Like;
};

/**
 * The V1 serialized input connection point of type Color4.
 */
type Color4SerializedInputConnectionPointV1 = SerializedInputConnectionPointV1Base & {
    /**
     * The type of the connection point.
     */
    type: ConnectionPointType.Color4;

    /**
     * The optional default value of the connection point.
     */
    defaultValue?: IColor4Like;
};

/**
 * The V1 serialized input connection point of type Boolean.
 */
type BooleanSerializedInputConnectionPointV1 = SerializedInputConnectionPointV1Base & {
    /**
     * The type of the connection point.
     */
    type: ConnectionPointType.Boolean;

    /**
     * The optional default value of the connection point.
     */
    defaultValue?: boolean;
};

/**
 * The V1 serialized input connection point of type Vector2.
 */
type Vector2SerializedInputConnectionPointV1 = SerializedInputConnectionPointV1Base & {
    /**
     * The type of the connection point.
     */
    type: ConnectionPointType.Vector2;

    /**
     * The optional default value of the connection point.
     */
    defaultValue?: IVector2Like;
};
