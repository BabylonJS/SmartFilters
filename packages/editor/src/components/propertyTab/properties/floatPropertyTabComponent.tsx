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
        this.processEditorData(true);
    }

    processEditorData(initializeState: boolean = false) {
        // Initialize state data
        const editorData = getFloatInputBlockEditorData(this.props.inputBlock);
        const state = {
            useTime: editorData.animationType === "time",
            showSlider: false,
        };

        // Use the slider if min/max exist, make up a range, and we are not using time
        if (!state.useTime && editorData.min !== null && editorData.max !== null && editorData.min < editorData.max) {
            state.showSlider = true;

            // Also clamp the value to be within range
            this.props.inputBlock.runtimeValue.value = Math.max(
                editorData.min,
                Math.min(editorData.max, this.props.inputBlock.runtimeValue.value)
            );
        }

        if (initializeState) {
            this.state = state;
            return;
        }

        this.setState(state);
        this.props.stateManager.onUpdateRequiredObservable.notifyObservers(this.props.inputBlock);
    }

    override componentDidUpdate(prevProps: FloatPropertyTabComponentProps) {
        if (prevProps.inputBlock !== this.props.inputBlock) {
            this.processEditorData();
        }
    }

    override render() {
        const editorData = getFloatInputBlockEditorData(this.props.inputBlock);
        return (
            <>
                {/* Min and max values */}
                {!this.state.useTime && (
                    <FloatLineComponent
                        lockObject={this.props.stateManager.lockObject}
                        label="Min"
                        target={editorData}
                        propertyName="min"
                        onChange={() => {
                            // Ensure other value gets set
                            editorData.max = editorData.max ?? 0;
                            this.processEditorData();
                        }}
                    ></FloatLineComponent>
                )}
                {!this.state.useTime && (
                    <FloatLineComponent
                        lockObject={this.props.stateManager.lockObject}
                        label="Max"
                        target={editorData}
                        propertyName="max"
                        onChange={() => {
                            // Ensure other value gets set
                            editorData.min = editorData.min ?? 0;
                            this.processEditorData();
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
                        step={Math.abs(editorData.max! - editorData.min!) / 100.0}
                        minimum={editorData.min!}
                        maximum={editorData.max!}
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
                        target={editorData}
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
