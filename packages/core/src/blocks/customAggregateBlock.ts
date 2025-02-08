import type { SerializedSmartFilterV1 } from "../serialization/index.js";
import type { SmartFilter } from "../smartFilter.js";
import { AggregateBlock } from "./aggregateBlock.js";
import type { BaseBlock } from "./baseBlock.js";

/**
 * The custom aggregate block class loads a serialized SmartFilter graph into a block which can be used in another SmartFilter.
 */
export class CustomAggregateBlock extends AggregateBlock {
    /**
     * Creates a new CustomAggregateBlock
     * @param _smartFilter - The SmartFilter to create the block for
     * @param _name - The name of the block
     * @param _blockDefinition - The serialized block definition
     */
    public static Create(
        _smartFilter: SmartFilter,
        _name: string,
        _blockDefinition: SerializedSmartFilterV1
    ): BaseBlock {
        throw new Error("Method not implemented.");
    }

    /**
     * The class name of the block.
     */
    public static override ClassName = "CustomAggregateBlock";
}
