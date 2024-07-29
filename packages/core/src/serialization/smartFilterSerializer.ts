import type { SmartFilter } from "../smartFilter";
import type { SerializedSmartFilterV1 } from "./v1/SerializedSmartFilterV1";
import type { ISerializedBlockV1 } from "./v1/ISerializedBlockV1";
import type { BaseBlock } from "../blocks/baseBlock";
import { inputBlockSerializer } from "../blocks/inputBlock.serializer.js";
import type { ISerializedConnectionV1 } from "./v1/ISerializedConnectionV1";
import type { ConnectionPoint } from "../connection/connectionPoint";
import type { IBlockSerializer, SerializeBlockV1 } from "./smartFilterSerializer.types";
import { defaultBlockSerializer } from "./defaultBlockSerializer.js";
import { OutputBlock } from "../blocks/outputBlock.js";

function serializedConnectionPointsEqual(a: ISerializedConnectionV1, b: ISerializedConnectionV1): boolean {
    return (
        a.inputBlock === b.inputBlock &&
        a.inputConnectionPoint === b.inputConnectionPoint &&
        a.outputBlock === b.outputBlock &&
        a.outputConnectionPoint === b.outputConnectionPoint
    );
}

export class SmartFilterSerializer {
    private readonly _blockSerializers: Map<string, SerializeBlockV1> = new Map();

    /**
     * Creates a new SmartFilterSerializer
     * @param blocksUsingDefaultSerialization - A list of the classNames of blocks which can use default serialization (they only have ConnectionPoint properties and no constructor parameters)
     * @param additionalBlockSerializers - An array of block serializers to use, beyond those for the core blocks
     */
    public constructor(blocksUsingDefaultSerialization: string[], additionalBlockSerializers: IBlockSerializer[]) {
        this._blockSerializers.set(inputBlockSerializer.className, inputBlockSerializer.serialize);
        this._blockSerializers.set(OutputBlock.ClassName, defaultBlockSerializer);
        blocksUsingDefaultSerialization.forEach((block) => {
            this._blockSerializers.set(block, defaultBlockSerializer);
        });
        additionalBlockSerializers.forEach((serializer) =>
            this._blockSerializers.set(serializer.className, serializer.serialize)
        );
    }

    public serialize(smartFilter: SmartFilter): SerializedSmartFilterV1 {
        const connections: ISerializedConnectionV1[] = [];

        const blocks = smartFilter.attachedBlocks.map((block: BaseBlock) => {
            // Serialize the block itself
            const serializeFn = this._blockSerializers.get(block.getClassName());
            if (!serializeFn) {
                throw new Error(`No serializer was provided for a block of type ${block.getClassName()}`);
            }
            const serializedBlock: ISerializedBlockV1 = serializeFn(block);

            // Serialize the connections to the inputs
            block.inputs.forEach((input: ConnectionPoint) => {
                const connectedTo = input.connectedTo;
                if (connectedTo) {
                    const newConnection: ISerializedConnectionV1 = {
                        inputBlock: block.name,
                        inputConnectionPoint: input.name,
                        outputBlock: connectedTo.ownerBlock.name,
                        outputConnectionPoint: connectedTo.name,
                    };
                    if (!connections.find((other) => serializedConnectionPointsEqual(newConnection, other))) {
                        connections.push(newConnection);
                    }
                }
            });

            // Serialize the connections to the outputs
            block.outputs.forEach((output: ConnectionPoint) => {
                output.endpoints.forEach((input: ConnectionPoint) => {
                    const newConnection: ISerializedConnectionV1 = {
                        inputBlock: input.ownerBlock.name,
                        inputConnectionPoint: input.name,
                        outputBlock: block.name,
                        outputConnectionPoint: output.name,
                    };
                    if (!connections.find((other) => serializedConnectionPointsEqual(newConnection, other))) {
                        connections.push(newConnection);
                    }
                });
            });

            return serializedBlock;
        });

        return {
            version: 1,
            name: smartFilter.name,
            blocks,
            connections,
        };
    }
}
