import * as react from "react";
import { DefaultPreviewAspectRatio, type GlobalState } from "../../globalState.js";

import popUpIcon from "../../assets/imgs/popOut.svg";
import type { Nullable } from "@babylonjs/core/types";
import type { Observer } from "@babylonjs/core/Misc/observable";
import { OptionsLine } from "@babylonjs/shared-ui-components/lines/optionsLineComponent.js";

interface IPreviewAreaControlComponent {
    globalState: GlobalState;
    togglePreviewAreaComponent: () => void;
    allowPreviewFillMode: boolean;
}

const backgroundOptions = [
    { label: "Grid", value: "grid" },
    { label: "Black", value: "black" },
    { label: "White", value: "white" },
];

const aspectRatioOptions = [
    { label: "16:9", value: "1.77778" },
    { label: "4:3", value: DefaultPreviewAspectRatio },
    { label: "1:1", value: "1.0" },
    { label: "19:6", value: "0.5625" },
    { label: "3:4", value: "0.75" },
    { label: "Fill", value: "unset" }, // DO NOT CHECK IN
];

/**
 * The problem is that the canvas and preview div need the same aspect ratio set on them.
 * If the canvas doesn't have an aspect ratio set, it will infer it from the height/width attributes which
 * are stale from the previous size. For fill, this is a problem, because we would normally clear the aspect ratio
 * and let it fill its container. Either we need to eliminate this implicit aspect ratio behavior, or we need to
 * explicitly set the aspect ratio on the canvas to be the same as it's container.
 */

export class PreviewAreaControlComponent extends react.Component<IPreviewAreaControlComponent, { background: string }> {
    private _onResetRequiredObserver: Nullable<Observer<boolean>>;
    private _onPreviewAspectRatioChangedObserver: Nullable<Observer<string>>;

    constructor(props: IPreviewAreaControlComponent) {
        super(props);

        this._onResetRequiredObserver = this.props.globalState.onResetRequiredObservable.add(() => {
            this.forceUpdate();
        });

        this._onPreviewAspectRatioChangedObserver = this.props.globalState.previewAspectRatio.onChangedObservable.add(
            () => {
                this.forceUpdate();
            }
        );
    }

    override componentWillUnmount() {
        this.props.globalState.onResetRequiredObservable.remove(this._onResetRequiredObserver);
        this.props.globalState.previewAspectRatio.onChangedObservable.remove(this._onPreviewAspectRatioChangedObserver);
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
                    target={this.props.globalState.previewAspectRatio}
                    propertyName="value"
                    valuesAreStrings={true}
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
