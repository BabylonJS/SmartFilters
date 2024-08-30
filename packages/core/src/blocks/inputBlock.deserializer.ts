import { InputBlock } from "./inputBlock.js";
import type { SerializedInputBlockData } from "./inputBlock.serialization.types.js";
import { ConnectionPointType } from "../connection/connectionPointType.js";
import type { SmartFilter } from "../smartFilter.js";
import type { ISerializedBlockV1 } from "../serialization/v1/serialization.types.js";

/**
 * V1 Input Block Deserializer
 * @param smartFilter - The SmartFilter to deserialize the block into
 * @param serializedBlock - The serialized block data
 * @returns A deserialized InputBlock
 */
export function inputBlockDeserializer(smartFilter: SmartFilter, serializedBlock: ISerializedBlockV1) {
    const blockData = serializedBlock.data as SerializedInputBlockData;

    switch (blockData.inputType) {
        case ConnectionPointType.Boolean:
            return new InputBlock(smartFilter, serializedBlock.name, ConnectionPointType.Boolean, blockData.value);
        case ConnectionPointType.Float:
            return new InputBlock(smartFilter, serializedBlock.name, ConnectionPointType.Float, blockData.value);
        case ConnectionPointType.Texture: {
            // Create the input block
            const inputBlock = new InputBlock(smartFilter, serializedBlock.name, ConnectionPointType.Texture, null);

            // If editor data was serialized, set it on the deserialized block
            inputBlock.editorData = {
                url: blockData.url,
                urlTypeHint: blockData.urlTypeHint,
                anisotropicFilteringLevel: blockData.anisotropicFilteringLevel,
                flipY: blockData.flipY,
                forcedExtension: blockData.forcedExtension,
            };

            return inputBlock;
        }
        case ConnectionPointType.Color3:
            return new InputBlock(smartFilter, serializedBlock.name, ConnectionPointType.Color3, blockData.value);
        case ConnectionPointType.Color4:
            return new InputBlock(smartFilter, serializedBlock.name, ConnectionPointType.Color4, blockData.value);
        case ConnectionPointType.Vector2:
            return new InputBlock(smartFilter, serializedBlock.name, ConnectionPointType.Vector2, blockData.value);
    }

    throw new Error("Could not deserialize input block, unknown input type");
}
