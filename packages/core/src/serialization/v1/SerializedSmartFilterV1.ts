import type { IEditorData } from "@babylonjs/shared-ui-components/nodeGraphSystem/interfaces/nodeLocationInfo";
import type { ISerializedBlockV1 } from "./ISerializedBlockV1";
import type { ISerializedConnectionV1 } from "./ISerializedConnectionV1";
import type { Nullable } from "@babylonjs/core/types";

export type SerializedSmartFilterV1 = {
    version: 1;
    name: string;
    comments: Nullable<string>;
    editorData: Nullable<IEditorData>;
    blocks: ISerializedBlockV1[];
    connections: ISerializedConnectionV1[];
};
