import type { SmartFilter, ISerializedBlockV1, BaseBlock } from "@babylonjs/smart-filters";
import type { Nullable } from "@babylonjs/core/types";
import type { ThinEngine } from "@babylonjs/core/Engines/thinEngine";
import { BlockNames } from "../blocks/blockNames.js";

/**
 * Custom input block deserializer to provide special behavior for input blocks in this library.
 *
 * @param smartFilter - The smart filter to create the block for
 * @param serializedBlock - The serialized block to create
 * @param engine - The engine to use
 * @returns - The instantiated block, or null if the block type is not registered
 */
export async function inputBlockDeserializer(
    smartFilter: SmartFilter,
    serializedBlock: ISerializedBlockV1,
    engine: ThinEngine
): Promise<Nullable<BaseBlock>> {
    if (serializedBlock.name === BlockNames.webCam) {
        const module = await import(
            /* webpackChunkName: "blackAndWhiteBlock" */ "../blocks/inputs/webCamInputBlock.js"
        );
        return new module.WebCamInputBlock(smartFilter, engine);
    }
    return null;
}
