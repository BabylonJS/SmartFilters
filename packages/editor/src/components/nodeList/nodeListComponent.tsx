/* eslint-disable @typescript-eslint/naming-convention */
import * as react from "react";
import type { GlobalState } from "../../globalState";

import { LineContainerComponent } from "../../sharedComponents/lineContainerComponent.js";
import { DraggableLineComponent } from "../../sharedComponents/draggableLineComponent.js";
// import { DraggableLineWithButtonComponent } from "../../sharedComponents/draggableLineWithButtonComponent";
// import { LineWithFileButtonComponent } from "../../sharedComponents/lineWithFileButtonComponent";

// import addButton from "../../assets/imgs/add.svg";
// import deleteButton from "../../assets/imgs/delete.svg";

import "../../assets/styles/components/nodeList.scss";

import type { Nullable } from "@babylonjs/core/types";
import type { Observer } from "@babylonjs/core/Misc/observable";
// import { Tools } from "@babylonjs/core/Misc/tools";

interface INodeListComponentProps {
    globalState: GlobalState;
}

export class NodeListComponent extends react.Component<INodeListComponentProps, { filter: string }> {
    private _onResetRequiredObserver: Nullable<Observer<boolean>>;

    // private _customFrameList: { [key: string]: string };
    // private _customBlockList: { [key: string]: string };

