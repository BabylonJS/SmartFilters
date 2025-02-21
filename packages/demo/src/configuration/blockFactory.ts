/* eslint-disable @typescript-eslint/naming-convention */
import {
    type SmartFilter,
    type DeserializeBlockV1,
    type ISerializedBlockV1,
    type BaseBlock,
    CustomShaderBlock,
    type SmartFilterDeserializer,
    CustomAggregateBlock,
} from "@babylonjs/smart-filters";
import { BlockNames } from "./blocks/blockNames";
import type { Nullable } from "@babylonjs/core/types";
import type { ThinEngine } from "@babylonjs/core/Engines/thinEngine";
import type { CustomBlockManager } from "../customBlockManager";

/**
 * Creates instances of blocks upon request
 * @param smartFilter - The SmartFilter the block will belong to
 * @param engine - The ThinEngine to use
 * @param serializedBlock - The serialized block to create
 * @param customBlockManager - The manager for custom blocks
 * @param smartFilterDeserializer - The deserializer to use
 */
export async function blockFactory(
    smartFilter: SmartFilter,
    engine: ThinEngine,
    serializedBlock: ISerializedBlockV1,
    customBlockManager: CustomBlockManager,
    smartFilterDeserializer: SmartFilterDeserializer
): Promise<Nullable<BaseBlock>> {
    let newBlock: Nullable<BaseBlock> = null;

    // See if it's in our list of hardcoded blocks
    const deserializer = deserializers.get(serializedBlock.blockType);
    if (deserializer) {
        newBlock = await deserializer(smartFilter, serializedBlock, engine, smartFilterDeserializer);
    }
    if (!newBlock) {
        // Check if it's a custom block
        newBlock = await customBlockManager.createBlockFromBlockTypeAndNamespace(
            smartFilter,
            serializedBlock.blockType,
            serializedBlock.namespace,
            smartFilterDeserializer
        );
    }

    return newBlock;
}

/**
 * The Map of block deserializers used when loaded serialized Smart Filters.
 *
 * Important notes:
 *   1. Do not import the block code directly in this file. Instead, use dynamic imports to ensure that the block code
 *      is only loaded when needed.
 *   2. If the deserializer is trivial (doesn't require consulting the serializedBlock.data), it can be implemented here
 *   3. If the deserializer is non-trivial (needs serializedBlock.data), implement it in a separate file alongside the block
 *      in the form blockClassName.deserializer.ts
 */
const deserializers = new Map<string, DeserializeBlockV1>();

// Deserializing blocks defined by serialized definitions
// ------------------------------------------------------
deserializers.set(BlockNames.tint, async (smartFilter: SmartFilter, serializedBlock: ISerializedBlockV1) => {
    const { deserializedTintBlockDefinition } = await import(
        /* webpackChunkName: "tintBlock" */ "./blocks/effects/tintBlock"
    );
    return CustomShaderBlock.Create(smartFilter, serializedBlock.name, deserializedTintBlockDefinition);
});
deserializers.set(
    BlockNames.pixelateAndDesaturate,
    async (
        smartFilter: SmartFilter,
        serializedBlock: ISerializedBlockV1,
        engine: ThinEngine,
        smartFilterDeserializer: SmartFilterDeserializer
    ) => {
        const { pixelateAndDesaturateBlockDefinition } = await import(
            /* webpackChunkName: "pixelateAndDesaturateBlock" */ "./blocks/effects/pixelateAndDesaturateBlock"
        );
        return CustomAggregateBlock.Create(
            smartFilter,
            engine,
            serializedBlock.name,
            pixelateAndDesaturateBlockDefinition,
            smartFilterDeserializer
        );
    }
);

// Trivial deserializers of hardcoded blocks
// -----------------------------------------
deserializers.set(BlockNames.pixelate, async (smartFilter: SmartFilter, serializedBlock: ISerializedBlockV1) => {
    const { PixelateBlock } = await import(/* webpackChunkName: "pixelateBlock" */ "./blocks/effects/pixelateBlock");
    return new PixelateBlock(smartFilter, serializedBlock.name);
});

deserializers.set(BlockNames.blackAndWhite, async (smartFilter: SmartFilter, serializedBlock: ISerializedBlockV1) => {
    const { BlackAndWhiteBlock } = await import(
        /* webpackChunkName: "blackAndWhiteBlock" */ "./blocks/effects/blackAndWhiteBlock"
    );
    return new BlackAndWhiteBlock(smartFilter, serializedBlock.name);
});

deserializers.set(BlockNames.exposure, async (smartFilter: SmartFilter, serializedBlock: ISerializedBlockV1) => {
    const { ExposureBlock } = await import(/* webpackChunkName: "exposureBlock" */ "./blocks/effects/exposureBlock");
    return new ExposureBlock(smartFilter, serializedBlock.name);
});

