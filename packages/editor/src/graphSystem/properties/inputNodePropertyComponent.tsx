import * as react from "react";
import { LineContainerComponent } from "../../sharedComponents/lineContainerComponent.js";
import { GeneralPropertyTabComponent, GenericPropertyComponent } from "./genericNodePropertyComponent.js";
import type { IPropertyComponentProps } from "@babylonjs/shared-ui-components/nodeGraphSystem/interfaces/propertyComponentProps";
import { OptionsLine } from "@babylonjs/shared-ui-components/lines/optionsLineComponent.js";
import type { IInspectableOptions } from "@babylonjs/core/Misc/iInspectable.js";
import { ConnectionPointType, type AnyInputBlock } from "@babylonjs/smart-filters";
import { Color3PropertyTabComponent } from "../../components/propertyTab/properties/color3PropertyTabComponent.js";
import { Color4PropertyTabComponent } from "../../components/propertyTab/properties/color4PropertyTabComponent.js";
import { ImageSourcePropertyTabComponent } from "../../components/propertyTab/properties/imageSourcePropertyTabComponent.js";
import { FloatPropertyTabComponent } from "../../components/propertyTab/properties/floatPropertyTabComponent.js";
import type { StateManager } from "@babylonjs/shared-ui-components/nodeGraphSystem/stateManager";
import { Vector2PropertyTabComponent } from "../../components/propertyTab/properties/vector2PropertyTabComponent.js";
import { TextInputLineComponent } from "../../sharedComponents/textInputLineComponent.js";

const booleanOptions: IInspectableOptions[] = [
    {
        label: "True",
        value: 1,
    },
    {
        label: "False",
        value: 0,
    },
];

export class InputPropertyComponent extends react.Component<IPropertyComponentProps> {
    constructor(props: IPropertyComponentProps) {
        super(props);
    }

    override render() {
        // If this InputBlock has our reserved _propStore, it means it uses @editableProperty to define its properties
        // So we will assume that the developer of that InputBlock intends to use the GenericPropertyComponent
        if (this.props.nodeData.data._propStore) {
            return <GenericPropertyComponent stateManager={this.props.stateManager} nodeData={this.props.nodeData} />;
        }

        const appMetadataTarget = {
            metadata: this.props.nodeData.data.appMetadata ? JSON.stringify(this.props.nodeData.data.appMetadata) : "",
        };

        return (
            <div>
                <GeneralPropertyTabComponent stateManager={this.props.stateManager} nodeData={this.props.nodeData} />
                <LineContainerComponent title="PROPERTIES">
                    <InputPropertyTabComponent
                        stateManager={this.props.stateManager}
                        inputBlock={this.props.nodeData.data}
                    ></InputPropertyTabComponent>
                </LineContainerComponent>
                <LineContainerComponent title="APP METADATA">
                    <div id="appMetadata">
                        <TextInputLineComponent
                            lockObject={this.props.stateManager.lockObject}
                            label="appMetadata"
                            allowEditingDuringFailedValidation={true}
                            multilines={true}
                            target={appMetadataTarget}
                            propertyName="metadata"
                            validator={(value: string) => {
                                try {
                                    JSON.parse(value);
                                    return true;
                                } catch (e) {
                                    return false;
                                }
                            }}
                            onChange={() => {
                                try {
                                    const objectData = appMetadataTarget.metadata
                                        ? JSON.parse(appMetadataTarget.metadata)
                                        : null;
                                    this.props.nodeData.data.appMetadata = objectData;
                                    this.props.stateManager.onUpdateRequiredObservable.notifyObservers(
                                        this.props.nodeData.data
                                    );
                                } catch (e) {
                                    this.props.stateManager.onErrorMessageDialogRequiredObservable.notifyObservers(
                                        "Invalid JSON"
                                    );
                                }
                            }}
                        ></TextInputLineComponent>
                    </div>
                </LineContainerComponent>
            </div>
        );
    }
}

export type InputPropertyComponentProps = {
    stateManager: StateManager;
    inputBlock: AnyInputBlock;
};

/**
 * Given an input block, returns the appropriate property component for the block's type
 */
