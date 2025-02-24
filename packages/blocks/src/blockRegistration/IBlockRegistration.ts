import type { ThinEngine } from "@babylonjs/core/Engines/thinEngine";
import type { BaseBlock, ISerializedBlockV1, SmartFilter, SmartFilterDeserializer } from "@babylonjs/smart-filters";

/**
 * An object which describes a block definition, as well as a factory for creating a new instance of the block or
 * deserializing it
 */
export interface IBlockRegistration {
    /**
     * The name of the block
     */
    //TODO: rename to blockType
    name: string;

    /**
     * Creates an instance of the block, either fresh or deserialized from a serialized block
     * @param smartFilter - The smart filter to create the block for
     * @param engine - The engine to use for creating blocks
     * @param smartFilterDeserializer - The deserializer to use for deserializing blocks
     * @param serializedBlock - The serialized block to deserialize, if any
     * @returns - A promise for a new instance of the block
     */
    factory?: (
        smartFilter: SmartFilter,
        engine: ThinEngine,
        smartFilterDeserializer: SmartFilterDeserializer,
        serializedBlock?: ISerializedBlockV1
    ) => Promise<BaseBlock>;

    /**
     * The category of the block
     */
    category: string;

    /**
     * A tooltip for the block if displayed in an editor, for instance
     */
    tooltip: string;
}