deserializers.set(BlockNames.contrast, async (smartFilter: SmartFilter, serializedBlock: ISerializedBlockV1) => {
    const { ContrastBlock } = await import(/* webpackChunkName: "contrastBlock" */ "./blocks/effects/contrastBlock");
    return new ContrastBlock(smartFilter, serializedBlock.name);
});

deserializers.set(BlockNames.desaturate, async (smartFilter: SmartFilter, serializedBlock: ISerializedBlockV1) => {
    const { DesaturateBlock } = await import(
        /* webpackChunkName: "desaturateBlock" */ "./blocks/effects/desaturateBlock"
    );
    return new DesaturateBlock(smartFilter, serializedBlock.name);
});

deserializers.set(BlockNames.posterize, async (smartFilter: SmartFilter, serializedBlock: ISerializedBlockV1) => {
    const { PosterizeBlock } = await import(/* webpackChunkName: "posterizeBlock" */ "./blocks/effects/posterizeBlock");
    return new PosterizeBlock(smartFilter, serializedBlock.name);
});

deserializers.set(BlockNames.kaleidoscope, async (smartFilter: SmartFilter, serializedBlock: ISerializedBlockV1) => {
    const { KaleidoscopeBlock } = await import(
        /* webpackChunkName: "kaleidoscopeBlock" */ "./blocks/effects/kaleidoscopeBlock"
    );
    return new KaleidoscopeBlock(smartFilter, serializedBlock.name);
});

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

deserializers.set(BlockNames.mask, async (smartFilter: SmartFilter, serializedBlock: ISerializedBlockV1) => {
    const { MaskBlock } = await import(/* webpackChunkName: "maskBlock" */ "./blocks/effects/maskBlock");
    return new MaskBlock(smartFilter, serializedBlock.name);
});

deserializers.set(BlockNames.vhsGlitch, async (smartFilter: SmartFilter, serializedBlock: ISerializedBlockV1) => {
    const { VhsGlitchBlock } = await import(/* webpackChunkName: "vhsGlitchBlock" */ "./blocks/effects/vhsGlitchBlock");
    return new VhsGlitchBlock(smartFilter, serializedBlock.name);
});

deserializers.set(BlockNames.softThreshold, async (smartFilter: SmartFilter, serializedBlock: ISerializedBlockV1) => {
    const { SoftThresholdBlock } = await import(
        /* webpackChunkName: "softThresholdBlock" */ "./blocks/effects/softThresholdBlock"
    );
    return new SoftThresholdBlock(smartFilter, serializedBlock.name);
});

deserializers.set(BlockNames.sketch, async (smartFilter: SmartFilter, serializedBlock: ISerializedBlockV1) => {
    const { SketchBlock } = await import(/* webpackChunkName: "sketchBlock" */ "./blocks/effects/sketchBlock");
    return new SketchBlock(smartFilter, serializedBlock.name);
});

deserializers.set(BlockNames.spritesheet, async (smartFilter: SmartFilter, serializedBlock: ISerializedBlockV1) => {
    const { SpritesheetBlock } = await import(
        /* webpackChunkName: "spritesheetBlock" */ "./blocks/effects/spritesheetBlock"
    );
    return new SpritesheetBlock(smartFilter, serializedBlock.name);
});

deserializers.set(
    BlockNames.premultiplyAlpha,
    async (smartFilter: SmartFilter, serializedBlock: ISerializedBlockV1) => {
        const { PremultiplyAlphaBlock } = await import(
            /* webpackChunkName: "premultiplyAlphaBlock" */ "./blocks/utility/premultiplyAlphaBlock"
        );
        return new PremultiplyAlphaBlock(smartFilter, serializedBlock.name);
    }
);

// Custom deserializers for hardcoded blocks that require additional data
// ----------------------------------------------------------------------

deserializers.set(BlockNames.blur, async (smartFilter: SmartFilter, serializedBlock: ISerializedBlockV1) => {
    const { blurBlockDeserializer } = await import(
        /* webpackChunkName: "blurBlockDeserializer" */ "./blocks/effects/blurBlock.deserializer"
    );
    return blurBlockDeserializer(smartFilter, serializedBlock);
});

deserializers.set(BlockNames.directionalBlur, async (smartFilter: SmartFilter, serializedBlock: ISerializedBlockV1) => {
    const { directionalBlurDeserializer } = await import(
        /* webpackChunkName: "directionalBlurBlockDeserializer" */ "./blocks/effects/directionalBlurBlock.deserializer"
    );
    return directionalBlurDeserializer(smartFilter, serializedBlock);
});

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
