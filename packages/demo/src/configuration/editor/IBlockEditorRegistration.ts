import type { ThinEngine } from "@babylonjs/core/Engines/thinEngine";
import type { BaseBlock, SmartFilter, SmartFilterDeserializer } from "@babylonjs/smart-filters";

export interface IBlockEditorRegistration {
    name: string;
    factory?: (
        smartFilter: SmartFilter,
        engine: ThinEngine,
        smartFilterDeserializer: SmartFilterDeserializer
    ) => Promise<BaseBlock>;
    category: string;
    tooltip: string;
}
