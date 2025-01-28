import type { BaseBlock } from "../blocks/baseBlock";
import type { SerializedSmartFilter } from "./serializedSmartFilter.js";
import { SmartFilter } from "../smartFilter.js";
import { inputBlockDeserializer } from "../blocks/inputBlock.deserializer.js";
import { OutputBlock } from "../blocks/outputBlock.js";
import type { ThinEngine } from "@babylonjs/core/Engines/thinEngine";
import { InputBlock } from "../blocks/inputBlock.js";
import type {
    ISerializedBlockV1,
    ISerializedConnectionV1,
    OptionalBlockDeserializerV1,
    SerializedSmartFilterV1,
} from "./v1/serialization.types";
import { UniqueIdGenerator } from "../utils/uniqueIdGenerator.js";
import type { Nullable } from "@babylonjs/core/types";

/**
 * A block factory function that creates a block of the given class name, or return null if it cannot.
 */
export type BlockFactory = (
    smartFilter: SmartFilter,
    engine: ThinEngine,
    serializedBlock: ISerializedBlockV1
) => Promise<Nullable<BaseBlock>>;

/**
 * Deserializes serialized SmartFilters. The caller passes in a map of block deserializers it wants to use,
 * which allows the caller to provide custom deserializers for blocks beyond the core blocks.
 * The deserializer supports versioned serialized SmartFilters.
 */
export class SmartFilterDeserializer {
    private readonly _blockFactory: BlockFactory;
    private readonly _customInputBlockDeserializer?: OptionalBlockDeserializerV1;

    /**
     * Creates a new SmartFilterDeserializer
     * @param blockFactory - A function that creates a block of the given class name, or returns null if it cannot
     * @param customInputBlockDeserializer - An optional custom deserializer for InputBlocks - if supplied and it returns null, the default deserializer will be used
     */
    public constructor(blockFactory: BlockFactory, customInputBlockDeserializer?: OptionalBlockDeserializerV1) {
        this._blockFactory = blockFactory;
        this._customInputBlockDeserializer = customInputBlockDeserializer;
    }

    /**
     * Deserializes a SmartFilter from a JSON object - can be safely called multiple times and has no side effects within the class.
     * @param engine - The ThinEngine to pass to the new SmartFilter
     * @param smartFilterJson - The JSON object to deserialize
     * @returns A promise that resolves to the deserialized SmartFilter
     */
    public async deserialize(engine: ThinEngine, smartFilterJson: any): Promise<SmartFilter> {
        const serializedSmartFilter: SerializedSmartFilter = smartFilterJson;
        switch (serializedSmartFilter.version) {
            case 1:
                return await this._deserializeV1(engine, serializedSmartFilter);
        }
    }

