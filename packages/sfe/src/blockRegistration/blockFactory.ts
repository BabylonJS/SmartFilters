/* eslint-disable @typescript-eslint/naming-convention */
import {
    type SmartFilter,
    type ISerializedBlockV1,
    type BaseBlock,
    type SmartFilterDeserializer,
} from "@babylonjs/smart-filters";
import type { Nullable } from "@babylonjs/core/types";
import type { ThinEngine } from "@babylonjs/core/Engines/thinEngine";
import type { CustomBlockManager } from "../customBlockManager";
import type { IBlockRegistration } from "@babylonjs/smart-filters-blocks";

/**
 * Creates instances of blocks upon request
 * @param smartFilter - The SmartFilter the block will belong to
 * @param engine - The ThinEngine to use
 * @param serializedBlock - The serialized block to create
 * @param customBlockManager - The manager for custom blocks
 * @param smartFilterDeserializer - The deserializer to use
 * @param builtInBlockRegistrations - The built-in block registrations
 * @returns The created block or null if the block type is not recognized
 */
export async function blockFactory(
    smartFilter: SmartFilter,
    engine: ThinEngine,
    serializedBlock: ISerializedBlockV1,
    customBlockManager: CustomBlockManager,
    smartFilterDeserializer: SmartFilterDeserializer,
    builtInBlockRegistrations: IBlockRegistration[]
): Promise<Nullable<BaseBlock>> {
    let newBlock: Nullable<BaseBlock> = null;

    // See if it's in our list of hardcoded blocks
    const registration = builtInBlockRegistrations.find(
        (registration) => registration.name === serializedBlock.blockType
    );
    if (registration && registration.factory) {
        newBlock = await registration.factory(smartFilter, engine, smartFilterDeserializer, serializedBlock);
    }
    if (!newBlock) {
        // Check if it's a custom block
        newBlock = await customBlockManager.createBlockFromBlockType(
            smartFilter,
            engine,
            serializedBlock.blockType,
            smartFilterDeserializer
        );
    }

    return newBlock;
}
