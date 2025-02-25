import type { ThinEngine } from "@babylonjs/core/Engines/thinEngine";
import type { Nullable } from "@babylonjs/core/types";
import {
    type SmartFilter,
    type BaseBlock,
    CustomShaderBlock,
    type SerializedShaderBlockDefinition,
    importCustomBlockDefinition,
    type SerializedBlockDefinition,
    CustomAggregateBlock,
    type SmartFilterDeserializer,
} from "@babylonjs/smart-filters";

const SavedCustomBlockListKey = "Custom-Block-List";
const SavedCustomBlockDefinitionKeySuffix = "-Definition";

/**
 * Loads and saves SerializedBlockDefinitions from local storage, and
 * creates CustomShaderBlocks and CustomAggregateBlocks from them.
 */
export class CustomBlockManager {
    private _customBlockDefinitions = new Map<string, SerializedBlockDefinition>();

    /**
     * Creates a new CustomBlockManager.
     */
    constructor() {
        this.loadBlockDefinitions();
    }

    /**
     * Gets a block definition for a given block type.
     * @param blockType - The block type to get the definition for
     * @returns The block definition, or null if it doesn't exist
     */
    public getBlockDefinition(blockType: string): Nullable<SerializedBlockDefinition> {
        return this._customBlockDefinitions.get(blockType) || null;
    }

    /**
     * Instantiates a block from a block type.
     * @param smartFilter - The Smart Filter to create the block for
     * @param engine - The engine to use
     * @param blockType - The block type to create
     * @param smartFilterDeserializer - The deserializer to use
     * @returns The instantiated block, or null if the block type is not registered
     */
    public async createBlockFromBlockType(
        smartFilter: SmartFilter,
        engine: ThinEngine,
        blockType: string,
        smartFilterDeserializer: SmartFilterDeserializer
    ): Promise<Nullable<BaseBlock>> {
        const blockDefinition = this.getBlockDefinition(blockType);
        if (!blockDefinition) {
            return null;
        }

        return this.createBlockFromBlockDefinition(smartFilter, engine, blockDefinition, smartFilterDeserializer);
    }

    /**
     * Instantiates a block from a saved block definition.
     * @param smartFilter - The Smart Filter to create the block for
     * @param engine - The engine to use
     * @param blockDefinition - The serialized block definition
     * @param smartFilterDeserializer - The deserializer to use
     * @returns The instantiated block, or null if the block type is not registered
     */
    public async createBlockFromBlockDefinition(
        smartFilter: SmartFilter,
        engine: ThinEngine,
        blockDefinition: SerializedBlockDefinition,
        smartFilterDeserializer: SmartFilterDeserializer
    ): Promise<BaseBlock> {
        switch (blockDefinition.format) {
            case "shaderBlockDefinition":
                return CustomShaderBlock.Create(smartFilter, this._getDefaultName(blockDefinition), blockDefinition);
            case "smartFilter":
                return CustomAggregateBlock.Create(
                    smartFilter,
                    engine,
                    this._getDefaultName(blockDefinition),
                    blockDefinition,
                    smartFilterDeserializer
                );
        }
    }

    private _getDefaultName(blockDefinition: SerializedBlockDefinition): string {
        return blockDefinition.blockType.replace("Block", "");
    }

    /**
     * Returns a list of all the loaded custom block type names.
     * @returns The list of block type names
     */
    public getCustomBlockTypeNames(): string[] {
        return Array.from(this._customBlockDefinitions.keys());
    }

    /**
     * Loads all block definitions from local storage.
     */
    public loadBlockDefinitions() {
        this._customBlockDefinitions.clear();

        const blockTypeList = this._readBlockTypeListFromLocalStorage();

        for (const blockType of blockTypeList) {
            const blockDefinitionJson = localStorage.getItem(blockType + SavedCustomBlockDefinitionKeySuffix);
            if (blockDefinitionJson) {
                const blockDefinition: SerializedShaderBlockDefinition = JSON.parse(blockDefinitionJson);
                this._customBlockDefinitions.set(blockType, blockDefinition);
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
            this._customBlockDefinitions.delete(blockType);
            localStorage.setItem(SavedCustomBlockListKey, JSON.stringify(blockTypeList));
            localStorage.removeItem(blockType + SavedCustomBlockDefinitionKeySuffix);
        }
    }

    /**
     * Saves a block definition to local storage.
     * @param serializedData - The serialized block definition - either a SerializedBlockDefinition object in a JSON string, or a glsl shader
     * @returns The block definition that was saved
     */
    public saveBlockDefinition(serializedData: string): SerializedBlockDefinition {
        const blockDefinition = importCustomBlockDefinition(serializedData);

        let blockType: string;
        switch (blockDefinition.format) {
            case "shaderBlockDefinition": {
                blockType = blockDefinition.blockType;
                break;
            }
            case "smartFilter": {
                blockType = blockDefinition.name;
                break;
            }
        }

        this.deleteBlockDefinition(blockType);

        // Add to the stored list of block definition names in local storage
        const blockTypeList = this._readBlockTypeListFromLocalStorage();
        blockTypeList.push(blockType);
        localStorage.setItem(SavedCustomBlockListKey, JSON.stringify(blockTypeList));

        // Store the definition in local storage
        localStorage.setItem(blockType + SavedCustomBlockDefinitionKeySuffix, JSON.stringify(blockDefinition));

        // Store the definition in our map in memory
        this._customBlockDefinitions.set(blockType, blockDefinition);

        return blockDefinition;
    }

    private _readBlockTypeListFromLocalStorage(): string[] {
        const blockTypeListJson = localStorage.getItem(SavedCustomBlockListKey);
        let blockTypeList: string[] = [];
        if (blockTypeListJson) {
            try {
                blockTypeList = JSON.parse(blockTypeListJson);
            } catch {
                console.warn("Failed to parse Custom Block list from local storage");
            }
        }

        return blockTypeList;
    }
}
