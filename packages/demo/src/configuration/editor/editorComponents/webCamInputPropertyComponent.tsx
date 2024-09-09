import type { IInspectableOptions } from "@babylonjs/core/Misc/iInspectable";
import type { AnyInputBlock } from "@babylonjs/smart-filters";
import * as react from "react";
import { WebCamInputBlock, type WebCamSource } from "../../blocks/inputs/webCamInputBlock";
import { OptionsLine } from "@babylonjs/shared-ui-components/lines/optionsLineComponent";
import { type GlobalState } from "@babylonjs/smart-filters-editor";

export interface InputPropertyTabComponentProps {
    inputBlock: AnyInputBlock;
    globalState: GlobalState;
}

type InputPropertyTabComponentState = {
    webCamSourceOptions: IInspectableOptions[];
};

export class WebCamInputPropertyComponent extends react.Component<
    InputPropertyTabComponentProps,
    InputPropertyTabComponentState
> {
    // private _onValueChangedObserver: Nullable<Observer<AnyInputBlock>> = null;
    private _loadWebCamSourcesPromise: Promise<void> | undefined;

    constructor(props: InputPropertyTabComponentProps) {
        super(props);

        this.state = {
            webCamSourceOptions: [],
        };
    }

    override render() {
        const inputBlock = this.props.inputBlock;
        if (!this._loadWebCamSourcesPromise) {
            // Kick off lazy load of the WebCam sources
            this._loadWebCamSourcesPromise = WebCamInputBlock.EnumerateWebCamSources().then(
                (sources: WebCamSource[]) => {
                    let foundDefault = false;
                    const options = sources.map((source: WebCamSource) => {
                        if (source.id === "") {
                            foundDefault = true;
                            return {
                                label: "Default",
                                value: "",
                            };
                        }
                        return {
                            label: source.name,
                            value: source.id,
                        };
                    });
                    if (!foundDefault) {
                        options.unshift({ label: "Default", value: "" });
                    }
                    this.setState({ webCamSourceOptions: options });
                }
            );
        }
        if (this.state.webCamSourceOptions.length === 0) {
            return <></>;
        } else {
            const webCamInputBlock = inputBlock as WebCamInputBlock;
            this.props.globalState.stateManager.onUpdateRequiredObservable.notifyObservers(inputBlock);
            return (
                <OptionsLine
                    label="Source"
                    target={inputBlock}
                    propertyName="deviceId"
                    options={this.state.webCamSourceOptions}
                    extractValue={() => {
                        return webCamInputBlock.webcamSource.id;
                    }}
                    valuesAreStrings
                    noDirectUpdate
                    onSelect={(newDeviceId: string | number) => {
                        const option = this.state.webCamSourceOptions.find((option) => option.value === newDeviceId);
                        if (option) {
                            webCamInputBlock.onWebCamSourceChanged.notifyObservers({
                                name: option.label,
                                id: option.value as string,
                            });
                            this.props.globalState.stateManager.onUpdateRequiredObservable.notifyObservers(inputBlock);
                        }
                    }}
                ></OptionsLine>
            );
        }
    }
}
