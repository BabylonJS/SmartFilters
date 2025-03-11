import type { LockObject } from "@babylonjs/shared-ui-components/tabs/propertyGrids/lockObject";
import { InputArrowsComponent } from "@babylonjs/shared-ui-components/lines/inputArrowsComponent.js";
import * as react from "react";
import type { Observable } from "@babylonjs/core/Misc/observable";
import type { PropertyChangedEvent } from "@babylonjs/shared-ui-components/propertyChangedEvent";

export const conflictingValuesPlaceholder = "—";

type ILazyTextInputLineComponentProps = {
    // The unique key for the component. Used to control re-renders.
    key: react.Key;
    // The target object to set the property on
    target: any;
    // The property name to set on the target object
    propertyName: string;
    // If target value is undefined, initialValue will be used
    initialValue?: string;
    // Callback to run side effects when the value changes
    onChange?: (value: string) => void;
    // Observable to help run side effects when the value changes
    onPropertyChangedObservable?: Observable<PropertyChangedEvent>;
    label?: string;
    lockObject?: LockObject;
    icon?: string;
    iconLabel?: string;
    noUnderline?: boolean;
    numbersOnly?: boolean;
    arrows?: boolean;
    arrowsIncrement?: (amount: number) => void;
    step?: number;
    numeric?: boolean;
    roundValues?: boolean;
    min?: number;
    max?: number;
    placeholder?: string;
    unit?: React.ReactNode;
    validator?: (input: string) => boolean;
    onInvalidSubmit?: (invalidInput: string) => void;
    multilines?: boolean;
    disabled?: boolean;
};

interface ILazyTextInputLineComponentState {
    input: string;
    dragging: boolean;
    inputValid: boolean;
}

function getCurrentNumericValue(value: string, props: ILazyTextInputLineComponentProps) {
    const numeric = parseFloat(value);
    if (!isNaN(numeric)) {
        return numeric;
    }
    if (props.placeholder !== undefined) {
        const placeholderNumeric = parseFloat(props.placeholder);
        if (!isNaN(placeholderNumeric)) {
            return placeholderNumeric;
        }
    }
    return 0;
}

export class LazyTextInputLineComponent extends react.Component<
    ILazyTextInputLineComponentProps,
    ILazyTextInputLineComponentState
