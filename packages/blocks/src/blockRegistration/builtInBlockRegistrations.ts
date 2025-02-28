import {
    type SmartFilterDeserializer,
    type ISerializedBlockV1,
    type SmartFilter,
    InputBlock,
    ConnectionPointType,
    CustomShaderBlock,
} from "@babylonjs/smart-filters";
import { BlockNames } from "../blocks/blockNames.js";

import type { ThinEngine } from "@babylonjs/core/Engines/thinEngine.js";
import type { IBlockRegistration } from "./IBlockRegistration.js";
import {
    babylonDemoEffectsNamespace,
    babylonDemoTransitionsNamespace,
    babylonDemoUtilitiesNamespace,
    inputsNamespace,
} from "../blocks/blockNamespaces.js";

/**
 * The list of block registrations.
 *
 * Important notes:
 *   1. Do not import the block code directly in this file. Instead, use dynamic imports to ensure that the block code
 *      is only loaded when needed.
 *   2. If the deserializer is trivial (doesn't require consulting the serializedBlock.data), it can be implemented here
 *   3. If the deserializer is non-trivial (needs serializedBlock.data), implement it in a separate file alongside the block
 *      in the form blockClassName.deserializer.ts
 */
export const builtInBlockRegistrations: IBlockRegistration[] = [
    // Blocks with trivial deserializers
    // Note that some choose to predefine corresponding input blocks if not being deserialized
    // ---------------------------------------------------------------------------------------
    {
        blockType: BlockNames.blackAndWhite,
        factory: async (
            smartFilter: SmartFilter,
            _engine: ThinEngine,
            _smartFilterDeserializer: SmartFilterDeserializer,
            serializedBlock: ISerializedBlockV1 | undefined
        ) => {
            const module = await import(
                /* webpackChunkName: "blackAndWhiteBlock" */ "../blocks/effects/blackAndWhiteBlock.js"
            );
            return new module.BlackAndWhiteBlock(smartFilter, serializedBlock?.name || "BlackAndWhite");
        },
        namespace: babylonDemoEffectsNamespace,
        tooltip: "Transform the input texture to black and white",
    },
    {
        blockType: BlockNames.frame,
        factory: async (
            smartFilter: SmartFilter,
            _engine: ThinEngine,
            _smartFilterDeserializer: SmartFilterDeserializer,
            serializedBlock: ISerializedBlockV1 | undefined
        ) => {
            const module = await import(/* webpackChunkName: "frameBlock" */ "../blocks/effects/frameBlock.js");
            return new module.FrameBlock(smartFilter, serializedBlock?.name || "Frame");
        },
        namespace: babylonDemoEffectsNamespace,
        tooltip: "Green screen like effect",
    },
    {
        blockType: BlockNames.glass,
        factory: async (
            smartFilter: SmartFilter,
            _engine: ThinEngine,
            _smartFilterDeserializer: SmartFilterDeserializer,
            serializedBlock: ISerializedBlockV1 | undefined
        ) => {
            const module = await import(/* webpackChunkName: "glassBlock" */ "../blocks/effects/glassBlock.js");
            return new module.GlassBlock(smartFilter, serializedBlock?.name || "Glass");
        },
        namespace: babylonDemoEffectsNamespace,
        tooltip: "Creates a glass like effect",
    },
    {
        blockType: BlockNames.kaleidoscope,
        factory: async (
            smartFilter: SmartFilter,
            _engine: ThinEngine,
            _smartFilterDeserializer: SmartFilterDeserializer,
            serializedBlock: ISerializedBlockV1 | undefined
        ) => {
            const module = await import(
                /* webpackChunkName: "kaleidoscopeBlock" */ "../blocks/effects/kaleidoscopeBlock.js"
            );
            const block = new module.KaleidoscopeBlock(smartFilter, serializedBlock?.name || "Kaleidoscope");
            if (!serializedBlock) {
                const input = new InputBlock(smartFilter, "Angle", ConnectionPointType.Float, 0);
                input.output.connectTo(block.time);
            }
            return block;
        },
        namespace: babylonDemoEffectsNamespace,
        tooltip: "Kaleidoscope effect",
    },
    {
        blockType: BlockNames.posterize,
        factory: async (
            smartFilter: SmartFilter,
            _engine: ThinEngine,
            _smartFilterDeserializer: SmartFilterDeserializer,
            serializedBlock: ISerializedBlockV1 | undefined
        ) => {
            const module = await import(/* webpackChunkName: "posterizeBlock" */ "../blocks/effects/posterizeBlock.js");
            const block = new module.PosterizeBlock(smartFilter, serializedBlock?.name || "Posterize");
            if (!serializedBlock) {
                const input = new InputBlock(smartFilter, "Intensity", ConnectionPointType.Float, 0.5);
                input.output.connectTo(block.intensity);
            }
            return block;
        },
        namespace: babylonDemoEffectsNamespace,
        tooltip: "Posterize to the input texture",
    },
    {
        blockType: BlockNames.desaturate,
        factory: async (
            smartFilter: SmartFilter,
            _engine: ThinEngine,
            _smartFilterDeserializer: SmartFilterDeserializer,
            serializedBlock: ISerializedBlockV1 | undefined
        ) => {
            const module = await import(
                /* webpackChunkName: "desaturateBlock" */ "../blocks/effects/desaturateBlock.js"
            );
            const block = new module.DesaturateBlock(smartFilter, serializedBlock?.name || "Desaturate");
            if (!serializedBlock) {
                const input = new InputBlock(smartFilter, "Intensity", ConnectionPointType.Float, 0.5);
                input.output.connectTo(block.intensity);
            }
            return block;
        },
        namespace: babylonDemoEffectsNamespace,
        tooltip: "Applies a desaturated effect to the input texture",
    },
    {
        blockType: BlockNames.contrast,
        factory: async (
            smartFilter: SmartFilter,
            _engine: ThinEngine,
            _smartFilterDeserializer: SmartFilterDeserializer,
            serializedBlock: ISerializedBlockV1 | undefined
        ) => {
            const module = await import(/* webpackChunkName: "contrastBlock" */ "../blocks/effects/contrastBlock.js");
            const block = new module.ContrastBlock(smartFilter, serializedBlock?.name || "Contrast");
            if (!serializedBlock) {
                const input = new InputBlock(smartFilter, "Intensity", ConnectionPointType.Float, 0.5);
                input.output.connectTo(block.intensity);
            }
            return block;
        },
        namespace: babylonDemoEffectsNamespace,
        tooltip: "Change the contrast of the input texture",
    },
    {
        blockType: BlockNames.greenScreen,
        factory: async (
            smartFilter: SmartFilter,
            _engine: ThinEngine,
            _smartFilterDeserializer: SmartFilterDeserializer,
            serializedBlock: ISerializedBlockV1 | undefined
        ) => {
            const module = await import(
                /* webpackChunkName: "greenScreenBlock" */ "../blocks/effects/greenScreenBlock.js"
            );
            const block = new module.GreenScreenBlock(smartFilter, serializedBlock?.name || "GreenScreen");
            if (!serializedBlock) {
                const reference = new InputBlock(smartFilter, "Reference", ConnectionPointType.Color3, {
                    r: 92 / 255,
                    g: 204 / 255,
                    b: 78 / 255,
                });
                const distance = new InputBlock(smartFilter, "Distance", ConnectionPointType.Float, 0.25);
                reference.output.connectTo(block.reference);
                distance.output.connectTo(block.distance);
            }
            return block;
        },
        namespace: babylonDemoEffectsNamespace,
        tooltip: "Replaces a green screen background with a different texture",
    },
    {
        blockType: BlockNames.glitch,
        factory: async (
            smartFilter: SmartFilter,
            _engine: ThinEngine,
            _smartFilterDeserializer: SmartFilterDeserializer,
            serializedBlock: ISerializedBlockV1 | undefined
        ) => {
            const module = await import(/* webpackChunkName: "glitchBlock" */ "../blocks/transitions/glitchBlock.js");
            return new module.GlitchBlock(smartFilter, serializedBlock?.name || "Glitch");
        },
        namespace: babylonDemoEffectsNamespace,
        tooltip: "Funky glitch transition",
    },
    {
        blockType: BlockNames.pixelate,
        factory: async (
            smartFilter: SmartFilter,
            _engine: ThinEngine,
            _smartFilterDeserializer: SmartFilterDeserializer,
            serializedBlock: ISerializedBlockV1 | undefined
        ) => {
            const module = await import(/* webpackChunkName: "pixelateBlock" */ "../blocks/effects/pixelateBlock.js");
            const block = new module.PixelateBlock(smartFilter, serializedBlock?.name || "Pixelate");
            if (!serializedBlock) {
                const input = new InputBlock(smartFilter, "Intensity", ConnectionPointType.Float, 0.4);
                input.output.connectTo(block.intensity);
            }
            return block;
        },
        namespace: babylonDemoEffectsNamespace,
        tooltip: "Add pixelation to the input texture",
    },
    {
        blockType: BlockNames.exposure,
        factory: async (
            smartFilter: SmartFilter,
            _engine: ThinEngine,
            _smartFilterDeserializer: SmartFilterDeserializer,
            serializedBlock: ISerializedBlockV1 | undefined
        ) => {
            const module = await import(/* webpackChunkName: "exposureBlock" */ "../blocks/effects/exposureBlock.js");
            const block = new module.ExposureBlock(smartFilter, serializedBlock?.name || "Exposure");
            if (!serializedBlock) {
                const input = new InputBlock(smartFilter, "Amount", ConnectionPointType.Float, 0.7);
                input.output.connectTo(block.amount);
            }
            return block;
        },
        namespace: babylonDemoEffectsNamespace,
        tooltip: "Alters the exposure of the input texture",
    },
    {
        blockType: BlockNames.mask,
        factory: async (
            smartFilter: SmartFilter,
            _engine: ThinEngine,
            _smartFilterDeserializer: SmartFilterDeserializer,
            serializedBlock: ISerializedBlockV1 | undefined
        ) => {
            const module = await import(/* webpackChunkName: "maskBlock" */ "../blocks/effects/maskBlock.js");
            return new module.MaskBlock(smartFilter, serializedBlock?.name || "Mask");
        },
        namespace: babylonDemoEffectsNamespace,
        tooltip: "Applies mask in one texture to another texture",
    },
    {
        blockType: BlockNames.spritesheet,
        factory: async (
            smartFilter: SmartFilter,
            _engine: ThinEngine,
            _smartFilterDeserializer: SmartFilterDeserializer,
            serializedBlock: ISerializedBlockV1 | undefined
        ) => {
            const module = await import(
                /* webpackChunkName: "spritesheetBlock" */ "../blocks/effects/spritesheetBlock.js"
            );
            return new module.SpritesheetBlock(smartFilter, serializedBlock?.name || "Spritesheet");
        },
        namespace: babylonDemoEffectsNamespace,
        tooltip: "Animates a sprite sheet texture",
    },
    {
        blockType: BlockNames.premultiplyAlpha,
        factory: async (
            smartFilter: SmartFilter,
            _engine: ThinEngine,
            _smartFilterDeserializer: SmartFilterDeserializer,
            serializedBlock: ISerializedBlockV1 | undefined
        ) => {
            const module = await import(
                /* webpackChunkName: "premultiplyAlphaBlock" */ "../blocks/utilities/premultiplyAlphaBlock.js"
            );
            return new module.PremultiplyAlphaBlock(smartFilter, serializedBlock?.name || "PremultiplyAlpha");
        },
        namespace: babylonDemoUtilitiesNamespace,
        tooltip: "Premultiplies the input texture's color against its alpha",
    },

    // Blocks with custom deserializers
    // --------------------------------
    {
        blockType: BlockNames.blur,
        factory: async (
            smartFilter: SmartFilter,
            _engine: ThinEngine,
            _smartFilterDeserializer: SmartFilterDeserializer,
            serializedBlock: ISerializedBlockV1 | undefined
        ) => {
            if (serializedBlock) {
                const module = await import(
                    /* webpackChunkName: "blurBlockDeserializer" */ "../blocks/effects/blurBlock.deserializer.js"
                );
                return module.blurBlockDeserializer(smartFilter, serializedBlock);
            } else {
                const module = await import(/* webpackChunkName: "blurBlock" */ "../blocks/effects/blurBlock.js");
                return new module.BlurBlock(smartFilter, "Blur");
            }
        },
        namespace: babylonDemoEffectsNamespace,
        tooltip: "Blur the input texture",
    },
    {
        blockType: BlockNames.composition,
        factory: async (
            smartFilter: SmartFilter,
            _engine: ThinEngine,
            _smartFilterDeserializer: SmartFilterDeserializer,
            serializedBlock: ISerializedBlockV1 | undefined
        ) => {
            if (serializedBlock) {
                const module = await import(
                    /* webpackChunkName: "compositionBlockDeserializer" */ "../blocks/effects/compositionBlock.deserializer.js"
                );
                return module.compositionDeserializer(smartFilter, serializedBlock);
            } else {
                const module = await import(
                    /* webpackChunkName: "compositionBlock" */ "../blocks/effects/compositionBlock.js"
                );
                const block = new module.CompositionBlock(smartFilter, "Composition");
                const top = new InputBlock(smartFilter, "Top", ConnectionPointType.Float, 0.0);
                const left = new InputBlock(smartFilter, "Left", ConnectionPointType.Float, 0.0);
                const width = new InputBlock(smartFilter, "Width", ConnectionPointType.Float, 1.0);
                const height = new InputBlock(smartFilter, "Height", ConnectionPointType.Float, 1.0);

                top.output.connectTo(block.foregroundTop);
                left.output.connectTo(block.foregroundLeft);
                width.output.connectTo(block.foregroundWidth);
                height.output.connectTo(block.foregroundHeight);
                return block;
            }
        },
        namespace: babylonDemoEffectsNamespace,
        tooltip: "Composite the foreground texture over the background texture",
    },
    {
        blockType: BlockNames.tile,
        factory: async (
            smartFilter: SmartFilter,
            _engine: ThinEngine,
            _smartFilterDeserializer: SmartFilterDeserializer,
            serializedBlock: ISerializedBlockV1 | undefined
        ) => {
            if (serializedBlock) {
                const module = await import(
                    /* webpackChunkName: "tileBlockDeserializer" */ "../blocks/transitions/tileBlock.deserializer.js"
                );
                return module.tileDeserializer(smartFilter, serializedBlock);
            } else {
                const module = await import(/* webpackChunkName: "tileBlock" */ "../blocks/transitions/tileBlock.js");
                return new module.TileBlock(smartFilter, "Tile");
            }
        },
        namespace: babylonDemoTransitionsNamespace,
        tooltip: "Transition from one texture to another using tiles",
    },
    {
        blockType: BlockNames.wipe,
        factory: async (
            smartFilter: SmartFilter,
            _engine: ThinEngine,
            _smartFilterDeserializer: SmartFilterDeserializer,
            serializedBlock: ISerializedBlockV1 | undefined
        ) => {
            if (serializedBlock) {
                const module = await import(
                    /* webpackChunkName: "wipeBlockDeserializer" */ "../blocks/transitions/wipeBlock.deserializer.js"
                );
                return module.wipeDeserializer(smartFilter, serializedBlock);
            } else {
                const module = await import(/* webpackChunkName: "wipeBlock" */ "../blocks/transitions/wipeBlock.js");
                return new module.WipeBlock(smartFilter, "Wipe");
            }
        },
        namespace: babylonDemoEffectsNamespace,
        tooltip: "Transition from one texture to another using a wipe",
    },

    // Blocks defined by serialized definitions
    // ----------------------------------------
    {
        blockType: BlockNames.tint,
        factory: async (
            smartFilter: SmartFilter,
            _engine: ThinEngine,
            _smartFilterDeserializer: SmartFilterDeserializer,
            serializedBlock: ISerializedBlockV1 | undefined
        ) => {
            const module = await import(/* webpackChunkName: "tintBlock" */ "../blocks/effects/tintBlock.js");
            return CustomShaderBlock.Create(
                smartFilter,
                serializedBlock?.name || "Tint",
                module.deserializedTintBlockDefinition
            );
        },
        namespace: babylonDemoEffectsNamespace,
        tooltip: "Adds colored tint to the input texture",
    },

    // Standard input blocks
    // ---------------------
    {
        blockType: "Float",
        namespace: inputsNamespace,
        tooltip: "A floating point number representing a value with a fractional component",
    },
    {
        blockType: "Color3",
        namespace: inputsNamespace,
        tooltip: "A set of 3 floating point numbers representing a color",
    },
    {
        blockType: "Color4",
        namespace: inputsNamespace,
        tooltip: "A set of 4 floating point numbers representing a color",
    },
    {
        blockType: "Texture",
        namespace: inputsNamespace,
        tooltip: "A texture to be used as input",
    },
    {
        blockType: "Vector2",
        namespace: inputsNamespace,
        tooltip: "A Vector2 to be used as input",
    },
];
