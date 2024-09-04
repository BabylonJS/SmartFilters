import * as react from "react";
import type { GlobalState } from "../../globalState";
import { LineContainerComponent } from "../../sharedComponents/lineContainerComponent.js";
import { GeneralPropertyTabComponent } from "./genericNodePropertyComponent.js";
import type { IPropertyComponentProps } from "@babylonjs/shared-ui-components/nodeGraphSystem/interfaces/propertyComponentProps";
import { OptionsLine } from "@babylonjs/shared-ui-components/lines/optionsLineComponent.js";
import type { IInspectableOptions } from "@babylonjs/core/Misc/iInspectable.js";
import { ConnectionPointType, type InputBlock, type AnyInputBlock } from "@babylonjs/smart-filters";
import { Color3PropertyTabComponent } from "../../components/propertyTab/properties/color3PropertyTabComponent.js";
import { ImageSourcePropertyTabComponent } from "./imageSourcePropertyTabComponent.js";
import { FloatPropertyTabComponent } from "../../components/propertyTab/properties/floatPropertyTabComponent.js";

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

export class InputPropertyTabComponent extends react.Component<IPropertyComponentProps> {
    // private _onValueChangedObserver: Nullable<Observer<AnyInputBlock>> = null;
    constructor(props: IPropertyComponentProps) {
        super(props);

        this.state = {
            webCamSourceOptions: [],
        };
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

    renderValue(globalState: GlobalState) {
        const inputBlock = this.props.nodeData.data as AnyInputBlock;

        // See if the app provided a custom property component for this block
        const customPropertyComponent = globalState.blockRegistration.getInputNodePropertyComponent(
            inputBlock,
            globalState
        );
        if (customPropertyComponent) {
            return (
                <div>
                    <GeneralPropertyTabComponent
                        stateManager={this.props.stateManager}
                        nodeData={this.props.nodeData}
                    />
                    <LineContainerComponent title="PROPERTIES">{customPropertyComponent}</LineContainerComponent>
                </div>
            );
        }

        // Use the default property component
        switch (inputBlock.type) {
            case ConnectionPointType.Boolean: {
                const dummyTarget = {
                    value: true,
                };
                return (
                    <OptionsLine
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
                        inputBlock={inputBlock}
                        nodeData={this.props.nodeData}
                        stateManager={this.props.stateManager}
                    />
                );
            }
            case ConnectionPointType.Texture:
                {
                    return (
                        <ImageSourcePropertyTabComponent
                            inputBlock={inputBlock as InputBlock<ConnectionPointType.Texture>}
                            nodeData={this.props.nodeData}
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
                            lockObject={globalState.lockObject}
                            globalState={globalState}
                            inputBlock={inputBlock}
                        />
                        {/* <CheckBoxLineComponent
                            label="Convert to gamma space"
                            propertyName="convertToGammaSpace"
                            target={inputBlock}
                            onValueChanged={() => {
                                this.props.stateManager.onUpdateRequiredObservable.notifyObservers(inputBlock);
                            }}
                        />
                        <CheckBoxLineComponent
                            label="Convert to linear space"
                            propertyName="convertToLinearSpace"
                            target={inputBlock}
                            onValueChanged={() => {
                                this.props.stateManager.onUpdateRequiredObservable.notifyObservers(inputBlock);
                            }}
                        /> */}
                    </>
                );
            // case NodeMaterialBlockConnectionPointTypes.Color4:
            //     return (
            //         <>
            //             <Color4PropertyTabComponent lockObject={globalState.lockObject} globalState={globalState} inputBlock={inputBlock} />
            //             <CheckBoxLineComponent
            //                 label="Convert to gamma space"
            //                 propertyName="convertToGammaSpace"
            //                 target={inputBlock}
            //                 onValueChanged={() => {
            //                     this.props.stateManager.onUpdateRequiredObservable.notifyObservers(inputBlock);
            //                 }}
            //             />
            //             <CheckBoxLineComponent
            //                 label="Convert to linear space"
            //                 propertyName="convertToLinearSpace"
            //                 target={inputBlock}
            //                 onValueChanged={() => {
            //                     this.props.stateManager.onUpdateRequiredObservable.notifyObservers(inputBlock);
            //                 }}
            //             />
            //         </>
            //     );
            // case NodeMaterialBlockConnectionPointTypes.Vector3:
            //     return <Vector3PropertyTabComponent lockObject={globalState.lockObject} globalState={globalState} inputBlock={inputBlock} />;
            // case NodeMaterialBlockConnectionPointTypes.Vector4:
            //     return <Vector4PropertyTabComponent lockObject={globalState.lockObject} globalState={globalState} inputBlock={inputBlock} />;
            // case NodeMaterialBlockConnectionPointTypes.Matrix:
            //     return <MatrixPropertyTabComponent lockObject={globalState.lockObject} globalState={globalState} inputBlock={inputBlock} />;
        }

        return null;
    }

    setDefaultValue() {
        // const inputBlock = this.props.nodeData.data as InputBlock;
        // inputBlock.setDefaultValue();
    }

    override render() {
        return (
            <div>
                <GeneralPropertyTabComponent stateManager={this.props.stateManager} nodeData={this.props.nodeData} />
                <LineContainerComponent title="PROPERTIES">
                    {this.renderValue(this.props.stateManager.data as GlobalState)}
                </LineContainerComponent>
            </div>
        );
    }
}
