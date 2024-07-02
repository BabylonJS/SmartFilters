import * as react from "react";
import { FloatLineComponent } from "@babylonjs/shared-ui-components/lines/floatLineComponent.js";
import type { GlobalState } from "../../../globalState";
import type { InputBlock } from "@babylonjs/core/Materials/Node/Blocks/Input/inputBlock";

interface IFloatPropertyTabComponentProps {
    globalState: GlobalState;
    inputBlock: InputBlock;
}

export class FloatPropertyTabComponent extends react.Component<IFloatPropertyTabComponentProps> {
    override render() {
        return (
            <FloatLineComponent
                lockObject={this.props.globalState.lockObject}
                label="Value"
                target={this.props.inputBlock}
                propertyName="value"
                onChange={() => {
                    if (this.props.inputBlock.isConstant) {
                        this.props.globalState.stateManager.onRebuildRequiredObservable.notifyObservers();
                    }
                    this.props.globalState.stateManager.onUpdateRequiredObservable.notifyObservers(this.props.inputBlock);
                }}
            ></FloatLineComponent>
        );
    }
}
