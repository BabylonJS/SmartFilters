import type { INodeContainer } from "@babylonjs/shared-ui-components/nodeGraphSystem/interfaces/nodeContainer";
import type { INodeData } from "@babylonjs/shared-ui-components/nodeGraphSystem/interfaces/nodeData";
import type { IPortData } from "@babylonjs/shared-ui-components/nodeGraphSystem/interfaces/portData";
import { ConnectionPointPortData } from "./connectionPointPortData.js";
// import triangle from "../assets/imgs/triangle.svg";
// import square from "../assets/imgs/square.svg";
import * as styles from "../assets/styles/graphSystem/blockNodeData.module.scss";
import type { BaseBlock } from "@babylonjs/smart-filters";

export class BlockNodeData implements INodeData {
    private _inputs: IPortData[] = [];
    private _outputs: IPortData[] = [];

    public get uniqueId(): number {
        return this.data.uniqueId;
    }

    public get name() {
        return this.data.name;
    }

    public getClassName() {
        return this.data.getClassName();
    }

    public get isInput() {
        return this.data.isInput;
    }

    public get inputs() {
        return this._inputs;
    }

    public get outputs() {
        return this._outputs;
    }

    public get comments() {
        return this.data.comments ?? "";
    }

    public set comments(value: string) {
        this.data.comments = value;
    }

    public getPortByName(name: string) {
        for (const input of this.inputs) {
            if (input.internalName === name) {
                return input;
            }
        }
        for (const output of this.outputs) {
            if (output.internalName === name) {
                return output;
            }
        }

        return null;
    }

    public dispose() {
        // this.data.dispose();
    }

    public prepareHeaderIcon(iconDiv: HTMLDivElement, _img: HTMLImageElement) {
        // if (this.data.getClassName() === "ElbowBlock") {
        //     iconDiv.classList.add(styles.hidden);
        //     return;
        // }

        // if (this.data.target === NodeMaterialBlockTargets.Fragment) {
        //     iconDiv.title = "In the fragment shader";
        //     img.src = square;

        //     return;
        // }

        // if (this.data.target === NodeMaterialBlockTargets.Vertex) {
        //     iconDiv.title = "In the vertex shader";
        //     img.src = triangle;

        //     return;
        // }

        iconDiv.classList.add(styles["hidden"]!);
    }

    public constructor(
        public data: BaseBlock,
        nodeContainer: INodeContainer
    ) {
        if (data.inputs) {
            this.data.inputs.forEach((input) => {
                this._inputs.push(new ConnectionPointPortData(input, nodeContainer));
            });
        }

        if (data.outputs) {
            this.data.outputs.forEach((output) => {
                this._outputs.push(new ConnectionPointPortData(output, nodeContainer));
            });
        }
    }
}
