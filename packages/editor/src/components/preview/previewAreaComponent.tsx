import * as react from "react";
import type { GlobalState } from "../../globalState";
import type { Nullable } from "@babylonjs/core/types";
import type { Observer } from "@babylonjs/core/Misc/observable";

interface IPreviewAreaComponentProps {
    globalState: GlobalState;
}

export class PreviewAreaComponent extends react.Component<IPreviewAreaComponentProps, { isLoading: boolean }> {
    private _onResetRequiredObserver: Nullable<Observer<boolean>>;
    private _onPreviewResetRequiredObserver: Nullable<Observer<void>>;

    constructor(props: IPreviewAreaComponentProps) {
        super(props);

        this._onResetRequiredObserver = this.props.globalState.onResetRequiredObservable.add(() => {
            this.forceUpdate();
        });
        this._onPreviewResetRequiredObserver = this.props.globalState.onPreviewResetRequiredObservable.add(() => {
            this.forceUpdate();
        });
    }

    override componentWillUnmount() {
        this.props.globalState.onResetRequiredObservable.remove(this._onResetRequiredObserver);
        this.props.globalState.onPreviewResetRequiredObservable.remove(this._onPreviewResetRequiredObserver);
    }

    override render() {
        return (
            <>
                <div id="preview" className={"preview-background-" + this.props.globalState.previewBackground}>
                    <canvas id="sfe-preview-canvas" />
                    {!this.props.globalState.smartFilter ? (
                        <div className={"waitPanel" + (this.state.isLoading ? "" : " hidden")}>
                            Please wait, loading...
                        </div>
                    ) : (
                        <></>
                    )}
                </div>
            </>
        );
    }
}
