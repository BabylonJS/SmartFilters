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

const SavedCustomBlockKeysName = "Custom-Block-List";
const SavedCustomBlockDefinitionNameSuffix = "-Definition";

/**
 * Loads and saves SerializedBlockDefinitions from local storage, and
 * creates CustomShaderBlocks and CustomAggregateBlocks from them.
 */
export class CustomBlockManager {
    /**
     * Map of encoded namespace, block type pairs to block definitions.
     */
    private _customBlockDefinitions = new Map<string, SerializedBlockDefinition>();
    private readonly _engine: ThinEngine;

    constructor(engine: ThinEngine) {
        this._engine = engine;
        this.loadBlockDefinitions();
    }

    /**
     * Gets a block definition for a given block type.
     * @param customBlockKey - The namespace and type of the block to get the definition for
     * @returns The block definition, or null if it doesn't exist
     */
    public getBlockDefinition(customBlockKey: string): Nullable<SerializedBlockDefinition> {
        return this._customBlockDefinitions.get(customBlockKey) || null;
    }

    /**
     * Instantiates a block from a block type.
     * @param smartFilter - The smart filter to create the block for
     * @param blockType - The block type to create
     * @param namespace - The namespace of the block to create
     * @param smartFilterDeserializer - The deserializer to use
     * @returns The instantiated block, or null if the block type is not registered
     */
    public async createBlockFromBlockTypeAndNamespace(
        smartFilter: SmartFilter,
        blockType: string,
        namespace: Nullable<string>,
        smartFilterDeserializer: SmartFilterDeserializer
    ): Promise<Nullable<BaseBlock>> {
        const blockDefinition = this.getBlockDefinition(this._getKey(blockType, namespace));
        if (!blockDefinition) {
            return null;
        }

        return this.createBlockFromBlockDefinition(smartFilter, blockDefinition, smartFilterDeserializer);
    }

    /**
     * Instantiates a block from a saved block definition.
     * @param smartFilter - The smart filter to create the block for
     * @param blockDefinition - The serialized block definition
     * @param smartFilterDeserializer - The deserializer to use
     * @returns The instantiated block, or null if the block type is not registered
     */
    public async createBlockFromBlockDefinition(
        smartFilter: SmartFilter,
        blockDefinition: SerializedBlockDefinition,
        smartFilterDeserializer: SmartFilterDeserializer
    ): Promise<BaseBlock> {
        switch (blockDefinition.format) {
            case "shaderBlockDefinition":
                return CustomShaderBlock.Create(smartFilter, this._getDefaultName(blockDefinition), blockDefinition);
            case "smartFilter":
                return CustomAggregateBlock.Create(
                    smartFilter,
                    this._engine,
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
     * Returns a list of all the loaded custom block type keys.
     * @returns The list of custom block keys
     */
    public getCustomBlockKeys(): string[] {
        return Array.from(this._customBlockDefinitions.keys());
    }

    /**
     * Loads all block definitions from local storage.
     */
    public loadBlockDefinitions() {
        this._customBlockDefinitions.clear();

        const blockKeys = this._readBlockKeysFromLocalStorage();

        for (const blockKey of blockKeys) {
            const blockDefinitionJson = localStorage.getItem(blockKey + SavedCustomBlockDefinitionNameSuffix);
            if (blockDefinitionJson) {
                const blockDefinition: SerializedShaderBlockDefinition = JSON.parse(blockDefinitionJson);
                this._customBlockDefinitions.set(blockKey, blockDefinition);
            }
        }
    }

    /**
     * Deletes a block definition from local storage.
     * @param blockType - The block type to delete
     * @param namespace - The namespace of the block to delete
     */
    public deleteBlockDefinition(blockType: string, namespace: Nullable<string>) {
        const blockTypeList = this._readBlockKeysFromLocalStorage();

        const index = blockTypeList.indexOf(this._getKey(blockType, namespace));
        if (index > -1) {
            blockTypeList.splice(index, 1);
            this._customBlockDefinitions.delete(blockType);
            localStorage.setItem(SavedCustomBlockKeysName, JSON.stringify(blockTypeList));
            localStorage.removeItem(blockType + SavedCustomBlockDefinitionNameSuffix);
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

        this.deleteBlockDefinition(blockType, blockDefinition.namespace);

        // Add to the stored list of block keys in local storage
        const blockKeyList = this._readBlockKeysFromLocalStorage();
        blockKeyList.push(this._getKey(blockType, blockDefinition.namespace));
        localStorage.setItem(SavedCustomBlockKeysName, JSON.stringify(blockKeyList));

        // Store the definition in local storage
        localStorage.setItem(blockType + SavedCustomBlockDefinitionNameSuffix, JSON.stringify(blockDefinition));

        // Store the definition in our map in memory
        this._customBlockDefinitions.set(blockType, blockDefinition);

        return blockDefinition;
    }

    private _readBlockKeysFromLocalStorage(): string[] {
        const blockTypeListJson = localStorage.getItem(SavedCustomBlockKeysName);
        let blockKeysList: string[] = [];
        if (blockTypeListJson) {
            try {
                blockKeysList = JSON.parse(blockTypeListJson);
            } catch {
                console.warn("Failed to parse Custom Block list from local storage");
            }
        }

        return blockKeysList;
    }

    private _getKey(blockType: string, namespace: Nullable<string>): string {
        return namespace ? `${namespace}:${blockType}` : blockType;
    }
}
