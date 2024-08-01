import type { SmartFilter } from "../smartFilter";
import type { ConnectionPointValue } from "../connection/connectionPointType";
import type { RuntimeData } from "../connection/connectionPoint";
import type { ConnectionPointWithDefault } from "../connection/connectionPointWithDefault";
import type { DisableableBlock } from "./disableableBlock";
import { BaseBlock } from "../blocks/baseBlock.js";
import { createStrongRef } from "../runtime/strongRef.js";
import { ConnectionPointType } from "../connection/connectionPointType.js";

/**
 * Type predicate to check if value is a strong ref or a direct value
 * @param value - The value to check
 * @returns true if the value is a strong ref, otherwise false
 */
function isRuntimeData<U extends ConnectionPointType>(
    value: ConnectionPointValue<U> | RuntimeData<U>
): value is RuntimeData<U> {
    return value && (value as RuntimeData<ConnectionPointType>).value !== undefined;
}

/**
 * Predicate to check if a block is a texture input block.
 * @param block - The block to check
 * @returns true if the block is a texture input block, otherwise false
 */
export function isTextureInputBlock(block: BaseBlock): block is InputBlock<ConnectionPointType.Texture> {
    return (block as InputBlock<ConnectionPointType.Texture>).type === ConnectionPointType.Texture;
}

/**
 * Predicate to check if a block is a disableable block.
 * @param block - The block to check
 * @returns true if the block is a disableable block, otherwise false
 */
export function isDisableableBlock(block: BaseBlock): block is DisableableBlock {
    return (block as DisableableBlock).disabled !== undefined;
}

/**
 * This base class exists to provide a type that the serializer can use to represent
 * any InputBlock without knowing the exact type it is.
 */
export abstract class InputBlockBase extends BaseBlock {
    /**
     * The class name of the block.
     */
    public static override ClassName = "InputBlock";

    /**
     * The type of the input.
     */
    public abstract readonly type: ConnectionPointType;
}

/**
 * This represents any inputs used in the graph.
 *
 * This is used to provide a way to connect the graph to the outside world.
 *
 * The value is dynamically set by the user.
 */
export class InputBlock<U extends ConnectionPointType> extends InputBlockBase {
    /**
     * The output connection point of the block.
     */
    public readonly output: ConnectionPointWithDefault<U>;

    /**
     * The type of the input.
     */
    public readonly type: U;

    /**
     * Gets the current value of the input.
     */
    public get runtimeValue(): RuntimeData<U> {
        return this.output.runtimeData;
    }

    /**
     * Sets the current value of the input.
     */
    public set runtimeValue(value: RuntimeData<U>) {
        this.output.runtimeData = value;
    }

    /**
     * Creates a new InputBlock.
     * @param smartFilter - The smart filter to add the block to
     * @param name - The friendly name of the block
     * @param type - The type of the input
     * @param initialValue - The initial value of the input
     * @remarks the initial value can either be a strong reference or a value
     */
    constructor(
        smartFilter: SmartFilter,
        name: string,
        type: U,
        initialValue: ConnectionPointValue<U> | RuntimeData<U>
    ) {
        super(smartFilter, name);
        this.type = type;

        // Creates the output connection point
        this.output = this._registerOutputWithDefault(
            "output",
            type,
            isRuntimeData(initialValue) ? initialValue : createStrongRef(initialValue)
        );

        // Creates a strong reference to the initial value in case a reference has not been provided
        if (isRuntimeData(initialValue)) {
            this.runtimeValue = initialValue;
        } else {
            this.runtimeValue = createStrongRef(initialValue);
        }
    }
}

/**
 * Unionized type of all the possible input types.
 */
export type AnyInputBlock = {
    [T in keyof typeof ConnectionPointType]: InputBlock<(typeof ConnectionPointType)[T]>;
}[keyof typeof ConnectionPointType];
