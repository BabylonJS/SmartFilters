import { Observable } from "@babylonjs/core/Misc/observable.js";

export type ReadOnlyObservable<T> = Omit<Observable<T>, "notifyObserver" | "notifyObservers">;

export class ObservableProperty<T> {
    private _value: T;
    private _onChangedObservable: Observable<T> = new Observable<T>();

    public get value(): T {
        return this._value;
    }

    public set value(newValue: T) {
        if (this._value !== newValue) {
            this._value = newValue;
            this._onChangedObservable.notifyObservers(this._value);
        }
    }
    public readonly onChangedObservable: ReadOnlyObservable<T>;

    public constructor(value: T) {
        this._value = value;
        this.onChangedObservable = this._onChangedObservable;
    }
}
