import { InputBlock } from "./inputBlock.js";
import type { SerializedInputBlockData } from "./inputBlock.serialization.types.js";
import { ConnectionPointType } from "../connection/connectionPointType.js";
import type { SmartFilter } from "../smartFilter.js";
import type { ISerializedBlockV1 } from "../serialization/v1/serialization.types.js";
import { createImageTexture } from "../utils/textureLoaders.js";
import type { ThinEngine } from "@babylonjs/core/Engines/thinEngine.js";

/**
 * V1 Input Block Deserializer
 * @param smartFilter - The SmartFilter to deserialize the block into
 * @param serializedBlock - The serialized block data
 * @param engine - The ThinEngine to use for loading textures
 * @returns A deserialized InputBlock
 */
export function inputBlockDeserializer(
    smartFilter: SmartFilter,
    serializedBlock: ISerializedBlockV1,
    engine: ThinEngine
) {
    const blockData = serializedBlock.data as SerializedInputBlockData;

    switch (blockData.inputType) {
        case ConnectionPointType.Boolean:
            return new InputBlock(smartFilter, serializedBlock.name, ConnectionPointType.Boolean, blockData.value);
        case ConnectionPointType.Float:
            return new InputBlock(smartFilter, serializedBlock.name, ConnectionPointType.Float, blockData.value);
        case ConnectionPointType.Texture:
            return new InputBlock(
                smartFilter,
                serializedBlock.name,
                ConnectionPointType.Texture,
                blockData.url !== null ? createImageTexture(engine, blockData.url) : null
            );
        case ConnectionPointType.Color3:
            return new InputBlock(smartFilter, serializedBlock.name, ConnectionPointType.Color3, blockData.value);
    }

    throw new Error("Could not deserialize input block, unknown input type");
}
