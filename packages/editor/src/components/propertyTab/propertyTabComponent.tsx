import { GraphFrame } from "@babylonjs/shared-ui-components/nodeGraphSystem/graphFrame.js";
import { GraphNode } from "@babylonjs/shared-ui-components/nodeGraphSystem/graphNode.js";
import { NodePort } from "@babylonjs/shared-ui-components/nodeGraphSystem/nodePort.js";
import * as react from "react";
import { DataStorage } from "@babylonjs/core/Misc/dataStorage.js";
import { ThinEngine } from "@babylonjs/core/Engines/thinEngine.js";

import { FileButtonLineComponent } from "../../sharedComponents/fileButtonLineComponent.js";
import { LineContainerComponent } from "../../sharedComponents/lineContainerComponent.js";
import { CheckBoxLineComponent } from "../../sharedComponents/checkBoxLineComponent.js";

import { IsFramePortData } from "@babylonjs/shared-ui-components/nodeGraphSystem/tools.js";
// import { OptionsLineComponent } from "@babylonjs/shared-ui-components/lines/optionsLineComponent";
import { TextLineComponent } from "@babylonjs/shared-ui-components/lines/textLineComponent.js";
import { TextInputLineComponent } from "@babylonjs/shared-ui-components/lines/textInputLineComponent.js";
import { ButtonLineComponent } from "@babylonjs/shared-ui-components/lines/buttonLineComponent.js";
import { SliderLineComponent } from "@babylonjs/shared-ui-components/lines/sliderLineComponent.js";
import { InputsPropertyTabComponent } from "./inputsPropertyTabComponent.js";
import { BlockTools } from "../../blockTools.js";

import type { Nullable } from "@babylonjs/core/types";
import type { FrameNodePort } from "@babylonjs/shared-ui-components/nodeGraphSystem/frameNodePort";
import type { LockObject } from "@babylonjs/shared-ui-components/tabs/propertyGrids/lockObject";
import type { GlobalState } from "../../globalState";
import type { ISelectionChangedOptions } from "@babylonjs/shared-ui-components/nodeGraphSystem/interfaces/selectionChangedOptions";
import type { AnyInputBlock } from "@babylonjs/smart-filters";

interface IPropertyTabComponentProps {
    globalState: GlobalState;
    lockObject: LockObject;
}

interface IPropertyTabComponentState {
    currentNode: Nullable<GraphNode>;
    currentFrame: Nullable<GraphFrame>;
    currentFrameNodePort: Nullable<FrameNodePort>;
    currentNodePort: Nullable<NodePort>;
    uploadInProgress: boolean;
}

export class PropertyTabComponent extends react.Component<IPropertyTabComponentProps, IPropertyTabComponentState> {
    // private _onBuiltObserver: Nullable<Observer<void>>;
    // private _modeSelect: React.RefObject<OptionsLineComponent>;

    constructor(props: IPropertyTabComponentProps) {
        super(props);

        this.state = {
            currentNode: null,
            currentFrame: null,
            currentFrameNodePort: null,
            currentNodePort: null,
            uploadInProgress: false,
        };

        // this._modeSelect = React.createRef();
    }

    override componentDidMount() {
        this.props.globalState.stateManager.onSelectionChangedObservable.add(
            (options: Nullable<ISelectionChangedOptions>) => {
                const { selection } = options || {};
                if (selection instanceof GraphNode) {
                    this.setState({
                        currentNode: selection,
                        currentFrame: null,
                        currentFrameNodePort: null,
                        currentNodePort: null,
                    });
                } else if (selection instanceof GraphFrame) {
                    this.setState({
                        currentNode: null,
                        currentFrame: selection,
                        currentFrameNodePort: null,
                        currentNodePort: null,
                    });
                } else if (IsFramePortData(selection)) {
                    this.setState({
                        currentNode: null,
                        currentFrame: selection.frame,
                        currentFrameNodePort: selection.port,
                        currentNodePort: null,
                    });
                } else if (selection instanceof NodePort) {
                    this.setState({
                        currentNode: null,
                        currentFrame: null,
                        currentFrameNodePort: null,
                        currentNodePort: selection,
                    });
                } else {
                    this.setState({
                        currentNode: null,
                        currentFrame: null,
                        currentFrameNodePort: null,
                        currentNodePort: null,
                    });
                }
            }
        );

        // this._onBuiltObserver = this.props.globalState.onBuiltObservable.add(() => {
        //     this.forceUpdate();
        // });
    }

