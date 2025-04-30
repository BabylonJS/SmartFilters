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
    private _onPreviewAspectRatioChangedObserver: Nullable<Observer<string>>;

    constructor(props: IPreviewAreaComponentProps) {
        super(props);

        this._onResetRequiredObserver = this.props.globalState.onResetRequiredObservable.add(() => {
            this.forceUpdate();
        });
        this._onPreviewResetRequiredObserver = this.props.globalState.onPreviewResetRequiredObservable.add(() => {
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
        this.props.globalState.onPreviewResetRequiredObservable.remove(this._onPreviewResetRequiredObserver);
        this.props.globalState.previewAspectRatio.onChangedObservable.remove(this._onPreviewAspectRatioChangedObserver);
    }

    override render() {
        // eslint-disable-next-line no-console
        console.log("PreviewAreaComponent render");
        return (
            <>
                <div
                    id="preview"
                    className={"preview-background-" + this.props.globalState.previewBackground}
                    style={{ aspectRatio: this.props.globalState.previewAspectRatio.value }}
                >
                    <canvas
                        id="sfe-preview-canvas"
                        style={{ aspectRatio: this.props.globalState.previewAspectRatio.value }}
                    />
                    {!this.props.globalState.smartFilter ? (
                        <div className={"waitPanel" + (this.state.isLoading ? "" : " hidden")}>
                            Please wait, loading....
                        </div>
                    ) : (
                        <></>
                    )}
                </div>
            </>
        );
    }
}
