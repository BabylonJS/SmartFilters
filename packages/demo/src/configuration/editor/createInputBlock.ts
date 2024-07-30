import type { Nullable } from "@babylonjs/core/types";
import { ConnectionPointType, type BaseBlock } from "@babylonjs/smart-filters";
import { createDefaultValue, type GlobalState } from "@babylonjs/smart-filters-editor";
import { WebCamInputBlock } from "../blocks/inputs/webCamInputBlock";

export function createInputBlock(globalState: GlobalState, type: string): Nullable<BaseBlock> {
    switch (type) {
        case "WebCam":
            return new WebCamInputBlock(
                globalState.smartFilter,
                globalState.engine,
                createDefaultValue(ConnectionPointType.Texture, globalState.engine)
            );
    }
    return null;
}