    override componentWillUnmount() {
        // this.props.globalState.onBuiltObservable.remove(this._onBuiltObserver);
    }

    processInputBlockUpdate(ib: AnyInputBlock) {
        this.props.globalState.stateManager.onUpdateRequiredObservable.notifyObservers(ib);

        // if (ib.isConstant) {
        //     this.props.globalState.stateManager.onRebuildRequiredObservable.notifyObservers(true);
        // }
    }

    async load(_file: File) {
        this.props.globalState.smartFilter = await this.props.globalState.loadSmartFilter(_file);

        this.props.globalState.stateManager.onSelectionChangedObservable.notifyObservers(null);
        this.props.globalState.onResetRequiredObservable.notifyObservers(false);
        this.props.globalState.stateManager.onRebuildRequiredObservable.notifyObservers();
    }

    loadFrame(_file: File) {
        // Tools.ReadFile(
        //     file,
        //     (data) => {
        //         // get Frame Data from file
        //         const decoder = new TextDecoder("utf-8");
        //         const frameData = JSON.parse(decoder.decode(data));
        //         SerializationTools.AddFrameToMaterial(frameData, this.props.globalState, this.props.globalState.nodeMaterial);
        //     },
        //     undefined,
        //     true
        // );
    }

    save() {
        this.props.globalState.onSaveEditorDataRequiredObservable.notifyObservers();
        this.props.globalState.saveSmartFilter();
    }

    async customSave() {
        this.setState({ uploadInProgress: true });
        try {
            this.props.globalState.onSaveEditorDataRequiredObservable.notifyObservers();
            await this.props.globalState.customSave();
        } finally {
            this.setState({ uploadInProgress: false });
        }
    }

    saveToSnippetServer() {
        // const material = this.props.globalState.nodeMaterial;
        // const xmlHttp = new XMLHttpRequest();
        // const json = SerializationTools.Serialize(material, this.props.globalState);
        // xmlHttp.onreadystatechange = () => {
        //     if (xmlHttp.readyState == 4) {
        //         if (xmlHttp.status == 200) {
        //             const snippet = JSON.parse(xmlHttp.responseText);
        //             const oldId = material.snippetId;
        //             material.snippetId = snippet.id;
        //             if (snippet.version && snippet.version != "0") {
        //                 material.snippetId += "#" + snippet.version;
        //             }
        //             this.forceUpdate();
        //             if (navigator.clipboard) {
        //                 navigator.clipboard.writeText(material.snippetId);
        //             }
        //             const windowAsAny = window as any;
        //             if (windowAsAny.Playground && oldId) {
        //                 windowAsAny.Playground.onRequestCodeChangeObservable.notifyObservers({
        //                     regex: new RegExp(oldId, "g"),
        //                     replace: material.snippetId,
        //                 });
        //             }
        //             this.props.globalState.hostDocument.defaultView!.alert(
        //                 "NodeMaterial saved with ID: " + material.snippetId + " (please note that the id was also saved to your clipboard)"
        //             );
        //         } else {
        //             this.props.globalState.hostDocument.defaultView!.alert(
        //                 `Unable to save your node material. It may be too large (${(dataToSend.payload.length / 1024).toFixed(
        //                     2
        //                 )} KB) because of embedded textures. Please reduce texture sizes or point to a specific url instead of embedding them and try again.`
        //             );
        //         }
        //     }
        // };
        // xmlHttp.open("POST", NodeMaterial.SnippetUrl + (material.snippetId ? "/" + material.snippetId : ""), true);
        // xmlHttp.setRequestHeader("Content-Type", "application/json");
        // const dataToSend = {
        //     payload: JSON.stringify({
        //         nodeMaterial: json,
        //     }),
        //     name: "",
        //     description: "",
        //     tags: "",
        // };
        // xmlHttp.send(JSON.stringify(dataToSend));
    }

