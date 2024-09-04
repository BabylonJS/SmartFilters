import { Component } from "react";
import type { ConnectionPointType, InputBlock, InputBlockEditorData } from "@babylonjs/smart-filters";
import type { IPropertyComponentProps } from "@babylonjs/shared-ui-components/nodeGraphSystem/interfaces/propertyComponentProps.js";
import { FloatLineComponent } from "@babylonjs/shared-ui-components/lines/floatLineComponent.js";
import { SliderLineComponent } from "@babylonjs/shared-ui-components/lines/sliderLineComponent.js";
import { getFloatInputBlockEditorData } from "../../../graphSystem/getEditorData.js";

export interface FloatPropertyTabComponentProps extends IPropertyComponentProps {
    inputBlock: InputBlock<ConnectionPointType.Float>;
}

type FloatPropertyTabComponentState = {
    useTime: boolean;
    showSlider: boolean;
};

/**
 * The property tab component for InputBlock of type ConnectionPointType.Float.
 * If the animation type is time, display the value and valueDeltaPerMs properties
 * plainly-- no slider capability. Otherwise, display the value alongside
 * optional min and max properties that, when set, toggle a slider for the value.
 */
export class FloatPropertyTabComponent extends Component<
    FloatPropertyTabComponentProps,
    FloatPropertyTabComponentState
> {
    private _editorData: InputBlockEditorData<ConnectionPointType.Float>;

    constructor(props: FloatPropertyTabComponentProps) {
        super(props);

        // Initialize editor data and store as reference
        this._editorData = getFloatInputBlockEditorData(props.inputBlock);

        const useTime = this._editorData.animationType === "time";
        const showSlider = !useTime && this.isMinMaxValid();
        this.setState({
            useTime: useTime,
            showSlider: showSlider,
        });
    }

    override componentDidUpdate(prevProps: FloatPropertyTabComponentProps) {
        if (prevProps.inputBlock !== this.props.inputBlock) {
            this._editorData = getFloatInputBlockEditorData(this.props.inputBlock);
            this.processEditorDataChange();
        }
    }

    isMinMaxValid() {
        return this._editorData.min! < this._editorData.max!;
    }

    processEditorDataChange() {
        // Check whether to show time data. If not, check whether to show slider data.
        const useTime = this._editorData.animationType === "time";
        const showSlider = !useTime && this.isMinMaxValid();

        // If slider will be used, clamp the value to min/max
        if (showSlider) {
            this.props.inputBlock.runtimeValue.value = Math.max(
                this._editorData.min!,
                Math.min(this._editorData.max!, this.props.inputBlock.runtimeValue.value)
            );
        }

        this.setState({
            useTime: useTime,
            showSlider: showSlider,
        });
        this.props.stateManager.onUpdateRequiredObservable.notifyObservers(this.props.inputBlock);
    }

    override render() {
        return (
            <>
                {/* Min and max values */}
                {!this.state.useTime && (
                    <FloatLineComponent
                        lockObject={this.props.stateManager.lockObject}
                        label="Min"
                        target={this._editorData}
                        propertyName="min"
                        onChange={() => {
                            this.processEditorDataChange();
                        }}
                    ></FloatLineComponent>
                )}
                {!this.state.useTime && (
                    <FloatLineComponent
                        lockObject={this.props.stateManager.lockObject}
                        label="Max"
                        target={this._editorData}
                        propertyName="max"
                        onChange={() => {
                            this.processEditorDataChange();
                        }}
                    ></FloatLineComponent>
                )}
                {/* Value */}
                {!this.state.showSlider && (
                    <FloatLineComponent
                        lockObject={this.props.stateManager.lockObject}
                        label="Value"
                        target={this.props.inputBlock.runtimeValue}
                        propertyName="value"
                        onChange={() => {
                            this.props.stateManager.onUpdateRequiredObservable.notifyObservers(this.props.inputBlock);
                        }}
                    ></FloatLineComponent>
                )}
                {this.state.showSlider && (
                    <SliderLineComponent
                        lockObject={this.props.stateManager.lockObject}
                        label="Value"
                        target={this.props.inputBlock.runtimeValue}
                        propertyName="value"
                        step={Math.abs(this._editorData.max! - this._editorData.min!) / 100.0}
                        minimum={this._editorData.min!}
                        maximum={this._editorData.max!}
                        onChange={() => {
                            this.props.stateManager.onUpdateRequiredObservable.notifyObservers(this.props.inputBlock);
                        }}
                    ></SliderLineComponent>
                )}
                {/* Time values */}
                {this.state.useTime && (
                    <FloatLineComponent
                        lockObject={this.props.stateManager.lockObject}
                        key={this.props.inputBlock.uniqueId}
                        label="valueDeltaPerMs"
                        target={this.props.inputBlock.editorData}
                        propertyName="valueDeltaPerMs"
                        onChange={() => {
                            this.props.stateManager.onUpdateRequiredObservable.notifyObservers(this.props.inputBlock);
                        }}
                    ></FloatLineComponent>
                )}
            </>
        );
    }
}
