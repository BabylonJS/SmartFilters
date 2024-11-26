import * as react from "react";
import type { GlobalState } from "../../globalState";

import { LineContainerComponent } from "../../sharedComponents/lineContainerComponent.js";

import "../../assets/styles/components/propertyTab.scss";
import type { LockObject } from "@babylonjs/shared-ui-components/tabs/propertyGrids/lockObject";
import { FloatSliderComponent } from "../../sharedComponents/floatSliderComponent.js";
import { ConnectionPointType } from "@babylonjs/smart-filters";
import { Color3LineComponent } from "@babylonjs/shared-ui-components/lines/color3LineComponent.js";
import { Color3 } from "@babylonjs/core/Maths/math.color.js";
import type { AnyInputBlock } from "@babylonjs/smart-filters";

interface IInputsPropertyTabComponentProps {
    globalState: GlobalState;
    inputs: AnyInputBlock[];
    lockObject: LockObject;
}

export class InputsPropertyTabComponent extends react.Component<IInputsPropertyTabComponentProps> {
    constructor(props: IInputsPropertyTabComponentProps) {
        super(props);
    }

    processInputBlockUpdate(ib: AnyInputBlock) {
        this.props.globalState.stateManager.onUpdateRequiredObservable.notifyObservers(ib);
    }

    renderInputBlock(block: AnyInputBlock) {
        switch (block.type) {
            case ConnectionPointType.Color3: {
                const target = block.runtimeValue.value;
                const dummyTarget = {
                    color: new Color3(target.r, target.g, target.b),
                };
                return (
                    <Color3LineComponent
                        lockObject={this.props.lockObject}
                        key={block.uniqueId}
                        label={block.name}
                        target={dummyTarget}
                        propertyName="color"
                        onChange={() => {
                            target.r = dummyTarget.color.r;
                            target.g = dummyTarget.color.g;
                            target.b = dummyTarget.color.b;
                            this.processInputBlockUpdate(block);
                        }}
                    ></Color3LineComponent>
                );
            }
            case ConnectionPointType.Float: {
                return (
                    <FloatSliderComponent
                        key={block.uniqueId}
                        lockObject={this.props.lockObject}
                        label={block.name}
                        target={block.runtimeValue}
                        propertyName="value"
                        min={block.editorData?.min ?? null}
                        max={block.editorData?.max ?? null}
                        onChange={() => this.processInputBlockUpdate(block)}
                    ></FloatSliderComponent>
                );
            }
        }
        return null;
    }

    override render() {
        return (
            <LineContainerComponent title="INPUTS">
                {this.props.inputs.map((ib) => {
                    if (!ib.name) {
                        return null;
                    }
                    return this.renderInputBlock(ib);
                })}
            </LineContainerComponent>
        );
    }
}
