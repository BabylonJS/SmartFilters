import type { BaseBlock } from "../blocks/baseBlock";
import type { SerializedSmartFilter } from "./serializedSmartFilter.js";
import { SmartFilter } from "../smartFilter.js";
import { inputBlockDeserializer } from "../blocks/inputBlock.deserializer.js";
import { OutputBlock } from "../blocks/outputBlock.js";
import type { ThinEngine } from "@babylonjs/core/Engines/thinEngine";
import { InputBlock } from "../blocks/inputBlock.js";
import type {
    DeserializeBlockV1,
    ISerializedBlockV1,
    ISerializedConnectionV1,
    SerializedSmartFilterV1,
} from "./v1/serialization.types";

/**
 * Deserializes serialized SmartFilters. The caller passes in a map of block deserializers it wants to use,
 * which allows the caller to provide custom deserializers for blocks beyond the core blocks.
 * The deserializer supports versioned serialized SmartFilters.
 */
export class SmartFilterDeserializer {
    private readonly _blockDeserializersV1: Map<string, DeserializeBlockV1> = new Map();

    /**
     * Creates a new SmartFilterDeserializer
     * @param blockDeserializers - The map of block serializers to use, beyond those for the core blocks
     */
    public constructor(blockDeserializers: Map<string, DeserializeBlockV1>) {
        this._blockDeserializersV1 = blockDeserializers;

        // Add in the core block deserializers - they are not delay loaded, so they are wrapped in Promise.resolve()
        this._blockDeserializersV1.set(
            InputBlock.ClassName,
            (smartFilter: SmartFilter, serializedBlock: ISerializedBlockV1, engine: ThinEngine) =>
                Promise.resolve(inputBlockDeserializer(smartFilter, serializedBlock, engine))
        );
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
        const blockMap = new Map<string, BaseBlock>();

        // Deserialize the SmartFilter level data
        smartFilter.comments = serializedSmartFilter.comments;
        smartFilter.editorData = serializedSmartFilter.editorData;

        // Deserialize the blocks
        const blockDeserializationWork: Promise<void>[] = [];
        serializedSmartFilter.blocks.forEach((serializedBlock: ISerializedBlockV1) => {
            if (serializedBlock.className === OutputBlock.ClassName) {
                blockMap.set(smartFilter.output.ownerBlock.name, smartFilter.output.ownerBlock);
            } else {
                const blockDeserializer = this._blockDeserializersV1.get(serializedBlock.className);
                if (!blockDeserializer) {
                    throw new Error(`No deserializer found for block type ${serializedBlock.className}`);
                }
                blockDeserializationWork.push(
                    blockDeserializer(smartFilter, serializedBlock, engine).then((newBlock) => {
                        // Deserializers are not responsible for setting the uniqueId or comments.
                        // This is so they don't have to be passed into the constructors when programmatically creating
                        // blocks, and so each deserializer doesn't have to remember to do it.
                        newBlock.uniqueId = serializedBlock.uniqueId;
                        newBlock.comments = serializedBlock.comments;

                        // Save in the map
                        blockMap.set(newBlock.name, newBlock);
                    })
                );
            }
        });
        await Promise.all(blockDeserializationWork);

        // Deserialize the connections
        serializedSmartFilter.connections.forEach((connection: ISerializedConnectionV1) => {
            // Find the source block and its connection point's connectTo function
            const sourceBlock = blockMap.get(connection.outputBlock);
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
            const targetBlock = blockMap.get(connection.inputBlock);
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
}
