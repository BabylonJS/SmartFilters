import { type SmartFilter, type DeserializeBlockV1, type ISerializedBlockV1 } from "@babylonjs/smart-filters";
import { BlockNames } from "./blocks/blockNames";

/**
 * Generates the Map of block deserializers used when loaded serialized Smart Filters.
 *
 * Important notes:
 *   1. Do not import the block code directly in this file. Instead, use dynamic imports to ensure that the block code
 *      is only loaded when needed.
 *   2. If the deserializer is trivial (doesn't require consulting the serializedBlock.data), it can be implemented here
 *   3. If the deserializer is non-trivial (needs serializedBlock.data), implement it in a separate file alongside the block
 *      in the form blockClassName.deserializer.ts
 */
export function getBlockDeserializers(): Map<string, DeserializeBlockV1> {
    const deserializers = new Map<string, DeserializeBlockV1>();

    deserializers.set(BlockNames.pixelate, async (smartFilter: SmartFilter, serializedBlock: ISerializedBlockV1) => {
        const module = await import(/* webpackChunkName: "pixelateBlock" */ "./blocks/effects/pixelateBlock");
        return new module.PixelateBlock(smartFilter, serializedBlock.name);
    });

    deserializers.set(
        BlockNames.blackAndWhite,
        async (smartFilter: SmartFilter, serializedBlock: ISerializedBlockV1) => {
            const module = await import(
                /* webpackChunkName: "blackAndWhiteBlock" */ "./blocks/effects/blackAndWhiteBlock"
            );
            return new module.BlackAndWhiteBlock(smartFilter, serializedBlock.name);
        }
    );

    deserializers.set(BlockNames.exposure, async (smartFilter: SmartFilter, serializedBlock: ISerializedBlockV1) => {
        const module = await import(/* webpackChunkName: "exposureBlock" */ "./blocks/effects/exposureBlock");
        return new module.ExposureBlock(smartFilter, serializedBlock.name);
    });

    deserializers.set(BlockNames.contrast, async (smartFilter: SmartFilter, serializedBlock: ISerializedBlockV1) => {
        const module = await import(/* webpackChunkName: "contrastBlock" */ "./blocks/effects/contrastBlock");
        return new module.ContrastBlock(smartFilter, serializedBlock.name);
    });

    deserializers.set(BlockNames.desaturate, async (smartFilter: SmartFilter, serializedBlock: ISerializedBlockV1) => {
        const module = await import(/* webpackChunkName: "desaturateBlock" */ "./blocks/effects/desaturateBlock");
        return new module.DesaturateBlock(smartFilter, serializedBlock.name);
    });

    deserializers.set(BlockNames.posterize, async (smartFilter: SmartFilter, serializedBlock: ISerializedBlockV1) => {
        const module = await import(/* webpackChunkName: "desaturateBlock" */ "./blocks/effects/posterizeBlock");
        return new module.PosterizeBlock(smartFilter, serializedBlock.name);
    });

    deserializers.set(
        BlockNames.kaleidoscope,
        async (smartFilter: SmartFilter, serializedBlock: ISerializedBlockV1) => {
            const module = await import(/* webpackChunkName: "desaturateBlock" */ "./blocks/effects/kaleidoscopeBlock");
            return new module.KaleidoscopeBlock(smartFilter, serializedBlock.name);
        }
    );

    deserializers.set(BlockNames.greenScreen, async (smartFilter: SmartFilter, serializedBlock: ISerializedBlockV1) => {
        const module = await import(/* webpackChunkName: "desaturateBlock" */ "./blocks/effects/greenScreenBlock");
        return new module.GreenScreenBlock(smartFilter, serializedBlock.name);
    });

    deserializers.set(BlockNames.glass, async (smartFilter: SmartFilter, serializedBlock: ISerializedBlockV1) => {
        const module = await import(/* webpackChunkName: "desaturateBlock" */ "./blocks/effects/glassBlock");
        return new module.GlassBlock(smartFilter, serializedBlock.name);
    });

    deserializers.set(BlockNames.frame, async (smartFilter: SmartFilter, serializedBlock: ISerializedBlockV1) => {
        const module = await import(/* webpackChunkName: "desaturateBlock" */ "./blocks/effects/frameBlock");
        return new module.FrameBlock(smartFilter, serializedBlock.name);
    });

    deserializers.set(BlockNames.blur, async (smartFilter: SmartFilter, serializedBlock: ISerializedBlockV1) => {
        const module = await import("./blocks/effects/blurBlock.deserializer");
        return module.blurBlockDeserializer(smartFilter, serializedBlock);
    });

    deserializers.set(
        BlockNames.directionalBlur,
        async (smartFilter: SmartFilter, serializedBlock: ISerializedBlockV1) => {
            const module = await import("./blocks/effects/directionalBlurBlock.deserializer");
            return module.directionalBlurDeserializer(smartFilter, serializedBlock);
        }
    );

    return deserializers;
}
