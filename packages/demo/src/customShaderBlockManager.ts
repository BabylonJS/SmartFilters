import type { Nullable } from "@babylonjs/core/types";
import {
    type SmartFilter,
    type ISerializedBlockV1,
    type BaseBlock,
    CustomShaderBlock,
    type SerializedBlockDefinition,
    SmartFilterShaderVersionLabel,
    importFragmentShader,
} from "@babylonjs/smart-filters";

const CustomShaderBlockListKey = "Custom-Shader-Block-List";
const CustomShaderBlockDefinitionKeySuffix = "-Definition";

/**
 * Loads and saves CustomShaderBlock definitions from local storage, and
 * creates CustomShaderBlocks from serialized block definitions.
 */
export class CustomShaderBlockManager {
    private _blockDefinitions = new Map<string, SerializedBlockDefinition>();

    constructor() {
        this.loadBlockDefinitions();
    }

    /**
     * Gets the block definition for a given block type.
     * @param blockType - The block type to get the definition for
     * @returns The block definition, or null if it doesn't exist
     */
    public getBlockDefinition(blockType: string): Nullable<SerializedBlockDefinition> {
        return this._blockDefinitions.get(blockType) || null;
    }

    /**
     * Instantiates a block from a serialized block definition.
     * @param smartFilter - The smart filter to create the block for
     * @param serializedBlock - The serialized block definition
     * @returns The instantiated block, or null if the block type is not registered
     */
    public createBlock(smartFilter: SmartFilter, serializedBlock: ISerializedBlockV1): Nullable<BaseBlock> {
        const blockDefinition = this.getBlockDefinition(serializedBlock.name);
        if (!blockDefinition) {
            return null;
        }

        return CustomShaderBlock.Create(smartFilter, serializedBlock.name, blockDefinition);
    }

    /**
     * Returns a list of all the loaded custom shader block type names.
     * @returns The list of block type names
     */
    public getCustomShaderBlockTypeNames(): string[] {
        return Array.from(this._blockDefinitions.keys());
    }

    /**
     * Loads all block definitions from local storage.
     */
    public loadBlockDefinitions() {
        this._blockDefinitions.clear();

        const blockTypeList = this._readBlockTypeListFromLocalStorage();

        for (const blockType of blockTypeList) {
            const blockDefinitionJson = localStorage.getItem(blockType + CustomShaderBlockDefinitionKeySuffix);
            if (blockDefinitionJson) {
                const blockDefinition: SerializedBlockDefinition = JSON.parse(blockDefinitionJson);
                this._blockDefinitions.set(blockType, blockDefinition);
            }
        }
    }

    /**
     * Deletes a block definition from local storage.
     * @param blockType - The block type to delete
     */
    public deleteBlockDefinition(blockType: string) {
        const blockTypeList = this._readBlockTypeListFromLocalStorage();

        const index = blockTypeList.indexOf(blockType);
        if (index > -1) {
            blockTypeList.splice(index, 1);
            this._blockDefinitions.delete(blockType);
            localStorage.setItem(CustomShaderBlockListKey, JSON.stringify(blockTypeList));
            localStorage.removeItem(blockType + CustomShaderBlockDefinitionKeySuffix);
        }
    }

    /**
     * Saves a block definition to local storage.
     * Supports either a JSON string of an SerializedBlockDefinition object, or a glsl shader with the required annotations so it can
     * be converted to a SerializedBlockDefinition object.
     * @param serializedData - The serialized block definition - either a SerializedBlockDefinition object in a JSON string, or a glsl shader
     * @returns The block definition that was saved
     */
    public saveBlockDefinition(serializedData: string): SerializedBlockDefinition {
        let blockDefinition: SerializedBlockDefinition;

        if (this._looksLikeGlsl(serializedData)) {
            blockDefinition = importFragmentShader(serializedData);
        } else {
            blockDefinition = JSON.parse(serializedData);
        }

        this.deleteBlockDefinition(blockDefinition.blockType);

        // Add to the stored list of block definition names in local storage
        const blockTypeList = this._readBlockTypeListFromLocalStorage();
        blockTypeList.push(blockDefinition.blockType);
        localStorage.setItem(CustomShaderBlockListKey, JSON.stringify(blockTypeList));

        // Store the definition in local storage
        localStorage.setItem(
            blockDefinition.blockType + CustomShaderBlockDefinitionKeySuffix,
            JSON.stringify(blockDefinition)
        );

        // Store the definition in our map in memory
        this._blockDefinitions.set(blockDefinition.blockType, blockDefinition);

        return blockDefinition;
    }

    private _looksLikeGlsl(serializedData: string): boolean {
        return serializedData.indexOf(SmartFilterShaderVersionLabel) !== -1;
    }

    private _readBlockTypeListFromLocalStorage(): string[] {
        const blockTypeListJson = localStorage.getItem(CustomShaderBlockListKey);
        let blockTypeList: string[] = [];
        if (blockTypeListJson) {
            try {
                blockTypeList = JSON.parse(blockTypeListJson);
            } catch {
                console.warn("Failed to parse Custom Shader Block list from local storage");
            }
        }

        return blockTypeList;
    }
}
