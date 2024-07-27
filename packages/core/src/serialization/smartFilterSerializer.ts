import type { SmartFilter } from "../smartFilter";
import type { ISerializedSmartFilterV1 } from "./v1/ISerializedSmartFilterV1";
import type { ISerializedBlockV1 } from "./v1/ISerializedBlockV1";
import type { BaseBlock } from "../blocks/baseBlock";
import { inputBlockSerializer } from "../blocks/inputBlock.serialize.js";
import { OutputBlock } from "../blocks/outputBlock.js";
import type { ISerializedConnectionV1 } from "./v1/ISerializedConnectionV1";
import type { ConnectionPoint } from "../connection/connectionPoint";

export interface IBlockSerializer {
    className: string;
    serializeData: (block: BaseBlock) => any;
}

function serializedConnectionPointsEqual(a: ISerializedConnectionV1, b: ISerializedConnectionV1): boolean {
    return (
        a.inputBlock === b.inputBlock &&
        a.inputConnectionPoint === b.inputConnectionPoint &&
        a.outputBlock === b.outputBlock &&
        a.outputConnectionPoint === b.outputConnectionPoint
    );
}

export class SmartFilterSerializer {
    private readonly _blocksUsingDefaultSerialization: string[];
    private readonly _blockSerializers: IBlockSerializer[];

    /**
     * Creates a new SmartFilterSerializers
     * @param blocksUsingDefaultSerialization - A list of the classNames of blocks which can use default serialization (they only have ConnectionPoint properties and no constructor parameters)
     * @param additionalBlockSerializers - An array of block serializers to use, beyond those for the core blocks
     */
    public constructor(blocksUsingDefaultSerialization: string[], additionalBlockSerializers: IBlockSerializer[]) {
        this._blocksUsingDefaultSerialization = [OutputBlock.ClassName, ...blocksUsingDefaultSerialization];
        this._blockSerializers = [inputBlockSerializer, ...additionalBlockSerializers];
    }

    public serialize(smartFilter: SmartFilter): ISerializedSmartFilterV1 {
        const connections: ISerializedConnectionV1[] = [];

        const blocks = smartFilter.attachedBlocks.map((block: BaseBlock) => {
            const blockClassName = block.getClassName();
            let data: any = undefined;
            if (!this._blocksUsingDefaultSerialization.find((b: string) => b === blockClassName)) {
                const serializer = this._blockSerializers.find(
                    (serializer: IBlockSerializer) => serializer.className === blockClassName
                );
                if (!serializer) {
                    throw new Error(`No serializer was provided for a block of type ${blockClassName}`);
                }
                data = serializer.serializeData(block);
            }

            const serializedBlock: ISerializedBlockV1 = {
                name: block.name,
                type: block.getClassName(),
                comments: "", // TODO
                data,
            };

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
            blocks,
            connections,
        };
    }
}
