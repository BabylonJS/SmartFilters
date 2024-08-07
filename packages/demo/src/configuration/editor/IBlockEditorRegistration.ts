import type { BaseBlock, SmartFilter } from "@babylonjs/smart-filters";

export interface IBlockEditorRegistration {
    name: string;
    factory?: (smartFilter: SmartFilter) => BaseBlock;
    category: string;
    tooltip: string;
}
