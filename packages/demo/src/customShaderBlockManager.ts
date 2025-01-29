import type { Nullable } from "@babylonjs/core/types";
import {
    type SmartFilter,
    type ISerializedBlockV1,
    type BaseBlock,
    CustomShaderBlock,
    type SerializedBlockDefinition,
} from "@babylonjs/smart-filters";

const CustomShaderBlockKey = "Custom-Shader-Block-List";
const CustomShaderBlockDefinitionKeySuffix = "-Definition";

export class CustomShaderBlockManager {
    private _blockDefinitions = new Map<string, SerializedBlockDefinition>();

    constructor() {
        this.loadBlockDefinitions();
    }

    public getBlockDefinition(blockType: string): Nullable<SerializedBlockDefinition> {
        return this._blockDefinitions.get(blockType) || null;
    }

    public createBlock(smartFilter: SmartFilter, serializedBlock: ISerializedBlockV1): Nullable<BaseBlock> {
        const blockDefinition = this._blockDefinitions.get(serializedBlock.name);
        if (!blockDefinition) {
            return null;
        }

        return CustomShaderBlock.Create(smartFilter, serializedBlock.name, blockDefinition);
    }

    public getCustomShaderBlockTypeNames(): string[] {
        return Array.from(this._blockDefinitions.keys());
    }

    public loadBlockDefinitions() {
        this._blockDefinitions.clear();

        const blockTypeListJson = localStorage.getItem(CustomShaderBlockKey);
        const blockTypeList: string[] = blockTypeListJson ? JSON.parse(blockTypeListJson) : [];

        for (const blockType of blockTypeList) {
            const blockDefinitionJson = localStorage.getItem(blockType + CustomShaderBlockDefinitionKeySuffix);
            if (blockDefinitionJson) {
                const blockDefinition: SerializedBlockDefinition = JSON.parse(blockDefinitionJson);
                this._blockDefinitions.set(blockType, blockDefinition);
            }
        }
    }

    public deleteBlockDefinition(blockType: string) {
        const blockTypeListJson = localStorage.getItem(CustomShaderBlockKey);
        const blockTypeList: string[] = blockTypeListJson ? JSON.parse(blockTypeListJson) : [];

        const index = blockTypeList.indexOf(blockType);
        if (index > -1) {
            blockTypeList.splice(index, 1);
            this._blockDefinitions.delete(blockType);
            localStorage.setItem(CustomShaderBlockKey, JSON.stringify(blockTypeList));
            localStorage.removeItem(blockType + CustomShaderBlockDefinitionKeySuffix);
        }
    }

    public saveBlockDefinition(blockDefinition: SerializedBlockDefinition) {
        this.deleteBlockDefinition(blockDefinition.blockType);

        // Add to the stored list of block definition names in local storage
        const blockTypeListJson = localStorage.getItem(CustomShaderBlockKey);
        const blockTypeList: string[] = blockTypeListJson ? JSON.parse(blockTypeListJson) : [];
        blockTypeList.push(blockDefinition.blockType);
        localStorage.setItem(CustomShaderBlockKey, JSON.stringify(blockTypeList));

        // Store the definition in local storage
        localStorage.setItem(
            blockDefinition.blockType + CustomShaderBlockDefinitionKeySuffix,
            JSON.stringify(blockDefinition)
        );

        // Store the definition in our map in memory
        this._blockDefinitions.set(blockDefinition.blockType, blockDefinition);
    }
}
