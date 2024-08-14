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
        const { PixelateBlock } = await import(
            /* webpackChunkName: "pixelateBlock" */ "./blocks/effects/pixelateBlock"
        );
        return new PixelateBlock(smartFilter, serializedBlock.name);
    });

    deserializers.set(
        BlockNames.blackAndWhite,
        async (smartFilter: SmartFilter, serializedBlock: ISerializedBlockV1) => {
            const { BlackAndWhiteBlock } = await import(
                /* webpackChunkName: "blackAndWhiteBlock" */ "./blocks/effects/blackAndWhiteBlock"
            );
            return new BlackAndWhiteBlock(smartFilter, serializedBlock.name);
        }
    );

    deserializers.set(BlockNames.exposure, async (smartFilter: SmartFilter, serializedBlock: ISerializedBlockV1) => {
        const { ExposureBlock } = await import(
            /* webpackChunkName: "exposureBlock" */ "./blocks/effects/exposureBlock"
        );
        return new ExposureBlock(smartFilter, serializedBlock.name);
    });

    deserializers.set(BlockNames.contrast, async (smartFilter: SmartFilter, serializedBlock: ISerializedBlockV1) => {
        const { ContrastBlock } = await import(
            /* webpackChunkName: "contrastBlock" */ "./blocks/effects/contrastBlock"
        );
        return new ContrastBlock(smartFilter, serializedBlock.name);
    });

    deserializers.set(BlockNames.desaturate, async (smartFilter: SmartFilter, serializedBlock: ISerializedBlockV1) => {
        const { DesaturateBlock } = await import(
            /* webpackChunkName: "desaturateBlock" */ "./blocks/effects/desaturateBlock"
        );
        return new DesaturateBlock(smartFilter, serializedBlock.name);
    });

    // TODO: Can I make this all more generic? Or at least something more like how serializers are defined?
    //       Or is it because of the dynamic imports-- can their paths not be generated programmatically?

    deserializers.set(BlockNames.posterize, async (smartFilter: SmartFilter, serializedBlock: ISerializedBlockV1) => {
        const { PosterizeBlock } = await import(
            /* webpackChunkName: "posterizeBlock" */ "./blocks/effects/posterizeBlock"
        );
        return new PosterizeBlock(smartFilter, serializedBlock.name);
    });

    deserializers.set(
        BlockNames.kaleidoscope,
        async (smartFilter: SmartFilter, serializedBlock: ISerializedBlockV1) => {
            const { KaleidoscopeBlock } = await import(
                /* webpackChunkName: "kaleidoscopeBlock" */ "./blocks/effects/kaleidoscopeBlock"
            );
            return new KaleidoscopeBlock(smartFilter, serializedBlock.name);
        }
    );

    deserializers.set(BlockNames.greenScreen, async (smartFilter: SmartFilter, serializedBlock: ISerializedBlockV1) => {
        const { GreenScreenBlock } = await import(
            /* webpackChunkName: "greenScreenBlock" */ "./blocks/effects/greenScreenBlock"
        );
        return new GreenScreenBlock(smartFilter, serializedBlock.name);
    });

    deserializers.set(BlockNames.glass, async (smartFilter: SmartFilter, serializedBlock: ISerializedBlockV1) => {
        const { GlassBlock } = await import(/* webpackChunkName: "glassBlock" */ "./blocks/effects/glassBlock");
        return new GlassBlock(smartFilter, serializedBlock.name);
    });

    deserializers.set(BlockNames.frame, async (smartFilter: SmartFilter, serializedBlock: ISerializedBlockV1) => {
        const { FrameBlock } = await import(/* webpackChunkName: "frameBlock" */ "./blocks/effects/frameBlock");
        return new FrameBlock(smartFilter, serializedBlock.name);
    });

    deserializers.set(
        BlockNames.blackAndWhiteAndBlur,
        async (smartFilter: SmartFilter, serializedBlock: ISerializedBlockV1) => {
            const { BlackAndWhiteAndBlurBlock } = await import(
                /* webpackChunkName: "blackAndWhiteAndBlurBlock" */ "./blocks/effects/blackAndWhiteAndBlurBlock"
            );
            return new BlackAndWhiteAndBlurBlock(smartFilter, serializedBlock.name);
        }
    );

    deserializers.set(BlockNames.glitch, async (smartFilter: SmartFilter, serializedBlock: ISerializedBlockV1) => {
        const { GlitchBlock } = await import(/* webpackChunkName: "glitchBlock" */ "./blocks/transitions/glitchBlock");
        return new GlitchBlock(smartFilter, serializedBlock.name);
    });

    // Non-trivial deserializers begin.
    // Their deserializer functions import the block directly in their files, so they're only loaded when needed.
    // TODO: These blocks only have public class properties that are being put in the .data field.
    //       Some of those props look like they could possibly be connection points instead of props...?
    // TODO: On that note, if they stay as props, should they have UI to edit them? Like the webcam source does?

    deserializers.set(BlockNames.blur, async (smartFilter: SmartFilter, serializedBlock: ISerializedBlockV1) => {
        const { blurBlockDeserializer } = await import(
            /* webpackChunkName: "blurBlockDeserializer" */ "./blocks/effects/blurBlock.deserializer"
        );
        return blurBlockDeserializer(smartFilter, serializedBlock);
    });

    deserializers.set(
        BlockNames.directionalBlur,
        async (smartFilter: SmartFilter, serializedBlock: ISerializedBlockV1) => {
            const { directionalBlurDeserializer } = await import(
                /* webpackChunkName: "directionalBlurBlockDeserializer" */ "./blocks/effects/directionalBlurBlock.deserializer"
            );
            return directionalBlurDeserializer(smartFilter, serializedBlock);
        }
    );

    deserializers.set(BlockNames.composition, async (smartFilter: SmartFilter, serializedBlock: ISerializedBlockV1) => {
        const { compositionDeserializer } = await import(
            /* webpackChunkName: "compositionBlockDeserializer" */ "./blocks/effects/compositionBlock.deserializer"
        );
        return compositionDeserializer(smartFilter, serializedBlock);
    });

    deserializers.set(BlockNames.tile, async (smartFilter: SmartFilter, serializedBlock: ISerializedBlockV1) => {
        const { tileDeserializer } = await import(
            /* webpackChunkName: "tileBlockDeserializer" */ "./blocks/transitions/tileBlock.deserializer"
        );
        return tileDeserializer(smartFilter, serializedBlock);
    });

    deserializers.set(BlockNames.wipe, async (smartFilter: SmartFilter, serializedBlock: ISerializedBlockV1) => {
        const { wipeDeserializer } = await import(
            /* webpackChunkName: "wipeBlockDeserializer" */ "./blocks/transitions/wipeBlock.deserializer"
        );
        return wipeDeserializer(smartFilter, serializedBlock);
    });

    return deserializers;
}
