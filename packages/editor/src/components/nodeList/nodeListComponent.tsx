/* eslint-disable @typescript-eslint/naming-convention */
import * as react from "react";
import type { Nullable } from "@babylonjs/core/types";
import type { Observer } from "@babylonjs/core/Misc/observable";
import { Tools } from "@babylonjs/core/Misc/tools.js";

import type { GlobalState } from "../../globalState";
import { LineContainerComponent } from "../../sharedComponents/lineContainerComponent.js";
import { DraggableLineComponent } from "../../sharedComponents/draggableLineComponent.js";
import { NodeLedger } from "@babylonjs/shared-ui-components/nodeGraphSystem/nodeLedger.js";
import "../../assets/styles/components/nodeList.scss";
import { DraggableLineWithButtonComponent } from "../../sharedComponents/draggableLineWithButtonComponent.js";
import deleteButton from "../../assets/imgs/delete.svg";
import addButton from "../../assets/imgs/add.svg";
import { LineWithFileButtonComponent } from "../../sharedComponents/lineWithFileButtonComponent.js";

interface INodeListComponentProps {
    globalState: GlobalState;
}

export class NodeListComponent extends react.Component<INodeListComponentProps, { filter: string }> {
    private _onResetRequiredObserver: Nullable<Observer<boolean>>;

    constructor(props: INodeListComponentProps) {
        super(props);

        this.state = { filter: "" };

        this._onResetRequiredObserver = this.props.globalState.onResetRequiredObservable.add(() => {
            this.forceUpdate();
        });
    }

    override componentWillUnmount() {
        this.props.globalState.onResetRequiredObservable.remove(this._onResetRequiredObserver);
    }

    filterContent(filter: string) {
        this.setState({ filter: filter });
    }

    loadCustomShaderBlock(file: File) {
        Tools.ReadFile(
            file,
            async (data) => {
                if (!this.props.globalState.addCustomShaderBlock) {
                    return;
                }

                const decoder = new TextDecoder("utf-8");
                this.props.globalState.addCustomShaderBlock(decoder.decode(data));

                this.forceUpdate();
            },
            undefined,
            true
        );
    }

    deleteCustomShaderBlock(blockType: string) {
        if (!this.props.globalState.deleteCustomShaderBlock) {
            return;
        }

        this.props.globalState.deleteCustomShaderBlock(blockType);

        this.forceUpdate();
    }

    override render() {
        // Create node menu
        const blockMenu = [];
        const allBlocks = this.props.globalState.blockEditorRegistration.allBlockNames;
        for (const key in allBlocks) {
            const blockList = (this.props.globalState.blockEditorRegistration.allBlockNames as any)[key]
                .filter(
                    (b: string) => !this.state.filter || b.toLowerCase().indexOf(this.state.filter.toLowerCase()) !== -1
                )
                .sort((a: string, b: string) => a.localeCompare(b))
                .map((block: string) => {
                    if (key === "Custom_Blocks") {
                        return (
                            <DraggableLineWithButtonComponent
                                key={block}
                                data={block}
                                tooltip={this.props.globalState.blockEditorRegistration.blockTooltips[block] || ""}
                                iconImage={deleteButton}
                                iconTitle="Delete"
                                onIconClick={() => {
                                    this.deleteCustomShaderBlock(block);
                                }}
                            />
                        );
                    }
                    return (
                        <DraggableLineComponent
                            key={block}
                            data={block}
                            tooltip={this.props.globalState.blockEditorRegistration.blockTooltips[block] || ""}
                        />
                    );
                });

            if (key === "Custom_Blocks") {
                const line = (
                    <LineWithFileButtonComponent
                        key="add..."
                        title={"Add Custom Block"}
                        closed={false}
                        label="Add..."
                        uploadName={"custom-block-upload"}
                        iconImage={addButton}
                        accept=".json, .glsl"
                        allowMultiple={true}
                        onIconClick={(file) => this.loadCustomShaderBlock(file)}
                    />
                );
                blockList.push(line);
            }

            if (blockList.length) {
                blockMenu.push(
                    <LineContainerComponent
                        key={key + " blocks"}
                        title={key.replace("__", ": ").replace("_", " ")}
                        closed={false}
                    >
                        {blockList}
                    </LineContainerComponent>
                );
            }
        }

        // Register blocks
        const ledger = NodeLedger.RegisteredNodeNames;
        for (const key in allBlocks) {
            const blocks = allBlocks[key] as string[];
            if (blocks.length) {
                for (const block of blocks) {
                    if (!ledger.includes(block)) {
                        ledger.push(block);
                    }
                }
            }
        }
        NodeLedger.NameFormatter = (name) => {
            let finalName = name;
            // custom frame
            if (name.endsWith("Custom")) {
                const nameIndex = name.lastIndexOf("Custom");
                finalName = name.substring(0, nameIndex);
                finalName += " [custom]";
            } else {
                finalName = name.replace("Block", "");
            }
            return finalName;
        };

        return (
            <div id="nodeList">
                <div className="panes">
                    <div className="pane">
                        <div className="filter">
                            <input
                                type="text"
                                placeholder="Filter"
                                onFocus={() => (this.props.globalState.lockObject.lock = true)}
                                onBlur={() => {
                                    this.props.globalState.lockObject.lock = false;
                                }}
                                onChange={(evt) => this.filterContent(evt.target.value)}
                            />
                        </div>
                        <div className="list-container">{blockMenu}</div>
                    </div>
                </div>
            </div>
        );
    }
}
