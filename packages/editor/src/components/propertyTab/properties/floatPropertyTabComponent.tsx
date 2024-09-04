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
    showSlider: boolean;
};

/**
 * The property tab component for InputBlock of type ConnectionPointType.Float.
 * This component displays the min, max, and value properties for the float input block.
 * If the min and max values create a valid range, it displays a slider for the value;
 * otherwise, a regular text input.
 */
export class FloatPropertyTabComponent extends Component<
    FloatPropertyTabComponentProps,
    FloatPropertyTabComponentState
> {
    constructor(props: FloatPropertyTabComponentProps) {
        super(props);

        const editorData = getFloatInputBlockEditorData(props.inputBlock);
        this.state = {
            showSlider: this.canDisplaySlider(editorData),
        };
    }

    /**
     * Determines whether the slider can be displayed.
     * It should only display if the min and max make a valid range.
     */
    canDisplaySlider(editorData: InputBlockEditorData<ConnectionPointType.Float>) {
        return editorData.min! < editorData.max!;
    }

    override render() {
        const editorData = getFloatInputBlockEditorData(this.props.inputBlock);
        return (
            <>
                <FloatLineComponent
                    lockObject={this.props.stateManager.lockObject}
                    label="Min"
                    target={editorData}
                    propertyName="min"
                    onChange={() => {
                        // Clamp value up to min if needed
                        if (this.props.inputBlock.runtimeValue.value < editorData.min!) {
                            this.props.inputBlock.runtimeValue.value = editorData.min!;
                        }
                        this.setState({ showSlider: this.canDisplaySlider(editorData) });
                        this.props.stateManager.onUpdateRequiredObservable.notifyObservers(this.props.inputBlock);
                    }}
                ></FloatLineComponent>
                <FloatLineComponent
                    lockObject={this.props.stateManager.lockObject}
                    label="Max"
                    target={editorData}
                    propertyName="max"
                    onChange={() => {
                        // Clamp value to new maximum
                        if (this.props.inputBlock.runtimeValue.value > editorData.max!) {
                            this.props.inputBlock.runtimeValue.value = editorData.max!;
                        }
                        this.setState({ showSlider: this.canDisplaySlider(editorData) });
                        this.props.stateManager.onUpdateRequiredObservable.notifyObservers(this.props.inputBlock);
                    }}
                ></FloatLineComponent>
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
            </>
        );
    }
}
