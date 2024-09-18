import { Observable } from "@babylonjs/core/Misc/observable";
import type { ReactionsSmartFilter } from "../reactionsSmartFilter";
import type { IEffect } from "./IEffect";
import type { Nullable } from "@babylonjs/core/types";

export class LikeEffect implements IEffect {
    private _isStarted = false;
    private _smartFilter: ReactionsSmartFilter;

    public onEffectCompleted: Observable<void>;
    private _timeout: Nullable<NodeJS.Timeout> = null;

    public get isStarted(): boolean {
        return this._isStarted;
    }

    public constructor(smartFilter: ReactionsSmartFilter) {
        this._smartFilter = smartFilter;
        this.onEffectCompleted = new Observable<void>();
    }

    public start(): void {
        if (this._isStarted) {
            return;
        }
        this._isStarted = true;

        console.log("[LikeEffect] Starting");
        this._smartFilter.blackAndWhiteDisabled = false;
        this._timeout = setTimeout(() => {
            console.log("[LikeEffect] Timer ticked");
            this.stop(true);
        }, 2000);
    }

    public stop(notifyEffectCompleted: boolean): void {
        if (!this._isStarted) {
            return;
        }
        console.log("[LikeEffect] Stopping");
        this._isStarted = false;

        if (this._timeout) {
            clearTimeout(this._timeout);
            this._timeout = null;
        }
        this._smartFilter.blackAndWhiteDisabled = true;

        if (notifyEffectCompleted) {
            this.onEffectCompleted.notifyObservers();
        }
    }
}
