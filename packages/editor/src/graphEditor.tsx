import * as react from "react";
import type { GlobalState } from "./globalState";
import "./assets/styles/main.scss";

import { Portal } from "./portal.js";

import { MessageDialog } from "@babylonjs/shared-ui-components/components/MessageDialog.js";
import { GraphCanvasComponent } from "@babylonjs/shared-ui-components/nodeGraphSystem/graphCanvas.js";
import { LogComponent } from "./components/log/logComponent.js";
import { TypeLedger } from "@babylonjs/shared-ui-components/nodeGraphSystem/typeLedger.js";
import { BlockTools } from "./blockTools.js";
import { PropertyTabComponent } from "./components/propertyTab/propertyTabComponent.js";
import { NodeListComponent } from "./components/nodeList/nodeListComponent.js";
import { createDefaultInput } from "./graphSystem/registerDefaultInput.js";
import type { INodeData } from "@babylonjs/shared-ui-components/nodeGraphSystem/interfaces/nodeData";
import type { GraphNode } from "@babylonjs/shared-ui-components/nodeGraphSystem/graphNode";
import type { IEditorData } from "@babylonjs/shared-ui-components/nodeGraphSystem/interfaces/nodeLocationInfo";
import type { Nullable } from "@babylonjs/core/types";
import { BaseBlock } from "@babylonjs/smart-filters";
import { setEditorData } from "./helpers/serializationTools.js";
import { SplitContainer } from "@babylonjs/shared-ui-components/split/splitContainer.js";
import { Splitter } from "@babylonjs/shared-ui-components/split/splitter.js";
import { ControlledSize, SplitDirection } from "@babylonjs/shared-ui-components/split/splitContext.js";

interface IGraphEditorProps {
    globalState: GlobalState;
}

interface IGraphEditorState {
    showPreviewPopUp: boolean;
    message: string;
    isError: boolean;
}

export class GraphEditor extends react.Component<IGraphEditorProps, IGraphEditorState> {
    private _graphCanvasRef: react.RefObject<GraphCanvasComponent>;
    private _diagramContainerRef: react.RefObject<HTMLDivElement>;
    private _graphCanvas!: GraphCanvasComponent;
    private _diagramContainer!: HTMLDivElement;

    private _mouseLocationX = 0;
    private _mouseLocationY = 0;
    private _onWidgetKeyUpPointer: any;

    appendBlock(dataToAppend: BaseBlock | INodeData, recursion = true) {
        return this._graphCanvas.createNodeFromObject(
            dataToAppend instanceof BaseBlock
                ? TypeLedger.NodeDataBuilder(dataToAppend, this._graphCanvas)
                : dataToAppend,
            (block: BaseBlock) => {
                if (this.props.globalState.smartFilter!.attachedBlocks.indexOf(block) === -1) {
                    // TODO manage add but should not be possible to arrive here.
                    // this.props.globalState.smartFilter!.attachedBlocks.push(block);
                }

                if (block.getClassName() === "OutputBlock") {
                    // Do Nothing, only one output block allowed and created by the graph
                }
            },
            recursion
        );
    }

    addValueNode(type: string) {
        const nodeType = BlockTools.GetConnectionNodeTypeFromString(type);

        let newInputBlock: Nullable<BaseBlock> =
            this.props.globalState.blockRegistration?.createInputBlock(this.props.globalState, type) ?? null;

        if (!newInputBlock) {
            newInputBlock = createDefaultInput(
                this.props.globalState.smartFilter,
                nodeType,
                this.props.globalState.engine
            );
        }

        return this.appendBlock(newInputBlock);
    }

    override componentDidMount() {
        window.addEventListener("wheel", this.onWheel, { passive: false });

        if (this.props.globalState.hostDocument) {
            this._graphCanvas = this._graphCanvasRef.current!;
            this._diagramContainer = this._diagramContainerRef.current!;
        }

        if (navigator.userAgent.indexOf("Mobile") !== -1) {
            (
                (this.props.globalState.hostDocument || document).querySelector(".blocker") as HTMLElement
            ).style.visibility = "visible";
        }

        this.props.globalState.onPopupClosedObservable.addOnce(() => {
            this.componentWillUnmount();
        });

        this.build();
    }

    override componentWillUnmount() {
        window.removeEventListener("wheel", this.onWheel);

        if (this.props.globalState.hostDocument) {
            this.props.globalState.hostDocument!.removeEventListener("keyup", this._onWidgetKeyUpPointer, false);
        }

        // Save new editor data
        this.props.globalState.onSaveEditorDataRequiredObservable.notifyObservers();

        // if (this._previewManager) {
        //     this._previewManager.dispose();
        //     this._previewManager = null as any;
        // }
    }

