import type { SmartFilter } from "@babylonjs/smart-filters";
import type { GlobalState } from "./globalState";
import type { GraphCanvasComponent } from "@babylonjs/shared-ui-components/nodeGraphSystem/graphCanvas";

export function setEditorData(smartFilter: SmartFilter, globalState: GlobalState, graphCanvas: GraphCanvasComponent) {
    smartFilter.editorData = {
        locations: [],
        x: graphCanvas.x,
        y: graphCanvas.y,
        zoom: graphCanvas.zoom,
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
