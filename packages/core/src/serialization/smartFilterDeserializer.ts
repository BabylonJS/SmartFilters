import { SmartFilter } from "../smartFilter.js";
import type { SerializedSmartFilterV1 } from "./v1/SerializedSmartFilterV1";
import type { BaseBlock } from "../blocks/baseBlock";
import type { SerializedSmartFilter } from "./serializedSmartFilter.js";
import { inputBlockDeserializer } from "../blocks/inputBlock.deserializer.js";
import type { ISerializedBlockV1 } from "./v1/ISerializedBlockV1.js";
import { OutputBlock } from "../blocks/outputBlock.js";

export interface IBlockDeserializer {
    className: string;
    deserialize: (smartFilter: SmartFilter, serializedBlock: ISerializedBlockV1) => BaseBlock;
}

export class SmartFilterDeserializer {
    private readonly _blockDeserializers: IBlockDeserializer[];

    /**
     * Creates a new SmartFilterDeserializer
     * @param additionalBlockDeserializers - An array of block serializers to use, beyond those for the core blocks
     */
    public constructor(additionalBlockDeserializers: IBlockDeserializer[]) {
        this._blockDeserializers = [inputBlockDeserializer, ...additionalBlockDeserializers];
    }

    public deserialize(serializedData: string): SmartFilter {
        const serializedSmartFilter: SerializedSmartFilter = JSON.parse(serializedData);
        switch (serializedSmartFilter.version) {
            case 1:
                return this.deserializeV1(serializedSmartFilter);
        }
    }

    private deserializeV1(serializedSmartFilter: SerializedSmartFilterV1): SmartFilter {
        const smartFilter = new SmartFilter(serializedSmartFilter.name);
        const blockMap = new Map<string, BaseBlock>();

        serializedSmartFilter.blocks.forEach((serializedBlock: ISerializedBlockV1) => {
            if (serializedBlock.className === OutputBlock.ClassName) {
                blockMap.set(OutputBlock.ClassName, smartFilter.output.ownerBlock);
            } else {
                const blockDeserializer = this._blockDeserializers.find(
                    (bd) => bd.className === serializedBlock.className
                );
                if (!blockDeserializer) {
                    throw new Error(`No deserializer found for block type ${serializedBlock.className}`);
                }
                const newBlock = blockDeserializer.deserialize(smartFilter, serializedBlock);

                blockMap.set(newBlock.name, newBlock);
            }
        });

        return smartFilter;
    }
}