    constructor(props: IGraphEditorProps) {
        super(props);

        this.state = {
            showPreviewPopUp: false,
            message: "",
            isError: true,
        };

        this._graphCanvasRef = react.createRef();
        this._diagramContainerRef = react.createRef();

        this.props.globalState.stateManager.onNewBlockRequiredObservable.add(
            (eventData: {
                type: string;
                targetX: number;
                targetY: number;
                needRepositioning?: boolean | undefined;
            }) => {
                let targetX = eventData.targetX;
                let targetY = eventData.targetY;

                if (eventData.needRepositioning) {
                    targetX = targetX - this._diagramContainer.offsetLeft;
                    targetY = targetY - this._diagramContainer.offsetTop;
                }

                this.emitNewBlock(eventData.type, targetX, targetY);
            }
        );

        this.props.globalState.stateManager.onRebuildRequiredObservable.add(async () => {
            if (this.props.globalState.rebuildRuntime) {
                this.props.globalState.rebuildRuntime(this.props.globalState.smartFilter);
            }
        });

        this.props.globalState.onSaveEditorDataRequiredObservable.add(() => {
            setEditorData(this.props.globalState.smartFilter, this.props.globalState, this._graphCanvas);
        });

        this.props.globalState.onResetRequiredObservable.add((isDefault) => {
            if (isDefault) {
                if (this.props.globalState.smartFilter) {
                    // this.buildMaterial();
                }
                this.build(true);
            } else {
                this.build();
                if (this.props.globalState.smartFilter) {
                    // this.buildMaterial();
                }
            }
        });

        this.props.globalState.onZoomToFitRequiredObservable.add(() => {
            this.zoomToFit();
        });

        this.props.globalState.onReOrganizedRequiredObservable.add(() => {
            this.reOrganize();
        });

        this.props.globalState.onGetNodeFromBlock = (block: BaseBlock) => {
            return this._graphCanvas.findNodeFromData(block);
        };

        this.props.globalState.hostDocument!.addEventListener("keydown", (evt) => {
            this._graphCanvas.handleKeyDown(
                evt,
                (nodeData) => {
                    if (!nodeData.data.isOutput) {
                        const block = nodeData.data as BaseBlock;
                        this.props.globalState.smartFilter!.removeBlock(block);
                    }
                },
                this._mouseLocationX,
                this._mouseLocationY,
                (_nodeData) => {
                    // TODO manage paste
                    // const block = nodeData.data as SmartFilterBlock;
                    // const clone = block.clone(this.props.globalState.smartFilter);
                    // if (!clone) {
                    //     return null;
                    // }
                    // return this.appendBlock(clone, false);
                },
                this.props.globalState.hostDocument!.querySelector(".diagram-container") as HTMLDivElement
            );
        });

        this.props.globalState.stateManager.onErrorMessageDialogRequiredObservable.add((message: string) => {
            this.setState({ message: message, isError: true });
        });
    }

    zoomToFit() {
        this._graphCanvas.zoomToFit();
    }

    build(ignoreEditorData = false) {
        const editorData = ignoreEditorData ? null : this.props.globalState.smartFilter.editorData;
        this._graphCanvas._isLoading = true; // Will help loading large graphs

        // setup the diagram model
        this._graphCanvas.reset();

        // Load graph of nodes from the Smart Filter
        if (this.props.globalState.smartFilter) {
            this.loadGraph();
        }

        this.reOrganize(editorData);
    }

    loadGraph() {
        const smartFilter = this.props.globalState.smartFilter;

        smartFilter.attachedBlocks.forEach((n: BaseBlock) => {
            this.appendBlock(n, true);
        });

        // Links
        smartFilter.attachedBlocks.forEach((n: BaseBlock) => {
            if (n.inputs.length) {
                const nodeData = this._graphCanvas.findNodeFromData(n);
                for (const input of nodeData.content.inputs) {
                    if (input.isConnected) {
                        this._graphCanvas.connectPorts(input.connectedPort!, input);
                    }
                }
            }
        });
    }

    showWaitScreen() {
        this.props.globalState.hostDocument.querySelector(".wait-screen")?.classList.remove("hidden");
    }

    hideWaitScreen() {
        this.props.globalState.hostDocument.querySelector(".wait-screen")?.classList.add("hidden");
    }

    reOrganize(editorData: Nullable<IEditorData> = null, isImportingAFrame = false) {
        this.showWaitScreen();
        this._graphCanvas._isLoading = true; // Will help loading large graphs

        setTimeout(() => {
            this._graphCanvas.reOrganize(editorData, isImportingAFrame);
            this.hideWaitScreen();
        });
    }

