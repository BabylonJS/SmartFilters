/* eslint-disable @typescript-eslint/naming-convention */
import * as react from "react";
import type { Nullable } from "@babylonjs/core/types";
import type { Observer } from "@babylonjs/core/Misc/observable";
import { Tools } from "@babylonjs/core/Misc/tools.js";

import type { GlobalState } from "../../globalState";
import { LineContainerComponent } from "../../sharedComponents/lineContainerComponent.js";
import { NodeLedger } from "@babylonjs/shared-ui-components/nodeGraphSystem/nodeLedger.js";
import "../../assets/styles/components/nodeList.scss";
import { DraggableBlockLineComponent } from "../../sharedComponents/draggableBlockLineComponent.js";
import deleteButton from "../../assets/imgs/delete.svg";
import addButton from "../../assets/imgs/add.svg";
import { LineWithFileButtonComponent } from "../../sharedComponents/lineWithFileButtonComponent.js";
import type { IBlockEditorRegistration } from "../../smartFilterEditor";
import { getBlockNameForEditor } from "../../helpers/blockNameConverters.js";

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

    loadCustomBlock(file: File) {
        Tools.ReadFile(
            file,
            async (data) => {
                if (!this.props.globalState.addCustomBlock) {
                    return;
                }

                const decoder = new TextDecoder("utf-8");
                this.props.globalState.addCustomBlock(decoder.decode(data));

                this.forceUpdate();
            },
            undefined,
            true
        );
    }

    deleteCustomBlock(block: IBlockEditorRegistration) {
        if (!this.props.globalState.deleteCustomBlock) {
            return;
        }

        this.props.globalState.deleteCustomBlock(block);

        this.forceUpdate();
    }

    override render() {
        // Create node menu
        const blockMenu = [];
        const allBlocks = this.props.globalState.blockRegistration.allBlocks;

        for (const key in allBlocks) {
            const blockList = allBlocks[key]!.filter(
                (block: IBlockEditorRegistration) =>
                    !this.state.filter || block.blockType.toLowerCase().indexOf(this.state.filter.toLowerCase()) !== -1
            )
                .sort((a: IBlockEditorRegistration, b: IBlockEditorRegistration) =>
                    a.blockType.localeCompare(b.blockType)
                )
                .map((block: IBlockEditorRegistration) => {
                    if (block.isCustom) {
                        return (
                            <DraggableBlockLineComponent
                                key={getBlockNameForEditor(block.blockType, block.namespace)}
                                block={block}
                                iconImage={deleteButton}
                                iconTitle="Delete"
                                onIconClick={() => {
                                    this.deleteCustomBlock(block);
                                }}
                            />
                        );
                    }
                    return (
                        <DraggableBlockLineComponent
                            key={getBlockNameForEditor(block.blockType, block.namespace)}
                            block={block}
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
                        onIconClick={(file) => this.loadCustomBlock(file)}
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
            const blocks = allBlocks[key];
            if (blocks && blocks.length) {
                for (const block of blocks) {
                    const blockNameForEditor = getBlockNameForEditor(block.blockType, block.namespace);
                    if (!ledger.includes(blockNameForEditor)) {
                        ledger.push(blockNameForEditor);
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
