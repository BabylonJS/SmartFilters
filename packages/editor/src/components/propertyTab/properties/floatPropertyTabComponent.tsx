import { Component } from "react";
import type { ConnectionPointType, InputBlock } from "@babylonjs/smart-filters";
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
    constructor(props: FloatPropertyTabComponentProps) {
        super(props);

        // Initialize editor data
        getFloatInputBlockEditorData(props.inputBlock);

        // Check whether to show time data. If not, check whether to show slider data.
        const useTime = props.inputBlock.editorData!.animationType === "time";
        const showSlider = !useTime && this.isMinMaxValid();
        this.state = {
            useTime: useTime,
            showSlider: showSlider,
        };
    }

    isMinMaxValid() {
        return this.props.inputBlock.editorData!.min! < this.props.inputBlock.editorData!.max!;
    }

    processEditorDataChange() {
        const useTime = this.props.inputBlock.editorData!.animationType === "time";
        const showSlider = !useTime && this.isMinMaxValid();
        this.setState({
            useTime: useTime,
            showSlider: showSlider,
        });

        // If slider will be used, clamp the value to min/max
        if (showSlider) {
            this.props.inputBlock.runtimeValue.value = Math.max(
                this.props.inputBlock.editorData!.min!,
                Math.min(this.props.inputBlock.editorData!.max!, this.props.inputBlock.runtimeValue.value)
            );
        }
        this.props.stateManager.onUpdateRequiredObservable.notifyObservers(this.props.inputBlock);
    }

    override componentDidUpdate(prevProps: FloatPropertyTabComponentProps) {
        if (prevProps.inputBlock !== this.props.inputBlock) {
            getFloatInputBlockEditorData(this.props.inputBlock);
            this.processEditorDataChange();
        }
    }

    override render() {
        return (
            <>
                {/* Min and max values */}
                {!this.state.useTime && (
                    <FloatLineComponent
                        lockObject={this.props.stateManager.lockObject}
                        label="Min"
                        target={this.props.inputBlock.editorData}
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
                        target={this.props.inputBlock.editorData}
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
                        step={
                            Math.abs(this.props.inputBlock.editorData!.max! - this.props.inputBlock.editorData!.min!) /
                            100.0
                        }
                        minimum={this.props.inputBlock.editorData!.min!}
                        maximum={this.props.inputBlock.editorData!.max!}
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
