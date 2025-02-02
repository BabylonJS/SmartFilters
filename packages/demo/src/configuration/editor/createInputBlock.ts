import type { Nullable } from "@babylonjs/core/types";
import { type BaseBlock } from "@babylonjs/smart-filters";
import { type GlobalState } from "@babylonjs/smart-filters-editor-control";
import { WebCamInputBlock, WebCamInputBlockName } from "../blocks/hardcoded/inputs/webCamInputBlock";

/**
 * Intercepts the creation of an input block and can return specialized input blocks.
 * @param globalState - The global state of the editor.
 * @param type - The type of input block to create.
 * @returns Optionally creates an InputBock and returns it, null otherwise
 */
export function createInputBlock(globalState: GlobalState, type: string): Nullable<BaseBlock> {
    switch (type) {
        case WebCamInputBlockName:
            return new WebCamInputBlock(globalState.smartFilter, globalState.engine);
    }
    return null;
}
