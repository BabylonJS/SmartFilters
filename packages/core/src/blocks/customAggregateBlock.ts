import type { ThinEngine } from "@babylonjs/core/Engines/thinEngine.js";
import type { SmartFilterDeserializer, SerializedBlockDefinition } from "../serialization/index.js";
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
     * @param name - The friendly name of the block
     * @param serializedSmartFilter - The serialized SmartFilter to load into the block
     * @param smartFilterDeserializer - The deserializer to use
     * @returns A promise that resolves to the new CustomAggregateBlock
     */
    public static async Create(
        smartFilter: SmartFilter,
        engine: ThinEngine,
        name: string,
        serializedSmartFilter: SerializedBlockDefinition,
        smartFilterDeserializer: SmartFilterDeserializer
    ): Promise<BaseBlock> {
        const innerSmartFilter = await smartFilterDeserializer.deserialize(engine, serializedSmartFilter);
        return new CustomAggregateBlock(smartFilter, name, serializedSmartFilter.blockType, innerSmartFilter, false);
    }

    /**
     * The class name of the block.
     */
    public static override ClassName = "CustomAggregateBlock";

    private readonly _blockType: string;

    /**
     * The type of the block - used when serializing / deserializing the block, and in the editor.
     */
    public override get blockType(): string {
        return this._blockType;
    }

    private constructor(
        smartFilter: SmartFilter,
        name: string,
        blockType: string,
        innerSmartFilter: SmartFilter,
        disableOptimization: boolean
    ) {
        super(smartFilter, name, disableOptimization);

        this._blockType = blockType;

        const attachedBlocks = innerSmartFilter.attachedBlocks;
        for (let index = 0; index < attachedBlocks.length; index++) {
            const block = attachedBlocks[index];
            if (block && block.isInput && block.outputs[0]) {
                // Create an input connection point on this CustomAggregateBlock for each input connection point
                // this input block is connected to
                for (const endpoint of block.outputs[0].endpoints) {
                    this._registerSubfilterInput(block.name, endpoint, block.outputs[0].runtimeData ?? null);
                }

                // Remove this input block from the smart filter graph - this will reset the runtimeData to the
                // default for that connection point (which may be null)
                innerSmartFilter.removeBlock(block);
                index--;
            }
        }

        if (!innerSmartFilter.output.connectedTo) {
            throw new Error("The inner smart filter must have an output connected to something");
        }

        this._registerSubfilterOutput("output", innerSmartFilter.output.connectedTo);
    }
}
