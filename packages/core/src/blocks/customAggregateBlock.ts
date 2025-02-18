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
        innerSmartFilter: SmartFilter,
        disableOptimization: boolean
    ) {
        super(smartFilter, name, disableOptimization);

        for (const block of innerSmartFilter.attachedBlocks) {
            if (block.isInput && block.outputs[0]) {
                for (const endpoint of block.outputs[0].endpoints) {
                    // TODO: set default values
                    this._registerSubfilterInput(block.name, endpoint);
                }
            }
        }

        if (!innerSmartFilter.output.connectedTo) {
            throw new Error("The inner smart filter must have an output connected to something");
        }

        this._registerSubfilterOutput("output", innerSmartFilter.output.connectedTo);
    }

    /**
     * The class name of the block.
     */
    public static override ClassName = "CustomAggregateBlock";
}
