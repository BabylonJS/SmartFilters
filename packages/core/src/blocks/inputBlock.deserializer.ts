import { InputBlock } from "./inputBlock.js";
import type { SerializedInputBlockData } from "./inputBlock.serialization.types.js";
import { ConnectionPointType } from "../connection/connectionPointType.js";
import type { SmartFilter } from "../smartFilter.js";
import type { ISerializedBlockV1 } from "../serialization/v1/serialization.types.js";
import { createImageTexture } from "../utils/textureLoaders.js";
import type { ThinEngine } from "@babylonjs/core/Engines/thinEngine.js";
import type { Nullable } from "@babylonjs/core/types.js";
import type { ThinTexture } from "@babylonjs/core/Materials/Textures/thinTexture.js";
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
        case ConnectionPointType.Texture: {
            // Apply flipY default
            blockData.flipY = blockData.flipY ?? true;

            // If information necessary to load an image was serialized, load the image
            const texture: Nullable<ThinTexture> = blockData.url
                ? createImageTexture(engine, blockData.url, blockData.flipY)
                : null;
            if (texture && blockData.anisotropicFilteringLevel !== null) {
                texture.anisotropicFilteringLevel = blockData.anisotropicFilteringLevel;
            }

            // Create the input block
            const inputBlock = new InputBlock(smartFilter, serializedBlock.name, ConnectionPointType.Texture, texture);

            // If editor data was serialized, set it on the deserialized block
            inputBlock.editorData = {
                url: blockData.url,
                anisotropicFilteringLevel: blockData.anisotropicFilteringLevel,
                flipY: blockData.flipY,
                forcedExtension: blockData.forcedExtension,
            };

            return inputBlock;
        }
    }

    throw new Error("Could not deserialize input block, unknown input type");
}
