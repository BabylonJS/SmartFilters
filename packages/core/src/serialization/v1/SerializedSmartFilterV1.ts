import type { ISerializedBlockV1 } from "./ISerializedBlockV1";
import type { ISerializedConnectionV1 } from "./ISerializedConnectionV1";

export type SerializedSmartFilterV1 = {
    version: 1;
    name: string;
    blocks: ISerializedBlockV1[];
    connections: ISerializedConnectionV1[];
};
