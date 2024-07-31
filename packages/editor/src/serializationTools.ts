import type { SmartFilter } from "@babylonjs/smart-filters";
import type { GlobalState } from "./globalState";

export function setEditorData(smartFilter: SmartFilter, globalState: GlobalState) {
    smartFilter.editorData = {
        locations: [],
        x: 0,
        y: 0,
        zoom: 1,
    };

    for (const block of smartFilter.attachedBlocks) {
        const node = globalState.onGetNodeFromBlock(block);
        if (node) {
            smartFilter.editorData.locations.push({
                blockId: block.uniqueId,
                x: node.x,
                y: node.y,
            });
        }
    }
}
