import type { Nullable } from "@babylonjs/core/types.js";
import type { BaseBlock } from "../../blocks/baseBlock.js";
import type { SmartFilter } from "../../smartFilter.js";
import type { ThinEngine } from "@babylonjs/core/Engines/thinEngine";
import type { IEditorData } from "@babylonjs/shared-ui-components/nodeGraphSystem/interfaces/nodeLocationInfo.js";

/**
 * Serialized Data Types
 */

export type SerializedSmartFilterV1 = {
    version: 1;
    name: string;
    comments: Nullable<string>;
    editorData: Nullable<IEditorData>;
    blocks: ISerializedBlockV1[];
    connections: ISerializedConnectionV1[];
};

export interface ISerializedBlockV1 {
    name: string;
    uniqueId: number;
    className: string;
    comments: Nullable<string>;
    data: any;
}

export interface ISerializedConnectionV1 {
    outputBlock: string;
    outputConnectionPoint: string;
    inputBlock: string;
    inputConnectionPoint: string;
}

/**
 * Serializer Types
 */
export type SerializeBlockV1 = (block: BaseBlock) => ISerializedBlockV1;

export interface IBlockSerializerV1 {
    className: string;
    serialize: SerializeBlockV1;
}

/**
 * Deserializer Types
 */
export type DeserializeBlockV1 = (
    smartFilter: SmartFilter,
    serializedBlock: ISerializedBlockV1,
    engine: ThinEngine
) => Promise<BaseBlock>;
