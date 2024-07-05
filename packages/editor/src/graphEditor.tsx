import * as react from "react";
import type { GlobalState } from "./globalState";

// import * as reactDOM from "react-dom";
// import { Popup } from "./sharedComponents/popup";

import "./assets/styles/main.scss";

import { Portal } from "./portal.js";

import { MessageDialog } from "@babylonjs/shared-ui-components/components/MessageDialog.js";
import { GraphCanvasComponent } from "@babylonjs/shared-ui-components/nodeGraphSystem/graphCanvas.js";
import { LogComponent } from "./components/log/logComponent.js";
import { TypeLedger } from "@babylonjs/shared-ui-components/nodeGraphSystem/typeLedger.js";
import { DataStorage } from "@babylonjs/core/Misc/dataStorage.js";
import { BlockTools } from "./blockTools.js";
import { PropertyTabComponent } from "./components/propertyTab/propertyTabComponent.js";
import { NodeListComponent } from "./components/nodeList/nodeListComponent.js";
import { createDefaultInput, createWebCamInput } from "./graphSystem/registerDefaultInput.js";
import type { INodeData } from "@babylonjs/shared-ui-components/nodeGraphSystem/interfaces/nodeData";
import type { GraphNode } from "@babylonjs/shared-ui-components/nodeGraphSystem/graphNode";
import type { IEditorData } from "@babylonjs/shared-ui-components/nodeGraphSystem/interfaces/nodeLocationInfo";
import type { Nullable } from "@babylonjs/core/types";
import { BaseBlock } from "@babylonjs/smart-filters";

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

    private _startX: number = 0;
    private _moveInProgress: boolean = false;

    private _leftWidth = DataStorage.ReadNumber("LeftWidth", 200);
    private _rightWidth = DataStorage.ReadNumber("RightWidth", 300);

    private _mouseLocationX = 0;
    private _mouseLocationY = 0;
    private _onWidgetKeyUpPointer: any;

    // private _previewManager: PreviewManager;
    // private _previewHost: Nullable<HTMLElement>;
    // private _popUpWindow: Window;

    appendBlock(dataToAppend: BaseBlock | INodeData, recursion = true) {
        return this._graphCanvas.createNodeFromObject(
            //dataToAppend instanceof BaseBlock
            /*?*/ TypeLedger.NodeDataBuilder(dataToAppend, this._graphCanvas),
            //: dataToAppend,
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

        let newInputBlock: BaseBlock;
        if (type === "WebCam") {
            newInputBlock = createWebCamInput(this.props.globalState.smartFilter, this.props.globalState.engine);
        } else {
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
            // this._previewManager = new PreviewManager(this.props.globalState.hostDocument.getElementById("preview-canvas") as HTMLCanvasElement, this.props.globalState);
            // (this.props.globalState as any)._previewManager = this._previewManager;
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
            if (this.props.globalState.smartFilter) {
                // this.buildMaterial(autoConfigure);

                if (this.props.globalState.runtime) {
                    this.props.globalState.runtime.dispose();
                }

                try {
                    this.props.globalState.runtime = await this.props.globalState.smartFilter.createRuntimeAsync(
                        this.props.globalState.engine
                    );
                } catch (err: unknown) {
                    console.error("Smart Filter could not create a runtime", err);
                }
            }
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

        // this.props.globalState.onImportFrameObservable.add((source: any) => {
        //     const frameData = source.editorData.frames[0];

        //     // create new graph nodes for only blocks from frame (last blocks added)
        //     this.props.globalState.smartFilter.attachedBlocks.slice(-frameData.blocks.length).forEach((block: SmartFilterBlock) => {
        //         this.appendBlock(block);
        //     });
        //     this._graphCanvas.addFrame(frameData);
        //     this.reOrganize(this.props.globalState.smartFilter.editorData, true);
        // });

        this.props.globalState.onZoomToFitRequiredObservable.add(() => {
            this.zoomToFit();
        });

        this.props.globalState.onReOrganizedRequiredObservable.add(() => {
            this.reOrganize();
        });

        // this.props.globalState.onGetNodeFromBlock = (block) => {
        //     return this._graphCanvas.findNodeFromData(block);
        // };

        this.props.globalState.hostDocument!.addEventListener("keydown", (evt) => {
            this._graphCanvas.handleKeyDown(
                evt,
                (nodeData) => {
                    if (!nodeData.data.isOutput) {
                        this.props.globalState.smartFilter!.removeBlock(nodeData.data as BaseBlock);
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

    // buildMaterial(autoConfigure = true) {
    //     if (!this.props.globalState.smartFilter) {
    //         return;
    //     }

    //     try {
    //         this.props.globalState.smartFilter.options.emitComments = true;
    //         this.props.globalState.smartFilter.build(true, undefined, autoConfigure);
    //         this.props.globalState.onLogRequiredObservable.notifyObservers(new LogEntry("Node material build successful", false));
    //     } catch (err) {
    //         this.props.globalState.onLogRequiredObservable.notifyObservers(new LogEntry(err, true));
    //     }

    //     SerializationTools.UpdateLocations(this.props.globalState.smartFilter, this.props.globalState);

    //     this.props.globalState.onBuiltObservable.notifyObservers();
    // }

    build(ignoreEditorData = false) {
        let editorData = ignoreEditorData ? null : this.props.globalState.smartFilter.editorData;
        this._graphCanvas._isLoading = true; // Will help loading large graphs

        if (editorData instanceof Array) {
            editorData = {
                locations: editorData,
            };
        }

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

    onPointerDown(evt: react.PointerEvent<HTMLDivElement>) {
        this._startX = evt.clientX;
        this._moveInProgress = true;
        evt.currentTarget.setPointerCapture(evt.pointerId);
    }

    onPointerUp(evt: react.PointerEvent<HTMLDivElement>) {
        this._moveInProgress = false;
        evt.currentTarget.releasePointerCapture(evt.pointerId);
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

    resizeColumns(evt: react.PointerEvent<HTMLDivElement>, forLeft = true) {
        if (!this._moveInProgress) {
            return;
        }

        const deltaX = evt.clientX - this._startX;
        const rootElement = evt.currentTarget.ownerDocument!.getElementById(
            "filter-editor-graph-root"
        ) as HTMLDivElement;

        if (forLeft) {
            this._leftWidth += deltaX;
            this._leftWidth = Math.max(150, Math.min(400, this._leftWidth));
            DataStorage.WriteNumber("LeftWidth", this._leftWidth);
        } else {
            this._rightWidth -= deltaX;
            this._rightWidth = Math.max(250, Math.min(500, this._rightWidth));
            DataStorage.WriteNumber("RightWidth", this._rightWidth);
            // rootElement.ownerDocument!.getElementById("preview")!.style.height = this._rightWidth + "px";
        }

        rootElement.style.gridTemplateColumns = this.buildColumnLayout();

        this._startX = evt.clientX;
    }

    buildColumnLayout() {
        return `${this._leftWidth}px 4px calc(100% - ${this._leftWidth + 8 + this._rightWidth}px) 4px ${this._rightWidth}px`;
    }

    emitNewBlock(blockType: string, targetX: number, targetY: number) {
        let newNode: GraphNode;

        // let customBlockData: any;

        // if (blockType.indexOf("CustomBlock") > -1) {
        //     const storageData = localStorage.getItem(blockType);
        //     if (!storageData) {
        //         this.props.globalState.stateManager.onErrorMessageDialogRequiredObservable.notifyObservers(`Error loading custom block`);
        //         return;
        //     }

        //     customBlockData = JSON.parse(storageData);
        //     if (!customBlockData) {
        //         this.props.globalState.stateManager.onErrorMessageDialogRequiredObservable.notifyObservers(`Error parsing custom block`);
        //         return;
        //     }
        // } else if (blockType.indexOf("Custom") > -1) {
        //     const storageData = localStorage.getItem(blockType);
        //     if (storageData) {
        //         const frameData = JSON.parse(storageData);

        //         //edit position before loading.
        //         const newX = (targetX - this._graphCanvas.x - GraphCanvasComponent.NodeWidth) / this._graphCanvas.zoom;
        //         const newY = (targetY - this._graphCanvas.y - 20) / this._graphCanvas.zoom;
        //         const oldX = frameData.editorData.frames[0].x;
        //         const oldY = frameData.editorData.frames[0].y;
        //         frameData.editorData.frames[0].x = newX;
        //         frameData.editorData.frames[0].y = newY;
        //         for (const location of frameData.editorData.locations) {
        //             location.x += newX - oldX;
        //             location.y += newY - oldY;
        //         }

        //         SerializationTools.AddFrameToMaterial(frameData, this.props.globalState, this.props.globalState.nodeMaterial);
        //         this._graphCanvas.frames[this._graphCanvas.frames.length - 1].cleanAccumulation();
        //         this.forceUpdate();
        //         return;
        //     }
        // }

        if (blockType.indexOf("Block") === -1) {
            newNode = this.addValueNode(blockType);
        } else {
            // let block: SmartFilterBlock;
            // if (customBlockData) {
            //     block = new CustomBlock("");
            //     (block as CustomBlock).options = customBlockData;
            // } else {
            //     block = BlockTools.GetBlockFromString(blockType, this.props.globalState.smartFilter.engine)!;
            // }

            const block = BlockTools.GetBlockFromString(blockType, this.props.globalState.smartFilter)!;
            if (BlockTools.IsUniqueBlock(block)) {
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

            // block.autoConfigure(this.props.globalState.smartFilter);

            newNode = this.appendBlock(block);
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

    // handlePopUp = () => {
    //     this.setState({
    //         showPreviewPopUp: true,
    //     });
    //     this.createPopUp();
    //     this.props.globalState.hostWindow.addEventListener("beforeunload", this.handleClosingPopUp);
    // };

    // handleClosingPopUp = () => {
    //     if (this._previewManager) {
    //         this._previewManager.dispose();
    //     }
    //     this._popUpWindow.close();
    //     this.setState(
    //         {
    //             showPreviewPopUp: false,
    //         },
    //         () => this.initiatePreviewArea()
    //     );
    // };

    // initiatePreviewArea = (canvas: HTMLCanvasElement = this.props.globalState.hostDocument.getElementById("preview-canvas") as HTMLCanvasElement) => {
    //     this._previewManager = new PreviewManager(canvas, this.props.globalState);
    // };

    // createPopUp = () => {
    //     const userOptions = {
    //         original: true,
    //         popup: true,
    //         overlay: false,
    //         embedMode: false,
    //         enableClose: true,
    //         handleResize: true,
    //         enablePopup: true,
    //     };
    //     const options = {
    //         embedHostWidth: "100%",
    //         ...userOptions,
    //     };
    //     const popUpWindow = this.createPopupWindow("PREVIEW AREA", "_PreviewHostWindow");
    //     if (popUpWindow) {
    //         popUpWindow.addEventListener("beforeunload", this.handleClosingPopUp);
    //         const parentControl = popUpWindow.document.getElementById("node-editor-graph-root");
    //         this.createPreviewMeshControlHost(options, parentControl);
    //         this.createPreviewHost(options, parentControl);
    //         if (parentControl) {
    //             this.fixPopUpStyles(parentControl.ownerDocument!);
    //             this.initiatePreviewArea(parentControl.ownerDocument!.getElementById("preview-canvas") as HTMLCanvasElement);
    //         }
    //     }
    // };

    // createPopupWindow = (title: string, windowVariableName: string, width = 500, height = 500): Window | null => {
    //     const windowCreationOptionsList = {
    //         width: width,
    //         height: height,
    //         top: (this.props.globalState.hostWindow.innerHeight - width) / 2 + window.screenY,
    //         left: (this.props.globalState.hostWindow.innerWidth - height) / 2 + window.screenX,
    //     };

    //     const windowCreationOptions = Object.keys(windowCreationOptionsList)
    //         .map((key) => key + "=" + (windowCreationOptionsList as any)[key])
    //         .join(",");

    //     const popupWindow = this.props.globalState.hostWindow.open("", title, windowCreationOptions);
    //     if (!popupWindow) {
    //         return null;
    //     }

    //     const parentDocument = popupWindow.document;

    //     parentDocument.title = title;
    //     parentDocument.body.style.width = "100%";
    //     parentDocument.body.style.height = "100%";
    //     parentDocument.body.style.margin = "0";
    //     parentDocument.body.style.padding = "0";

    //     const parentControl = parentDocument.createElement("div");
    //     parentControl.style.width = "100%";
    //     parentControl.style.height = "100%";
    //     parentControl.style.margin = "0";
    //     parentControl.style.padding = "0";
    //     parentControl.style.display = "grid";
    //     parentControl.style.gridTemplateRows = "40px auto";
    //     parentControl.id = "node-editor-graph-root";
    //     parentControl.className = "right-panel popup";

    //     popupWindow.document.body.appendChild(parentControl);

    //     Popup._CopyStyles(this.props.globalState.hostWindow.document, parentDocument);

    //     (this as any)[windowVariableName] = popupWindow;

    //     this._popUpWindow = popupWindow;

    //     return popupWindow;
    // };

    // createPreviewMeshControlHost = (options: IInternalPreviewAreaOptions, parentControl: Nullable<HTMLElement>) => {
    //     // Prepare the preview control host
    //     if (parentControl) {
    //         const host = parentControl.ownerDocument!.createElement("div");

    //         host.id = "PreviewMeshControl-host";
    //         host.style.width = options.embedHostWidth || "auto";

    //         parentControl.appendChild(host);
    //         const previewMeshControlComponentHost = React.createElement(PreviewMeshControlComponent, {
    //             globalState: this.props.globalState,
    //             togglePreviewAreaComponent: this.handlePopUp,
    //         });
    //         ReactDOM.render(previewMeshControlComponentHost, host);
    //     }
    // };

    // createPreviewHost = (options: IInternalPreviewAreaOptions, parentControl: Nullable<HTMLElement>) => {
    //     // Prepare the preview host
    //     if (parentControl) {
    //         const host = parentControl.ownerDocument!.createElement("div");

    //         host.id = "PreviewAreaComponent-host";
    //         host.style.width = options.embedHostWidth || "auto";
    //         host.style.height = "100%";
    //         host.style.overflow = "hidden";
    //         host.style.display = "grid";
    //         host.style.gridRow = "2";
    //         host.style.gridTemplateRows = "auto 40px";
    //         host.style.gridTemplateRows = "calc(100% - 40px) 40px";

    //         parentControl.appendChild(host);

    //         this._previewHost = host;

    //         if (!options.overlay) {
    //             this._previewHost.style.position = "relative";
    //         }
    //     }

    //     if (this._previewHost) {
    //         const previewAreaComponentHost = React.createElement(PreviewAreaComponent, {
    //             globalState: this.props.globalState,
    //             width: 200,
    //         });
    //         ReactDOM.render(previewAreaComponentHost, this._previewHost);
    //     }
    // };

    fixPopUpStyles = (document: Document) => {
        const previewContainer = document.getElementById("preview");
        if (previewContainer) {
            previewContainer.style.height = "auto";
            previewContainer.style.gridRow = "1";
        }
        const previewConfigBar = document.getElementById("preview-config-bar");
        if (previewConfigBar) {
            previewConfigBar.style.gridRow = "2";
        }
        const newWindowButton = document.getElementById("preview-new-window");
        if (newWindowButton) {
            newWindowButton.style.display = "none";
        }
        const previewMeshBar = document.getElementById("preview-mesh-bar");
        if (previewMeshBar) {
            previewMeshBar.style.gridTemplateColumns = "auto 1fr 40px 40px";
        }
    };

    override render() {
        return (
            <Portal globalState={this.props.globalState}>
                <div
                    id="filter-editor-graph-root"
                    style={{
                        gridTemplateColumns: this.buildColumnLayout(),
                    }}
                    // onMouseMove={(evt) => {
                    //     this._mouseLocationX = evt.pageX;
                    //     this._mouseLocationY = evt.pageY;
                    // }}
                    onMouseDown={(evt) => {
                        if ((evt.target as HTMLElement).nodeName === "INPUT") {
                            return;
                        }
                        this.props.globalState.lockObject.lock = false;
                    }}
                >
                    {/* Node creation menu */}
                    <NodeListComponent globalState={this.props.globalState} />

                    <div
                        id="leftGrab"
                        onPointerDown={(evt) => this.onPointerDown(evt)}
                        onPointerUp={(evt) => this.onPointerUp(evt)}
                        onPointerMove={(evt) => this.resizeColumns(evt)}
                    ></div>

                    {/* The node graph diagram */}
                    <div
                        className="diagram-container"
                        ref={this._diagramContainerRef}
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
                    </div>

                    <div
                        id="rightGrab"
                        onPointerDown={(evt) => this.onPointerDown(evt)}
                        onPointerUp={(evt) => this.onPointerUp(evt)}
                        onPointerMove={(evt) => this.resizeColumns(evt, false)}
                    ></div>

                    {/* Property tab */}
                    <div className="right-panel">
                        <PropertyTabComponent
                            lockObject={this.props.globalState.lockObject}
                            globalState={this.props.globalState}
                        />
                        {/* {!this.state.showPreviewPopUp ? <PreviewMeshControlComponent globalState={this.props.globalState} togglePreviewAreaComponent={this.handlePopUp} /> : null}
                        {!this.state.showPreviewPopUp ? <PreviewAreaComponent globalState={this.props.globalState} width={this._rightWidth} /> : null} */}
                    </div>

                    <LogComponent globalState={this.props.globalState} />
                </div>
                <MessageDialog
                    message={this.state.message}
                    isError={this.state.isError}
                    onClose={() => this.setState({ message: "" })}
                />
                {/* <div className="blocker">Node Material Editor runs only on desktop</div>
                <div className="wait-screen hidden">Processing...please wait</div> */}
            </Portal>
        );
    }
}
