import type { ThinEngine } from "@babylonjs/core/Engines/thinEngine";
import type { BaseBlock, ISerializedBlockV1, SmartFilter, SmartFilterDeserializer } from "@babylonjs/smart-filters";

export interface IBlockEditorRegistration {
    name: string;
    factory?: (
        smartFilter: SmartFilter,
        engine: ThinEngine,
        smartFilterDeserializer: SmartFilterDeserializer,
        serializedBlock?: ISerializedBlockV1
    ) => Promise<BaseBlock>;
    category: string;
    tooltip: string;
}