    loadFromSnippet() {
        // const material = this.props.globalState.nodeMaterial;
        // const scene = material.getScene();
        // const snippedId = this.props.globalState.hostDocument.defaultView!.prompt("Please enter the snippet ID to use");
        // if (!snippedId) {
        //     return;
        // }
        // this.props.globalState.stateManager.onSelectionChangedObservable.notifyObservers(null);
        // NodeMaterial.ParseFromSnippetAsync(snippedId, scene, "", material)
        //     .then(() => {
        //         material.build();
        //         if (!this.changeMode(this.props.globalState.nodeMaterial!.mode, true, false)) {
        //             this.props.globalState.onResetRequiredObservable.notifyObservers(true);
        //         }
        //     })
        //     .catch((err) => {
        //         this.props.globalState.hostDocument.defaultView!.alert("Unable to load your node material: " + err);
        //     });
    }

    override render() {
        if (this.state.currentNode) {
            return (
                <div id="propertyTab">
                    <div id="header">
                        <img
                            id="logo"
                            src="https://www.babylonjs.com/Assets/logo-babylonjs-social-twitter.png"
                            alt="Babylon Logo"
                        />
                        <div id="title">SMART FILTER EDITOR</div>
                    </div>
                    {this.state.currentNode?.renderProperties() || this.state.currentNodePort?.node.renderProperties()}
                </div>
            );
        }

        // if (this.state.currentFrameNodePort && this.state.currentFrame) {
        //     return (
        //         <FrameNodePortPropertyTabComponent
        //             globalState={this.props.globalState}
        //             stateManager={this.props.globalState.stateManager}
        //             frame={this.state.currentFrame}
        //             frameNodePort={this.state.currentFrameNodePort}
        //         />
        //     );
        // }

        // if (this.state.currentNodePort) {
        //     return <NodePortPropertyTabComponent stateManager={this.props.globalState.stateManager} nodePort={this.state.currentNodePort} />;
        // }

        // if (this.state.currentFrame) {
        //     return <FramePropertyTabComponent globalState={this.props.globalState} frame={this.state.currentFrame} />;
        // }

        const gridSize = DataStorage.ReadNumber("GridSize", 20);

        return (
            <div id="propertyTab">
                <div id="header">
                    <img
                        id="logo"
                        src="https://www.babylonjs.com/Assets/logo-babylonjs-social-twitter.png"
                        alt="Babylon Logo"
                    />
                    <div id="title">SMART FILTER EDITOR</div>
                </div>
                <div>
                    <LineContainerComponent title="GENERAL">
                        <TextLineComponent label="Version" value={ThinEngine.Version} />
                        <TextLineComponent
                            label="Help"
                            value="doc.babylonjs.com"
                            underline={true}
                            onLink={() =>
                                this.props.globalState.hostDocument.defaultView!.open(
                                    "https://doc.babylonjs.com/how_to/node_material",
                                    "_blank"
                                )
                            }
                        />
                        <TextInputLineComponent
                            label="Comment"
                            multilines={true}
                            lockObject={this.props.globalState.lockObject}
                            value={this.props.globalState.smartFilter!.comments ?? ""}
                            target={this.props.globalState.smartFilter}
                            propertyName="comments"
                        />
                    </LineContainerComponent>
                    <LineContainerComponent title="UI">
                        <ButtonLineComponent
                            label="Zoom to fit"
                            onClick={() => {
                                this.props.globalState.onZoomToFitRequiredObservable.notifyObservers();
                            }}
                        />
                        <ButtonLineComponent
                            label="Reorganize"
                            onClick={() => {
                                this.props.globalState.onReOrganizedRequiredObservable.notifyObservers();
                            }}
                        />
                    </LineContainerComponent>
                    <LineContainerComponent title="OPTIONS">
                        {/* <CheckBoxLineComponent
                            label="Embed textures when saving"
                            isSelected={() => DataStorage.ReadBoolean("EmbedTextures", true)}
                            onSelect={(value: boolean) => {
                                DataStorage.WriteBoolean("EmbedTextures", value);
                            }}
                        /> */}
                        <SliderLineComponent
                            lockObject={this.props.lockObject}
                            label="Grid size"
                            minimum={0}
                            maximum={100}
                            step={5}
                            decimalCount={0}
                            directValue={gridSize}
                            onChange={(value) => {
                                DataStorage.WriteNumber("GridSize", value);
                                this.props.globalState.stateManager.onGridSizeChanged.notifyObservers();
                                this.forceUpdate();
                            }}
                        />
                        <CheckBoxLineComponent
                            label="Show grid"
                            isSelected={() => DataStorage.ReadBoolean("ShowGrid", true)}
                            onSelect={(value: boolean) => {
                                DataStorage.WriteBoolean("ShowGrid", value);
                                this.props.globalState.stateManager.onGridSizeChanged.notifyObservers();
                            }}
                        />
                    </LineContainerComponent>
                    <LineContainerComponent title="FILE">
                        <FileButtonLineComponent label="Load" onClick={(file) => this.load(file)} accept=".json" />
                        <ButtonLineComponent
                            label="Save"
                            onClick={() => {
                                this.save();
                            }}
                        />
                        <ButtonLineComponent
                            label="Save to unique URL"
                            isDisabled={this.state.uploadInProgress}
                            onClick={() => {
                                this.customSave();
                            }}
                        />
                    </LineContainerComponent>
                    {/* <LineContainerComponent title="FILE">
                        <FileButtonLineComponent label="Load" onClick={(file) => this.load(file)} accept=".json" />
                        <ButtonLineComponent
                            label="Save"
                            onClick={() => {
                                this.save();
                            }}
                        />
                        <ButtonLineComponent
                            label="Generate code"
                            onClick={() => {
                                StringTools.DownloadAsFile(this.props.globalState.hostDocument, this.props.globalState.nodeMaterial!.generateCode(), "code.txt");
                            }}
                        />
                        <ButtonLineComponent
                            label="Export shaders"
                            onClick={() => {
                                this.props.globalState.nodeMaterial.build();
                                StringTools.DownloadAsFile(this.props.globalState.hostDocument, this.props.globalState.nodeMaterial!.compiledShaders, "shaders.txt");
                            }}
                        />
                        {this.props.globalState.customSave && (
                            <ButtonLineComponent
                                label={this.props.globalState.customSave!.label}
                                isDisabled={this.state.uploadInProgress}
                                onClick={() => {
                                    this.customSave();
                                }}
                            />
                        )}
                        <FileButtonLineComponent label="Load Frame" uploadName={"frame-upload"} onClick={(file) => this.loadFrame(file)} accept=".json" />
                    </LineContainerComponent>
                    {!this.props.globalState.customSave && (
                        <LineContainerComponent title="SNIPPET">
                            {this.props.globalState.nodeMaterial!.snippetId && <TextLineComponent label="Snippet ID" value={this.props.globalState.nodeMaterial!.snippetId} />}
                            <ButtonLineComponent label="Load from snippet server" onClick={() => this.loadFromSnippet()} />
                            <ButtonLineComponent
                                label="Save to snippet server"
                                onClick={() => {
                                    this.saveToSnippetServer();
                                }}
                            />
                        </LineContainerComponent>
                    )}
                    <LineContainerComponent title="TRANSPARENCY">
                        <CheckBoxLineComponent
                            label="Force alpha blending"
                            target={this.props.globalState.nodeMaterial}
                            propertyName="forceAlphaBlending"
                            onValueChanged={() => this.props.globalState.stateManager.onUpdateRequiredObservable.notifyObservers(null)}
                        />
                        <OptionsLineComponent
                            label="Alpha mode"
                            options={alphaModeOptions}
                            target={this.props.globalState.nodeMaterial}
                            propertyName="alphaMode"
                            onSelect={() => this.props.globalState.stateManager.onUpdateRequiredObservable.notifyObservers(null)}
                        />
                    </LineContainerComponent> */}
                    <InputsPropertyTabComponent
                        lockObject={this.props.lockObject}
                        globalState={this.props.globalState}
                        inputs={BlockTools.GetInputBlocks(this.props.globalState.smartFilter)}
                    ></InputsPropertyTabComponent>
                </div>
            </div>
        );
    }
}
