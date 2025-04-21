import * as react from "react";
import type { GlobalState } from "../../globalState";

import popUpIcon from "../../assets/imgs/popOut.svg";
import type { Nullable } from "@babylonjs/core/types";
import type { Observer } from "@babylonjs/core/Misc/observable";
import { OptionsLine } from "@babylonjs/shared-ui-components/lines/optionsLineComponent.js";

interface IPreviewAreaControlComponent {
    globalState: GlobalState;
    togglePreviewAreaComponent: () => void;
}

const backgroundOptions = [
    { label: "Grid", value: "grid" },
    { label: "Black", value: "black" },
    { label: "White", value: "white" },
];

const aspectRatioOptions = [
    { label: "16:6", value: "1.77778" },
    { label: "4:3", value: "1.33333" },
    { label: "1:1", value: "1.0" },
    { label: "19:6", value: "3.16667" },
    { label: "3:4", value: "0.75" },
];

export class PreviewAreaControlComponent extends react.Component<IPreviewAreaControlComponent, { background: string }> {
    private _onResetRequiredObserver: Nullable<Observer<boolean>>;

    constructor(props: IPreviewAreaControlComponent) {
        super(props);

        this._onResetRequiredObserver = this.props.globalState.onResetRequiredObservable.add(() => {
            this.forceUpdate();
        });
    }

    override componentWillUnmount() {
        this.props.globalState.onResetRequiredObservable.remove(this._onResetRequiredObserver);
    }

    onPopUp() {
        this.props.togglePreviewAreaComponent();
    }

    override render() {
        return (
            <div id="preview-area-bar">
                <OptionsLine
                    label=""
                    options={backgroundOptions}
                    target={this.props.globalState}
                    propertyName="previewBackground"
                    valuesAreStrings={true}
                    onSelect={() => {
                        this.props.globalState.onPreviewResetRequiredObservable.notifyObservers();
                    }}
                />
                <OptionsLine
                    label=""
                    options={aspectRatioOptions}
                    target={this.props.globalState}
                    propertyName="previewBackground"
                    valuesAreStrings={true}
                    onSelect={() => {
                        this.props.globalState.onPreviewResetRequiredObservable.notifyObservers();
                    }}
                />
                <div
                    title="Open preview in new window"
                    id="preview-new-window"
                    onClick={() => this.onPopUp()}
                    className="button"
                >
                    <img src={popUpIcon} alt="" />
                </div>
            </div>
        );
    }
}
