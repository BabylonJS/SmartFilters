import type { Nullable } from "@babylonjs/core/types.js";
import type { BaseBlock } from "../../blocks/baseBlock.js";
import type { SmartFilter } from "../../smartFilter.js";
import type { ThinEngine } from "@babylonjs/core/Engines/thinEngine";
import type { IEditorData } from "@babylonjs/shared-ui-components/nodeGraphSystem/interfaces/nodeLocationInfo.js";

/**
 * ----------------------------------------------------------------------------
 * Serialized Data Types
 * ----------------------------------------------------------------------------
 */

/**
 * V1 Serialized Smart Filter
 */
export type SerializedSmartFilterV1 = {
    /** The version of the serialized data */
    version: 1;

    /** The SmartFilter name */
    name: string;

    /** The SmartFilter comments */
    comments: Nullable<string>;

    /** The editor data for the SmartFilter */
    editorData: Nullable<IEditorData>;

    /** The serialized blocks */
    blocks: ISerializedBlockV1[];

    /** The serialized connections */
    connections: ISerializedConnectionV1[];
};

/**
 * V1 Serialized Block
 */
export interface ISerializedBlockV1 {
    /** The name of the block */
    name: string;

    /** The unique ID of the block - correlates with the ID in the editorData for block position, etc. */
    uniqueId: number;

    /** The class name of the block */
    className: string;

    /** The comments for the block */
    comments: Nullable<string>;

    /** Block specific serialized data */
    data: any;
}

/**
 * V1 Serialized Connection
 */
export interface ISerializedConnectionV1 {
    /** The uniqueId of the block that the connection is to */
    outputBlock: number;

    /** The name of the connectionPoint on the outputBlock */
    outputConnectionPoint: string;

    /** The uniqueId of the block that the connection is from */
    inputBlock: number;

    /** The name of the connectionPoint on the inputBlock */
    inputConnectionPoint: string;
}

/**
 * ----------------------------------------------------------------------------
 * Serializer Types
 * ----------------------------------------------------------------------------
 */

/**
 * A function that serializes a block to a V1 serialized block object
 */
export type SerializeBlockV1 = (block: BaseBlock) => ISerializedBlockV1;

/**
 * A V1 block serializer
 */
export interface IBlockSerializerV1 {
    /** The className of the block that this serializer can serialize */
    className: string;

    /** The function that serializes the block */
    serialize: SerializeBlockV1;
}

/**
 * ----------------------------------------------------------------------------
 * Deserializer Types
 * ----------------------------------------------------------------------------
 */

/**
 * A function that deserializes a block from a V1 serialized block object
 */
export type DeserializeBlockV1 = (
    smartFilter: SmartFilter,
    serializedBlock: ISerializedBlockV1,
    engine: ThinEngine
) => Promise<BaseBlock>;