export class InputPropertyTabComponent extends react.Component<InputPropertyComponentProps> {
    // private _onValueChangedObserver: Nullable<Observer<AnyInputBlock>> = null;
    constructor(props: InputPropertyComponentProps) {
        super(props);
    }

    override componentDidMount() {
        // const inputBlock = this.props.nodeData.data as AnyInputBlock;
        // this._onValueChangedObserver = inputBlock.onValueChangedObservable.add(() => {
        //     this.forceUpdate();
        //     this.props.stateManager.onUpdateRequiredObservable.notifyObservers(inputBlock);
        // });
    }

    override componentWillUnmount() {
        // const inputBlock = this.props.nodeData.data as AnyInputBlock;
        // if (this._onValueChangedObserver) {
        //     inputBlock.onValueChangedObservable.remove(this._onValueChangedObserver);
        //     this._onValueChangedObserver = null;
        // }
    }

    setDefaultValue() {
        // const inputBlock = this.props.nodeData.data as InputBlock;
        // inputBlock.setDefaultValue();
    }

    override render() {
        const inputBlock = this.props.inputBlock;

        // Use the default property component
        switch (inputBlock.type) {
            case ConnectionPointType.Boolean: {
                const dummyTarget = {
                    value: true,
                };
                return (
                    <OptionsLine
                        key={inputBlock.uniqueId}
                        label="Value"
                        target={dummyTarget}
                        propertyName="value"
                        options={booleanOptions}
                        noDirectUpdate
                        extractValue={() => {
                            return inputBlock.runtimeValue.value ? 1 : 0;
                        }}
                        onSelect={(newSelectionValue: string | number) => {
                            inputBlock.runtimeValue.value = newSelectionValue === 1;
                            this.props.stateManager.onUpdateRequiredObservable.notifyObservers(inputBlock);
                        }}
                    ></OptionsLine>
                );
            }
            case ConnectionPointType.Float: {
                return (
                    <FloatPropertyTabComponent
                        key={inputBlock.uniqueId}
                        inputBlock={inputBlock}
                        stateManager={this.props.stateManager}
                    />
                );
            }
            case ConnectionPointType.Texture:
                {
                    return (
                        <ImageSourcePropertyTabComponent
                            key={inputBlock.uniqueId}
                            inputBlock={inputBlock}
                            stateManager={this.props.stateManager}
                        />
                    );
                }
                break;
            // case NodeMaterialBlockConnectionPointTypes.Vector2:
            //     return <Vector2PropertyTabComponent lockObject={globalState.lockObject} globalState={globalState} inputBlock={inputBlock} />;
            case ConnectionPointType.Color3:
                return (
                    <>
                        <Color3PropertyTabComponent
                            key={inputBlock.uniqueId}
                            stateManager={this.props.stateManager}
                            inputBlock={inputBlock}
                        />
                    </>
                );
            case ConnectionPointType.Color4:
                return (
                    <>
                        <Color4PropertyTabComponent
                            key={inputBlock.uniqueId}
                            stateManager={this.props.stateManager}
                            inputBlock={inputBlock}
                        />
                    </>
                );
            // case NodeMaterialBlockConnectionPointTypes.Vector3:
            //     return <Vector3PropertyTabComponent lockObject={globalState.lockObject} globalState={globalState} inputBlock={inputBlock} />;
            // case NodeMaterialBlockConnectionPointTypes.Vector4:
            //     return <Vector4PropertyTabComponent lockObject={globalState.lockObject} globalState={globalState} inputBlock={inputBlock} />;
            // case NodeMaterialBlockConnectionPointTypes.Matrix:
            //     return <MatrixPropertyTabComponent lockObject={globalState.lockObject} globalState={globalState} inputBlock={inputBlock} />;
            case ConnectionPointType.Vector2:
                return (
                    <Vector2PropertyTabComponent
                        key={inputBlock.uniqueId}
                        inputBlock={inputBlock}
                        lockObject={this.props.stateManager.lockObject}
                        stateManager={this.props.stateManager}
                    />
                );
        }

        return <></>;
    }
}
