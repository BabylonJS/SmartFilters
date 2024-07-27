import { InputBlockBase, InputBlock } from "./inputBlock.js";
import type { IBlockDeserializer } from "../serialization/smartFilterDeserializer.js";
import type { SerializedInputBlockData } from "./inputBlock.serialization.types.js";
import { ConnectionPointType } from "../connection/connectionPointType.js";
import type { SmartFilter } from "../smartFilter.js";
import type { ISerializedBlockV1 } from "../serialization/v1/ISerializedBlockV1.js";

export const inputBlockDeserializer: IBlockDeserializer = {
    className: InputBlockBase.ClassName,
    deserialize: (smartFilter: SmartFilter, serializedBlock: ISerializedBlockV1) => {
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
                    null // TODO: load serializedInputBlock.url if provided
                );
        }
    },
};
