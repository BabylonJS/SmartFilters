import * as react from "react";
import type { GlobalState } from "../../globalState";
import type { Nullable } from "@babylonjs/core/types";
import type { Observer } from "@babylonjs/core/Misc/observable";

interface IPreviewAreaComponentProps {
    globalState: GlobalState;
}

export class PreviewAreaComponent extends react.Component<IPreviewAreaComponentProps, { isLoading: boolean }> {
    private _onResetRequiredObserver: Nullable<Observer<boolean>>;

    constructor(props: IPreviewAreaComponentProps) {
        super(props);

        this._onResetRequiredObserver = this.props.globalState.onResetRequiredObservable.add(() => {
            this.forceUpdate();
        });
    }

    override componentWillUnmount() {
        this.props.globalState.onResetRequiredObservable.remove(this._onResetRequiredObserver);
    }

    override render() {
        // TODO: add pop out window
        return (
            <>
                <div id="preview">
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
