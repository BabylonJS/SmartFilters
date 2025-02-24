import * as react from "react";
import type { GlobalState } from "../../globalState";

import popUpIcon from "../../assets/imgs/popOut.svg";
import type { Nullable } from "@babylonjs/core/types";
import type { Observer } from "@babylonjs/core/Misc/observable";

interface IPreviewAreaControlComponent {
    globalState: GlobalState;
    togglePreviewAreaComponent: () => void;
}

export class PreviewAreaControlComponent extends react.Component<IPreviewAreaControlComponent> {
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
