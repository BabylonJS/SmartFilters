import type { ThinEngine } from "@babylonjs/core/Engines/thinEngine.js";
import type { SmartFilterDeserializer, SerializedSmartFilterV1 } from "../serialization/index.js";
import type { SmartFilter } from "../smartFilter.js";
import { AggregateBlock } from "./aggregateBlock.js";
import type { BaseBlock } from "./baseBlock.js";

/**
 * The custom aggregate block class loads a serialized SmartFilter graph into a block which can be used in another SmartFilter.
 */
export class CustomAggregateBlock extends AggregateBlock {
    /**
     * Creates a new CustomAggregateBlock
     * @param smartFilter - The SmartFilter to create the block for
     * @param engine - The ThinEngine to use
     * @param name - The name of the block
     * @param serializedSmartFilter - The serialized SmartFilter to load into the block
     * @param smartFilterDeserializer - The deserializer to use
     * @returns A promise that resolves to the new CustomAggregateBlock
     */
    public static async Create(
        smartFilter: SmartFilter,
        engine: ThinEngine,
        name: string,
        serializedSmartFilter: SerializedSmartFilterV1,
        smartFilterDeserializer: SmartFilterDeserializer
    ): Promise<BaseBlock> {
        const innerSmartFilter = await smartFilterDeserializer.deserialize(engine, serializedSmartFilter);
        return new CustomAggregateBlock(smartFilter, name, innerSmartFilter, false);
    }

    private constructor(
        smartFilter: SmartFilter,
        name: string,
        _innerSmartFilter: SmartFilter,
        disableOptimization: boolean
    ) {
        super(smartFilter, name, disableOptimization);

        // TODO: register the inputs
    }

    /**
     * The class name of the block.
     */
    public static override ClassName = "CustomAggregateBlock";
}