    private async _deserializeV1(
        engine: ThinEngine,
        serializedSmartFilter: SerializedSmartFilterV1
    ): Promise<SmartFilter> {
        const smartFilter = new SmartFilter(serializedSmartFilter.name);
        const blockIdMap = new Map<number, BaseBlock>();

        // Only needed for smart filters saved before we started using uniqueIds for the maps, didn't warrant new version
        const blockNameMap = new Map<string, BaseBlock>();

        // Deserialize the SmartFilter level data
        smartFilter.comments = serializedSmartFilter.comments;
        smartFilter.editorData = serializedSmartFilter.editorData;

        // Deserialize the blocks
        const blockDeserializationWork: Promise<void>[] = [];
        const blockDefinitionsWhichCouldNotBeDeserialized: string[] = [];
        serializedSmartFilter.blocks.forEach((serializedBlock: ISerializedBlockV1) => {
            blockDeserializationWork.push(
                this._deserializeBlockV1(
                    smartFilter,
                    serializedBlock,
                    engine,
                    blockDefinitionsWhichCouldNotBeDeserialized,
                    blockIdMap,
                    blockNameMap
                )
            );
        });
        await Promise.all(blockDeserializationWork);

        // If any block definitions could not be deserialized, throw an error
        if (blockDefinitionsWhichCouldNotBeDeserialized.length > 0) {
            throw new Error(
                `Could not deserialize the following block definitions: ${blockDefinitionsWhichCouldNotBeDeserialized.join(", ")}`
            );
        }

        // Deserialize the connections
        serializedSmartFilter.connections.forEach((connection: ISerializedConnectionV1) => {
            // Find the source block and its connection point's connectTo function
            const sourceBlock =
                typeof connection.outputBlock === "string"
                    ? blockNameMap.get(connection.outputBlock)
                    : blockIdMap.get(connection.outputBlock);

            if (!sourceBlock) {
                throw new Error(`Source block ${connection.outputBlock} not found`);
            }
            const sourceConnectionPoint = (sourceBlock as any)[connection.outputConnectionPoint];
            if (!sourceConnectionPoint || typeof sourceConnectionPoint.connectTo !== "function") {
                throw new Error(
                    `Block ${connection.outputBlock} does not have an connection point named ${connection.outputConnectionPoint}`
                );
            }
            const sourceConnectToFunction = sourceConnectionPoint.connectTo.bind(sourceConnectionPoint);

            // Find the target block and its connection point
            const targetBlock =
                typeof connection.inputBlock === "string"
                    ? blockNameMap.get(connection.inputBlock)
                    : blockIdMap.get(connection.inputBlock);
            if (!targetBlock) {
                throw new Error(`Target block ${connection.inputBlock} not found`);
            }
            const targetConnectionPoint = (targetBlock as any)[connection.inputConnectionPoint];
            if (!targetConnectionPoint || typeof targetConnectionPoint !== "object") {
                throw new Error(
                    `Block ${connection.inputBlock} does not have a connection point named ${connection.inputConnectionPoint}`
                );
            }

            // Create the connection
            sourceConnectToFunction.call(sourceBlock, targetConnectionPoint);
        });

        return smartFilter;
    }

    private async _deserializeBlockV1(
        smartFilter: SmartFilter,
        serializedBlock: ISerializedBlockV1,
        engine: ThinEngine,
        blockDefinitionsWhichCouldNotBeDeserialized: string[],
        blockIdMap: Map<number, BaseBlock>,
        blockNameMap: Map<string, BaseBlock>
    ): Promise<void> {
        let newBlock: Nullable<BaseBlock> = null;

        // Get the instance of the block
        switch (serializedBlock.className) {
            case InputBlock.ClassName:
                {
                    if (this._customInputBlockDeserializer) {
                        newBlock = await this._customInputBlockDeserializer(smartFilter, serializedBlock, engine);
                    }
                    if (newBlock === null) {
                        newBlock = inputBlockDeserializer(smartFilter, serializedBlock);
                    }
                }
                break;
            case OutputBlock.ClassName:
                {
                    newBlock = smartFilter.output.ownerBlock;
                }
                break;
            default: {
                // If it's not an input or output block, use the provided block factory
                newBlock = await this._blockFactory(smartFilter, engine, serializedBlock);
                if (!newBlock) {
                    blockDefinitionsWhichCouldNotBeDeserialized.push(serializedBlock.className);
                    return;
                }
            }
        }

        // Deserializers are not responsible for setting the uniqueId or comments.
        // This is so they don't have to be passed into the constructors when programmatically creating
        // blocks, and so each deserializer doesn't have to remember to do it.
        newBlock.uniqueId = serializedBlock.uniqueId;
        newBlock.comments = serializedBlock.comments;

        // We need to ensure any uniqueIds generated in the future (e.g. a new block is added to the SmartFilter)
        // are higher than this one.
        UniqueIdGenerator.EnsureIdsGreaterThan(newBlock.uniqueId);

        // Save in the map
        blockIdMap.set(newBlock.uniqueId, newBlock);
        blockNameMap.set(newBlock.name, newBlock);
    }
}
