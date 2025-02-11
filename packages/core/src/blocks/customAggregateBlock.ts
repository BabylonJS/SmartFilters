import type { ThinEngine } from "@babylonjs/core/Engines/thinEngine.js";
import {
    SmartFilterDeserializer,
    type BlockFactory,
    type OptionalBlockDeserializerV1,
    type SerializedSmartFilterV1,
} from "../serialization/index.js";
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
     * @param blockFactory - A function that creates a block of the given class name, or returns null if it cannot
     * @param customInputBlockDeserializer - An optional custom deserializer for InputBlocks - if supplied and it returns null, the default deserializer will be used
     * @returns A promise that resolves to the new CustomAggregateBlock
     */
    public static async Create(
        smartFilter: SmartFilter,
        engine: ThinEngine,
        name: string,
        serializedSmartFilter: SerializedSmartFilterV1,
        blockFactory: BlockFactory,
        customInputBlockDeserializer?: OptionalBlockDeserializerV1
    ): Promise<BaseBlock> {
        const deserializer = new SmartFilterDeserializer(blockFactory, customInputBlockDeserializer);
        const innerSmartFilter = await deserializer.deserialize(engine, serializedSmartFilter);
        return new CustomAggregateBlock(smartFilter, engine, name, innerSmartFilter);
    }

    private constructor(smartFilter: SmartFilter, engine: ThinEngine, name: string, innerSmartFilter: SmartFilter) {
        super(name);
    }

    /**
     * The class name of the block.
     */
    public static override ClassName = "CustomAggregateBlock";
}