> {
    private _lastAttemptedSubmission: string | undefined;

    constructor(props: ILazyTextInputLineComponentProps) {
        super(props);

        const emptyValue = this.props.numeric ? "0" : "";

        this.state = {
            input: this.props.target[this.props.propertyName] ?? this.props.initialValue ?? emptyValue,
            dragging: false,
            inputValid: true,
        };
    }

    onSubmit = (value: string) => {
        if (this.props.numbersOnly) {
            if (!value) {
                value = "0";
            }

            //Removing starting zero if there is a number of a minus after it.
            if (value.search(/0+[0-9-]/g) === 0) {
                value = value.substring(1);
            }
        }

        if (this.props.numeric) {
            let numericValue = getCurrentNumericValue(value, this.props);
            if (this.props.roundValues) {
                numericValue = Math.round(numericValue);
            }
            if (this.props.min !== undefined) {
                numericValue = Math.max(this.props.min, numericValue);
            }
            if (this.props.max !== undefined) {
                numericValue = Math.min(this.props.max, numericValue);
            }
            value = numericValue.toString();
        }

        if (this.props.validator && this.props.validator(value) == false) {
            if (this.props.onInvalidSubmit && this._lastAttemptedSubmission !== value) {
                this.props.onInvalidSubmit(value);
            }
            this._lastAttemptedSubmission = value;
            return;
        }

        this.props.target[this.props.propertyName] = value;
        this._lastAttemptedSubmission = value;

        if (this.props.onChange) {
            this.props.onChange(value);
        }
        if (this.props.onPropertyChangedObservable) {
            this.props.onPropertyChangedObservable.notifyObservers({
                object: this.props.target,
                property: this.props.propertyName,
                initialValue: this.props.target[this.props.propertyName],
                value: value,
            });
        }
    };

    setInput = (input: string) => {
        if (this.props.disabled) {
            return;
        }
        if (this.props.numbersOnly) {
            if (/[^0-9.px%-]/g.test(input)) {
                return;
            }
        }

        this.setState({
            input,
            inputValid: this.props.validator ? this.props.validator(input) : true,
        });
    };

    setDragging = (dragging: boolean) => {
        this.setState({ dragging });
    };

    incrementValue = (amount: number) => {
        if (this.props.step) {
            amount *= this.props.step;
        }
        if (this.props.arrowsIncrement) {
            this.props.arrowsIncrement(amount);
        }
        const currentValue = getCurrentNumericValue(this.state.input, this.props);
        const newValue = (currentValue + amount).toFixed(2);

        this.setInput(newValue);

        if (!this.props.arrowsIncrement) {
            this.onSubmit(newValue);
        }
    };

    onChange = (event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
        this.setInput(event.target.value);
    };

    onKeyDown = (event: React.KeyboardEvent) => {
        if (!this.props.disabled) {
            if (event.key === "Enter") {
                this.onSubmit(this.state.input);
            }
            if (this.props.arrows) {
                if (event.key === "ArrowUp") {
                    this.incrementValue(1);
                    event.preventDefault();
                }
                if (event.key === "ArrowDown") {
                    this.incrementValue(-1);
                    event.preventDefault();
                }
            }
        }
    };

    onBlur = () => {
        this.onSubmit(this.state.input);
        if (this.props.lockObject) {
            this.props.lockObject.lock = false;
        }
    };

    onFocus = () => {
        if (this.props.lockObject) {
            this.props.lockObject.lock = true;
        }
    };

    override componentWillUnmount() {
        this.onBlur();
    }

    override render() {
        const value = this.state.input === conflictingValuesPlaceholder ? "" : this.state.input;
        const placeholder =
            this.state.input === conflictingValuesPlaceholder
                ? conflictingValuesPlaceholder
                : this.props.placeholder || "";
        const step = this.props.step || (this.props.roundValues ? 1 : 0.01);
        const className = this.props.multilines
            ? "textInputArea"
            : this.props.unit !== undefined
              ? "textInputLine withUnits"
              : "textInputLine";
        const style = { background: this.state.inputValid ? undefined : "lightpink" };
        return (
            <div className={className}>
                {this.props.icon && (
                    <img
                        src={this.props.icon}
                        title={this.props.iconLabel}
                        alt={this.props.iconLabel}
                        color="black"
                        className="icon"
                    />
                )}
                {this.props.label !== undefined && (
                    <div className="label" title={this.props.label}>
                        {this.props.label}
                    </div>
                )}
                {this.props.multilines && (
                    <>
                        <textarea
                            className={this.props.disabled ? "disabled" : ""}
                            style={style}
                            value={this.state.input}
                            onBlur={this.onBlur}
                            onFocus={this.onFocus}
                            onChange={this.onChange}
                            disabled={this.props.disabled}
                        />
                    </>
                )}
                {!this.props.multilines && (
                    <div
                        className={`value${this.props.noUnderline === true ? " noUnderline" : ""}${this.props.arrows ? " hasArrows" : ""}${this.state.dragging ? " dragging" : ""}`}
                    >
                        <input
                            className={this.props.disabled ? "disabled" : ""}
                            style={style}
                            value={value}
                            onBlur={this.onBlur}
                            onFocus={this.onFocus}
                            onChange={this.onChange}
                            onKeyDown={this.onKeyDown}
                            placeholder={placeholder}
                            type={this.props.numeric ? "number" : "text"}
                            step={step}
                            disabled={this.props.disabled}
                        />
                        {this.props.arrows && (
                            <InputArrowsComponent incrementValue={this.incrementValue} setDragging={this.setDragging} />
                        )}
                    </div>
                )}
                {this.props.unit}
            </div>
        );
    }
}
