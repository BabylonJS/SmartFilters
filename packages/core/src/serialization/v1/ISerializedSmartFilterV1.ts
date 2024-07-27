import type { ISerializedSmartFilterBase } from "../ISerializedSmartFilterBase";
import type { ISerializedBlockV1 } from "./ISerializedBlockV1";
import type { ISerializedConnectionV1 } from "./ISerializedConnectionV1";

export interface ISerializedSmartFilterV1 extends ISerializedSmartFilterBase {
    version: 1;
    blocks: ISerializedBlockV1[];
    connections: ISerializedConnectionV1[];
}
