import type { ThinEngine } from "@babylonjs/core/Engines/thinEngine";
import type { Nullable } from "@babylonjs/core/types";
import type { BaseBlock, SmartFilter, SmartFilterDeserializer } from "@babylonjs/smart-filters";

export interface IBlockEditorRegistration {
    name: string;
    factory?: (
        smartFilter: SmartFilter,
        engine: ThinEngine,
        smartFilterDeserializer: SmartFilterDeserializer
    ) => Promise<BaseBlock>;
    category: Nullable<string>;
    tooltip: string;
}
