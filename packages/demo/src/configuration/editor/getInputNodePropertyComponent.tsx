import { ConnectionPointType, type AnyInputBlock } from "@babylonjs/smart-filters";
import type { GlobalState } from "@babylonjs/smart-filters-editor";
import { WebCamInputPropertyComponent } from "./editorComponents/webCamInputPropertyComponent";

/**
 * If there is an InputBlock that needs special property setting UI, this function should return that UI, otherwise null.
 * @param inputBlock - The selected InputBlock
 * @param globalState - The global state
 */
export function getInputNodePropertyComponent(inputBlock: AnyInputBlock, globalState: GlobalState) {
    if (inputBlock.type === ConnectionPointType.Texture && inputBlock.name === "WebCam") {
        return <WebCamInputPropertyComponent inputBlock={inputBlock} globalState={globalState} />;
    }
    return null;
}
