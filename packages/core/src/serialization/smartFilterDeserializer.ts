import type { SerializedSmartFilterV1 } from "./v1/SerializedSmartFilterV1";
import type { BaseBlock } from "../blocks/baseBlock";
import type { SerializedSmartFilter } from "./serializedSmartFilter.js";
import type { ISerializedBlockV1 } from "./v1/ISerializedBlockV1.js";
import { SmartFilter } from "../smartFilter.js";
import { inputBlockDeserializer } from "../blocks/inputBlock.deserializer.js";
import { OutputBlock } from "../blocks/outputBlock.js";
import type { ISerializedConnectionV1 } from "./v1/ISerializedConnectionV1.js";
import type { ThinEngine } from "@babylonjs/core/Engines/thinEngine";
import type { IBlockDeserializerV1 } from "./smartFilterDeserializer.types";

export class SmartFilterDeserializer {
    private readonly _blockDeserializers: Map<string, IBlockDeserializerV1> = new Map();

    /**
     * Creates a new SmartFilterDeserializer
     * @param additionalBlockDeserializers - An array of block serializers to use, beyond those for the core blocks
     */
    public constructor(additionalBlockDeserializers: IBlockDeserializerV1[]) {
        this._blockDeserializers.set(inputBlockDeserializer.className, inputBlockDeserializer);
        additionalBlockDeserializers.forEach((deserializer) =>
            this._blockDeserializers.set(deserializer.className, deserializer)
        );
    }

    public deserialize(engine: ThinEngine, smartFilterJson: any): SmartFilter {
        const serializedSmartFilter: SerializedSmartFilter = smartFilterJson;
        switch (serializedSmartFilter.version) {
            case 1:
                return this._deserializeV1(engine, serializedSmartFilter);
        }
    }

    private _deserializeV1(engine: ThinEngine, serializedSmartFilter: SerializedSmartFilterV1): SmartFilter {
        const smartFilter = new SmartFilter(serializedSmartFilter.name);
        const blockMap = new Map<string, BaseBlock>();

        // Deserialize the blocks
        serializedSmartFilter.blocks.forEach((serializedBlock: ISerializedBlockV1) => {
            if (serializedBlock.className === OutputBlock.ClassName) {
                blockMap.set(smartFilter.output.ownerBlock.name, smartFilter.output.ownerBlock);
            } else {
                const blockDeserializer = this._blockDeserializers.get(serializedBlock.className);
                if (!blockDeserializer) {
                    throw new Error(`No deserializer found for block type ${serializedBlock.className}`);
                }
                const newBlock = blockDeserializer.deserialize(engine, smartFilter, serializedBlock);

                blockMap.set(newBlock.name, newBlock);
            }
        });

        // Deserialize the connections
        serializedSmartFilter.connections.forEach((connection: ISerializedConnectionV1) => {
            // Find the source block and it's connection point's connectTo function
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
