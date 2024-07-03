import * as react from "react";
import type { GlobalState } from "../../../globalState";
import { Color3LineComponent } from "@babylonjs/shared-ui-components/lines/color3LineComponent.js";
import type { LockObject } from "@babylonjs/shared-ui-components/tabs/propertyGrids/lockObject";
import type { ConnectionPointType, InputBlock } from "@babylonjs/smart-filters";
import { Color3 } from "@babylonjs/core/Maths/math.color.js";

interface IColor3PropertyTabComponentProps {
    globalState: GlobalState;
    inputBlock: InputBlock<ConnectionPointType.Color3>;
    lockObject: LockObject;
}

export class Color3PropertyTabComponent extends react.Component<IColor3PropertyTabComponentProps> {
    override render() {
        const target = this.props.inputBlock.runtimeValue.value;
        const foo = {
            color: new Color3(target.r, target.g, target.b),
        };
        return (
            <Color3LineComponent
                lockObject={this.props.lockObject}
                label="Value"
                target={foo}
                propertyName="color"
                onChange={() => {
                    target.r = foo.color.r;
                    target.g = foo.color.g;
                    target.b = foo.color.b;
                    this.props.globalState.stateManager.onUpdateRequiredObservable.notifyObservers(
                        this.props.inputBlock
                    );
                }}
            ></Color3LineComponent>
        );
    }
}
