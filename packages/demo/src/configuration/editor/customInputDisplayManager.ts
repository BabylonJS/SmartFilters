import type { INodeData } from "@babylonjs/shared-ui-components/nodeGraphSystem/interfaces/nodeData";
import { ConnectionPointType, type AnyInputBlock } from "@babylonjs/smart-filters";
import { InputDisplayManager } from "@babylonjs/smart-filters-editor-control";
import { WebCamInputBlockName, type WebCamInputBlock } from "../blocks/hardcoded/inputs/webCamInputBlock";

/**
 * Optional override of the InputDisplayManager to provide custom display for particular blocks if desired.
 */
export class CustomInputDisplayManager extends InputDisplayManager {
    public override updatePreviewContent(nodeData: INodeData, contentArea: HTMLDivElement): void {
        super.updatePreviewContent(nodeData, contentArea);

        let value = "";
        const inputBlock = nodeData.data as AnyInputBlock;

        if (inputBlock.type === ConnectionPointType.Texture && inputBlock.name === WebCamInputBlockName) {
            const webCamInputBlock = inputBlock as WebCamInputBlock;
            value = webCamInputBlock.webcamSource?.label ?? "Default";
            contentArea.innerHTML = value;
        } else {
            return super.updatePreviewContent(nodeData, contentArea);
        }
    }
}