    constructor(props: INodeListComponentProps) {
        super(props);

        this.state = { filter: "" };

        // const frameJson = localStorage.getItem("Custom-Frame-List");
        // if (frameJson) {
        //     this._customFrameList = JSON.parse(frameJson);
        // }

        // const blockJson = localStorage.getItem("Custom-Block-List");
        // if (blockJson) {
        //     this._customBlockList = JSON.parse(blockJson);
        // }

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

    // loadCustomFrame(file: File) {
    //     Tools.ReadFile(
    //         file,
    //         async (data) => {
    //             // get Frame Data from file
    //             const decoder = new TextDecoder("utf-8");
    //             const frameData = JSON.parse(decoder.decode(data));
    //             const frameName = frameData.editorData.frames[0].name + "Custom";
    //             const frameToolTip = frameData.editorData.frames[0].comments || "";

    //             try {
    //                 localStorage.setItem(frameName, JSON.stringify(frameData));
    //             } catch (error) {
    //                 this.props.globalState.stateManager.onErrorMessageDialogRequiredObservable.notifyObservers("Error Saving Frame");
    //                 return;
    //             }

    //             const frameJson = localStorage.getItem("Custom-Frame-List");
    //             let frameList: { [key: string]: string } = {};
    //             if (frameJson) {
    //                 frameList = JSON.parse(frameJson);
    //             }
    //             frameList[frameName] = frameToolTip;
    //             localStorage.setItem("Custom-Frame-List", JSON.stringify(frameList));
    //             this._customFrameList = frameList;
    //             this.forceUpdate();
    //         },
    //         undefined,
    //         true
    //     );
    // }

    // removeItem(value: string): void {
    //     const frameJson = localStorage.getItem("Custom-Frame-List");
    //     if (frameJson) {
    //         const frameList = JSON.parse(frameJson);
    //         delete frameList[value];
    //         localStorage.removeItem(value);
    //         localStorage.setItem("Custom-Frame-List", JSON.stringify(frameList));
    //         this._customFrameList = frameList;
    //         this.forceUpdate();
    //     }
    // }

    // loadCustomBlock(file: File) {
    //     Tools.ReadFile(
    //         file,
    //         async (data) => {
    //             // get Block Data from file
    //             const decoder = new TextDecoder("utf-8");
    //             const blockData = JSON.parse(decoder.decode(data));
    //             const blockName = (blockData.name || "") + "CustomBlock";
    //             const blockToolTip = blockData.comments || "";

    //             try {
    //                 localStorage.setItem(blockName, JSON.stringify(blockData));
    //             } catch (error) {
    //                 this.props.globalState.stateManager.onErrorMessageDialogRequiredObservable.notifyObservers("Error Saving Block");
    //                 return;
    //             }

    //             const blockJson = localStorage.getItem("Custom-Block-List");
    //             let blockList: { [key: string]: string } = {};
    //             if (blockJson) {
    //                 blockList = JSON.parse(blockJson);
    //             }
    //             blockList[blockName] = blockToolTip;
    //             localStorage.setItem("Custom-Block-List", JSON.stringify(blockList));
    //             this._customBlockList = blockList;
    //             this.forceUpdate();
    //         },
    //         undefined,
    //         true
    //     );
    // }

    // removeCustomBlock(value: string): void {
    //     const blockJson = localStorage.getItem("Custom-Block-List");
    //     if (blockJson) {
    //         const blockList = JSON.parse(blockJson);
    //         delete blockList[value];
    //         localStorage.removeItem(value);
    //         localStorage.setItem("Custom-Block-List", JSON.stringify(blockList));
    //         this._customBlockList = blockList;
    //         this.forceUpdate();
    //     }
    // }

    override render() {
        // const customFrameNames: string[] = [];
        // for (const frame in this._customFrameList) {
        //     customFrameNames.push(frame);
        // }

        // const customBlockNames: string[] = [];
        // for (const block in this._customBlockList) {
        //     customBlockNames.push(block);
        // }

        // Create node menu
        const blockMenu = [];
        for (const key in this.props.globalState.blockRegistration.allBlockNames) {
            const blockList = (this.props.globalState.blockRegistration.allBlockNames as any)[key]
                .filter(
                    (b: string) => !this.state.filter || b.toLowerCase().indexOf(this.state.filter.toLowerCase()) !== -1
                )
                .sort((a: string, b: string) => a.localeCompare(b))
                .map((block: string) => {
                    // if (key === "Custom_Frames") {
                    //     return (
                    //         <DraggableLineWithButtonComponent
                    //             key={block}
                    //             data={block}
                    //             tooltip={this._customFrameList[block] || ""}
                    //             iconImage={deleteButton}
                    //             iconTitle="Delete"
                    //             onIconClick={(value) => this.removeItem(value)}
                    //         />
                    //     );
                    // } else if (key === "Custom_Blocks") {
                    //     return (
                    //         <DraggableLineWithButtonComponent
                    //             key={block}
                    //             data={block}
                    //             tooltip={this._customBlockList[block] || ""}
                    //             iconImage={deleteButton}
                    //             iconTitle="Delete"
                    //             onIconClick={(value) => this.removeCustomBlock(value)}
                    //             lenSuffixToRemove={11}
                    //         />
                    //     );
                    // }
                    return (
                        <DraggableLineComponent
                            key={block}
                            data={block}
                            tooltip={this.props.globalState.blockRegistration.blockTooltips[block] || ""}
                        />
                    );
                });

            // if (key === "Custom_Frames") {
            //     const line = (
            //         <LineWithFileButtonComponent
            //             key="add..."
            //             title={"Add Custom Frame"}
            //             closed={false}
            //             label="Add..."
            //             uploadName={"custom-frame-upload"}
            //             iconImage={addButton}
            //             accept=".json"
            //             onIconClick={(file) => {
            //                 this.loadCustomFrame(file);
            //             }}
            //         />
            //     );
            //     blockList.push(line);
            // } else if (key === "Custom_Blocks") {
            //     const line = (
            //         <LineWithFileButtonComponent
            //             key="add..."
            //             title={"Add Custom Block"}
            //             closed={false}
            //             label="Add..."
            //             uploadName={"custom-block-upload"}
            //             iconImage={addButton}
            //             accept=".json"
            //             onIconClick={(file) => {
            //                 this.loadCustomBlock(file);
            //             }}
            //         />
            //     );
            //     blockList.push(line);
            // }
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
