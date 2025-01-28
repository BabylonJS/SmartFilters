/* eslint-disable @typescript-eslint/naming-convention */
import {
    type SmartFilter,
    type DeserializeBlockV1,
    type ISerializedBlockV1,
    type BaseBlock,
    type SerializedBlockDefinition,
    CustomShaderBlock,
} from "@babylonjs/smart-filters";
import { BlockNames } from "./blocks/blockNames";
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

// TODO: simplify this file - maybe just have one map?
// TODO: generate .JSON using the build tool
/**
 * Creates instances of blocks upon request
 * @param smartFilter - The SmartFilter the block will belong to
 * @param engine - The ThinEngine to use
 * @param serializedBlock - The serialized block to create
 */
export async function blockFactory(
    smartFilter: SmartFilter,
    engine: ThinEngine,
    serializedBlock: ISerializedBlockV1
): Promise<Nullable<BaseBlock>> {
    let newBlock: Nullable<BaseBlock> = null;

    // See if it's our list of hardcoded blocks
    const deserializer = deserializers.get(serializedBlock.className);
    if (deserializer) {
        newBlock = await deserializer(smartFilter, serializedBlock, engine);
    }

    // If not, see if it's in our list of custom shader blocks (defined by JSON)
    if (!newBlock) {
        const blockDefinition = await getSerializedBlockDefinition(serializedBlock.className);
        if (blockDefinition) {
            newBlock = new CustomShaderBlock(smartFilter, serializedBlock.name, blockDefinition);
        }
    }

    return newBlock;
}

const serializedBlockDefinitionCache = new Map<string, SerializedBlockDefinition>();
async function getSerializedBlockDefinition(blockClassName: string): Promise<Nullable<SerializedBlockDefinition>> {
    let blockDefinition = serializedBlockDefinitionCache.get(blockClassName);

    // If not cached, see if it's in our list of known serialized blocks
    if (!blockDefinition) {
        let blockDefinitionJson: any;

        switch (blockClassName) {
            case "TintBlock":
                {
                    blockDefinitionJson = await import(
                        /* webpackChunkName: "tintBlock" */ `./blocks/effects/tintBlock.json`
                    );
                }
                break;
            default: {
                return null;
            }
        }
        blockDefinition = JSON.parse(blockDefinitionJson.default) as SerializedBlockDefinition;
        serializedBlockDefinitionCache.set(blockClassName, blockDefinition);
    }

    return blockDefinition;
}

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
const deserializers = new Map<string, DeserializeBlockV1>();

deserializers.set(BlockNames.pixelate, async (smartFilter: SmartFilter, serializedBlock: ISerializedBlockV1) => {
    const { PixelateBlock } = await import(/* webpackChunkName: "pixelateBlock" */ "./blocks/effects/pixelateBlock");
    return new PixelateBlock(smartFilter, serializedBlock.name);
});

// deserializers.set(
//     BlockNames.blackAndWhite,
//     async (smartFilter: SmartFilter, serializedBlock: ISerializedBlockV1) => {
//         const serializedBlockDefinition = getSerializedBlockDefinition(serializedBlock
//         const blockDefinitionJson = await import(
//             /* webpackChunkName: "blackAndWhiteBlock" */ "./blocks/effects/blackAndWhiteBlock.fragment.glsl"
//         );
//         const serializedBlockDefinition = JSON.parse(blockDefinitionJson.default) as SerializedBlockDefinition;
//         return new CustomShaderBlock(smartFilter, serializedBlock.name, serializedBlockDefinition);
//     }
// );

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

deserializers.set(BlockNames.starryPlanes, async (smartFilter: SmartFilter, serializedBlock: ISerializedBlockV1) => {
    const { StarryPlanesBlock } = await import(
        /* webpackChunkName: "starryPlanesBlock" */ "./blocks/generators/starryPlanesBlock"
    );
    return new StarryPlanesBlock(smartFilter, serializedBlock.name);
});

deserializers.set(BlockNames.tunnel, async (smartFilter: SmartFilter, serializedBlock: ISerializedBlockV1) => {
    const { TunnelBlock } = await import(/* webpackChunkName: "tunnelBlock" */ "./blocks/generators/tunnelBlock");
    return new TunnelBlock(smartFilter, serializedBlock.name);
});

deserializers.set(BlockNames.fireworks, async (smartFilter: SmartFilter, serializedBlock: ISerializedBlockV1) => {
    const { FireworksBlock } = await import(
        /* webpackChunkName: "fireworksBlock" */ "./blocks/generators/fireworksBlock"
    );
    return new FireworksBlock(smartFilter, serializedBlock.name);
});

deserializers.set(BlockNames.aurora, async (smartFilter: SmartFilter, serializedBlock: ISerializedBlockV1) => {
    const { AuroraBlock } = await import(/* webpackChunkName: "auroraBlock" */ "./blocks/generators/auroraBlock");
    return new AuroraBlock(smartFilter, serializedBlock.name);
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

deserializers.set(BlockNames.particle, async (smartFilter: SmartFilter, serializedBlock: ISerializedBlockV1) => {
    const { ParticleBlock } = await import(/* webpackChunkName: "particleBlock" */ "./blocks/generators/particleBlock");
    return new ParticleBlock(smartFilter, serializedBlock.name);
});

deserializers.set(BlockNames.hearts, async (smartFilter: SmartFilter, serializedBlock: ISerializedBlockV1) => {
    const { HeartsBlock } = await import(/* webpackChunkName: "heartsBlock" */ "./blocks/generators/heartsBlock");
    return new HeartsBlock(smartFilter, serializedBlock.name);
});

deserializers.set(BlockNames.neonHeart, async (smartFilter: SmartFilter, serializedBlock: ISerializedBlockV1) => {
    const { NeonHeartBlock } = await import(
        /* webpackChunkName: "neonHeartBlock" */ "./blocks/generators/neonHeartBlock"
    );
    return new NeonHeartBlock(smartFilter, serializedBlock.name);
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

// Non-trivial deserializers begin.

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