    onWheel = (evt: WheelEvent) => {
        if (this.props.globalState.pointerOverCanvas) {
            return evt.preventDefault();
        }

        if (evt.ctrlKey) {
            return evt.preventDefault();
        }

        if (Math.abs(evt.deltaX) < Math.abs(evt.deltaY)) {
            return;
        }

        const targetElem = evt.currentTarget as HTMLElement;
        const scrollLeftMax = targetElem.scrollWidth - targetElem.offsetWidth;
        if (targetElem.scrollLeft + evt.deltaX < 0 || targetElem.scrollLeft + evt.deltaX > scrollLeftMax) {
            return evt.preventDefault();
        }
    };

    emitNewBlock(blockType: string, targetX: number, targetY: number) {
        let newNode: Nullable<GraphNode> = null;

        if (blockType.indexOf("Block") === -1) {
            newNode = this.addValueNode(blockType);
        } else {
            const blockRegistration = this.props.globalState.blockRegistration;
            if (blockRegistration) {
                const block = blockRegistration.getBlockFromString(blockType, this.props.globalState.smartFilter);
                if (block) {
                    if (blockRegistration.getIsUniqueBlock(block)) {
                        const className = block.getClassName();
                        for (const other of this._graphCanvas.getCachedData()) {
                            if (other !== block && other.getClassName() === className) {
                                this.props.globalState.stateManager.onErrorMessageDialogRequiredObservable.notifyObservers(
                                    `You can only have one ${className} per graph`
                                );
                                return;
                            }
                        }
                    }

                    newNode = this.appendBlock(block);
                }
            }
        }

        if (!newNode) {
            return;
        }

        // Size exceptions
        let offsetX = GraphCanvasComponent.NodeWidth;
        let offsetY = 20;

        if (blockType === "ElbowBlock") {
            offsetX = 10;
            offsetY = 10;
        }

        // Drop
        this._graphCanvas.drop(newNode, targetX, targetY, offsetX, offsetY);

        this.forceUpdate();
    }

    dropNewBlock(event: react.DragEvent<HTMLDivElement>) {
        const data = event.dataTransfer.getData("babylonjs-smartfilter-node") as string;

        this.emitNewBlock(
            data,
            event.clientX - this._diagramContainer.offsetLeft,
            event.clientY - this._diagramContainer.offsetTop
        );
    }

    override render() {
        return (
            <Portal globalState={this.props.globalState}>
                <SplitContainer
                    id="filter-editor-graph-root"
                    direction={SplitDirection.Horizontal}
                    onPointerMove={(evt) => {
                        this._mouseLocationX = evt.pageX;
                        this._mouseLocationY = evt.pageY;
                    }}
                    onPointerDown={(evt) => {
                        if ((evt.target as HTMLElement).nodeName === "INPUT") {
                            return;
                        }
                        this.props.globalState.lockObject.lock = false;
                    }}
                >
                    {/* Node creation menu */}
                    <NodeListComponent globalState={this.props.globalState} />

                    <Splitter
                        size={8}
                        minSize={180}
                        initialSize={200}
                        maxSize={350}
                        controlledSide={ControlledSize.First}
                    />

                    {/* The node graph diagram */}
                    <SplitContainer
                        className="diagram-container"
                        direction={SplitDirection.Vertical}
                        containerRef={this._diagramContainerRef}
                        onDrop={(event) => {
                            this.dropNewBlock(event);
                        }}
                        onDragOver={(event) => {
                            event.preventDefault();
                        }}
                    >
                        <GraphCanvasComponent
                            ref={this._graphCanvasRef}
                            stateManager={this.props.globalState.stateManager}
                            onEmitNewNode={(nodeData) => {
                                return this.appendBlock(nodeData.data as BaseBlock);
                            }}
                        />
                        <Splitter
                            size={8}
                            minSize={40}
                            initialSize={120}
                            maxSize={500}
                            controlledSide={ControlledSize.Second}
                        />
                        <LogComponent globalState={this.props.globalState} />
                    </SplitContainer>

                    <Splitter
                        size={8}
                        minSize={250}
                        initialSize={300}
                        maxSize={500}
                        controlledSide={ControlledSize.Second}
                    />

                    {/* Property tab */}
                    <div className="right-panel">
                        <PropertyTabComponent
                            lockObject={this.props.globalState.lockObject}
                            globalState={this.props.globalState}
                        />
                    </div>
                </SplitContainer>
                <MessageDialog
                    message={this.state.message}
                    isError={this.state.isError}
                    onClose={() => this.setState({ message: "" })}
                />
            </Portal>
        );
    }
}
