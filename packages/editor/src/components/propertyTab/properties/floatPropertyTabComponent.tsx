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
    useSlider: boolean;
};

/**
 * The property tab component for InputBlock of type ConnectionPointType.Float.
 * If the animation type is time, display the value and valueDeltaPerMs properties w/o slider.
 * Otherwise, display min, max, and value properties with slider capability.
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

        this.state = { useSlider: this.canUseSlider() };
    }

    override componentDidUpdate(prevProps: FloatPropertyTabComponentProps) {
        if (prevProps.inputBlock !== this.props.inputBlock) {
            this._editorData = getFloatInputBlockEditorData(this.props.inputBlock);
            this.setState({ useSlider: this.canUseSlider() });
        }
    }

    canUseSlider() {
        return this._editorData.min! < this._editorData.max!;
    }

    processSliderChange() {
        const useSlider = this.canUseSlider();

        // Clamp float value to min/max if necessary
        if (useSlider) {
            this.props.inputBlock.runtimeValue.value = Math.max(
                this._editorData.min!,
                Math.min(this._editorData.max!, this.props.inputBlock.runtimeValue.value)
            );
        }

        this.setState({ useSlider: useSlider });
        this.props.stateManager.onUpdateRequiredObservable.notifyObservers(this.props.inputBlock);
    }

    /**
     * If the animation type is time, display the value and valueDeltaPerMs properties w/o slider.
     * Otherwise, display min, max, and value properties with slider capability.
     */
    override render() {
        return this.props.inputBlock.editorData?.animationType === "time" ? (
            <>
                <FloatLineComponent
                    lockObject={this.props.stateManager.lockObject}
                    label="Value"
                    target={this.props.inputBlock.runtimeValue}
                    propertyName="value"
                    onChange={() => {
                        this.forceUpdate();
                        this.props.stateManager.onUpdateRequiredObservable.notifyObservers(this.props.inputBlock);
                    }}
                ></FloatLineComponent>
                <FloatLineComponent
                    lockObject={this.props.stateManager.lockObject}
                    key={this.props.inputBlock.uniqueId}
                    label="valueDeltaPerMs"
                    target={this.props.inputBlock.editorData}
                    propertyName="valueDeltaPerMs"
                    onChange={() => {
                        this.forceUpdate();
                        this.props.stateManager.onUpdateRequiredObservable.notifyObservers(this.props.inputBlock);
                    }}
                ></FloatLineComponent>
            </>
        ) : (
            <>
                <FloatLineComponent
                    lockObject={this.props.stateManager.lockObject}
                    label="Min"
                    target={this._editorData}
                    propertyName="min"
                    onChange={() => {
                        this.processSliderChange();
                    }}
                ></FloatLineComponent>
                <FloatLineComponent
                    lockObject={this.props.stateManager.lockObject}
                    label="Max"
                    target={this._editorData}
                    propertyName="max"
                    onChange={() => {
                        this.processSliderChange();
                    }}
                ></FloatLineComponent>
                {this.state.useSlider && (
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
                {!this.state.useSlider && (
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
