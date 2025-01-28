import type { SmartFilter, ISerializedBlockV1, BaseBlock } from "@babylonjs/smart-filters";
import type { Nullable } from "@babylonjs/core/types";
import type { ThinEngine } from "@babylonjs/core/Engines/thinEngine";
import { WebCamInputBlock, WebCamInputBlockName } from "./blocks/inputs/webCamInputBlock";

export async function inputBlockDeserializer(
    smartFilter: SmartFilter,
    serializedBlock: ISerializedBlockV1,
    engine: ThinEngine
): Promise<Nullable<BaseBlock>> {
    if (serializedBlock.name === WebCamInputBlockName) {
        return new WebCamInputBlock(smartFilter, engine);
    }
    return null;
}
