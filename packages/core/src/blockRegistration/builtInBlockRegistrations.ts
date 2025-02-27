import type { ThinEngine } from "@babylonjs/core/Engines/thinEngine.js";
import type { IBlockRegistration } from "./IBlockRegistration.js";
import { babylonDemoEffects, babylonDemoTransitions, babylonDemoUtilities } from "../blocks/blockNamespaces.js";
import { InputBlock } from "../blockFoundation/inputBlock.js";
import { ConnectionPointType } from "../connection/connectionPointType.js";
import { CustomShaderBlock } from "../blockFoundation/customShaderBlock.js";
import type { ISerializedBlockV1 } from "../serialization/index.js";
import type { SmartFilterDeserializer } from "../serialization/smartFilterDeserializer.js";
import type { SmartFilter } from "../smartFilter.js";
import { BlockNames } from "../blocks/blockNames.js";

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
                /* webpackChunkName: "blackAndWhiteBlock" */ "../blocks/babylonjs/demo/effects/blackAndWhiteBlock.js"
            );
            return new module.BlackAndWhiteBlock(smartFilter, serializedBlock?.name || "BlackAndWhite");
        },
        namespace: babylonDemoEffects,
        tooltip: "Transform the input texture to black and white",
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
                /* webpackChunkName: "kaleidoscopeBlock" */ "../blocks/babylonjs/demo/effects/kaleidoscopeBlock.js"
            );
            const block = new module.KaleidoscopeBlock(smartFilter, serializedBlock?.name || "Kaleidoscope");
            if (!serializedBlock) {
                const input = new InputBlock(smartFilter, "Angle", ConnectionPointType.Float, 0);
                input.output.connectTo(block.time);
            }
            return block;
        },
        namespace: babylonDemoEffects,
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
            const module = await import(
                /* webpackChunkName: "posterizeBlock" */ "../blocks/babylonjs/demo/effects/posterizeBlock.js"
            );
            const block = new module.PosterizeBlock(smartFilter, serializedBlock?.name || "Posterize");
            if (!serializedBlock) {
                const input = new InputBlock(smartFilter, "Intensity", ConnectionPointType.Float, 0.5);
                input.output.connectTo(block.intensity);
            }
            return block;
        },
        namespace: babylonDemoEffects,
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
                /* webpackChunkName: "desaturateBlock" */ "../blocks/babylonjs/demo/effects/desaturateBlock.js"
            );
            const block = new module.DesaturateBlock(smartFilter, serializedBlock?.name || "Desaturate");
            if (!serializedBlock) {
                const input = new InputBlock(smartFilter, "Intensity", ConnectionPointType.Float, 0.5);
                input.output.connectTo(block.intensity);
            }
            return block;
        },
        namespace: babylonDemoEffects,
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
            const module = await import(
                /* webpackChunkName: "contrastBlock" */ "../blocks/babylonjs/demo/effects/contrastBlock.js"
            );
            const block = new module.ContrastBlock(smartFilter, serializedBlock?.name || "Contrast");
            if (!serializedBlock) {
                const input = new InputBlock(smartFilter, "Intensity", ConnectionPointType.Float, 0.5);
                input.output.connectTo(block.intensity);
            }
            return block;
        },
        namespace: babylonDemoEffects,
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
                /* webpackChunkName: "greenScreenBlock" */ "../blocks/babylonjs/demo/effects/greenScreenBlock.js"
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
        namespace: babylonDemoEffects,
        tooltip: "Replaces a green screen background with a different texture",
    },
    {
        blockType: BlockNames.pixelate,
        factory: async (
            smartFilter: SmartFilter,
            _engine: ThinEngine,
            _smartFilterDeserializer: SmartFilterDeserializer,
            serializedBlock: ISerializedBlockV1 | undefined
        ) => {
            const module = await import(
                /* webpackChunkName: "pixelateBlock" */ "../blocks/babylonjs/demo/effects/pixelateBlock.js"
            );
            const block = new module.PixelateBlock(smartFilter, serializedBlock?.name || "Pixelate");
            if (!serializedBlock) {
                const input = new InputBlock(smartFilter, "Intensity", ConnectionPointType.Float, 0.4);
                input.output.connectTo(block.intensity);
            }
            return block;
        },
        namespace: babylonDemoEffects,
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
            const module = await import(
                /* webpackChunkName: "exposureBlock" */ "../blocks/babylonjs/demo/effects/exposureBlock.js"
            );
            const block = new module.ExposureBlock(smartFilter, serializedBlock?.name || "Exposure");
            if (!serializedBlock) {
                const input = new InputBlock(smartFilter, "Amount", ConnectionPointType.Float, 0.7);
                input.output.connectTo(block.amount);
            }
            return block;
        },
        namespace: babylonDemoEffects,
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
            const module = await import(
                /* webpackChunkName: "maskBlock" */ "../blocks/babylonjs/demo/effects/maskBlock.js"
            );
            return new module.MaskBlock(smartFilter, serializedBlock?.name || "Mask");
        },
        namespace: babylonDemoEffects,
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
                /* webpackChunkName: "spritesheetBlock" */ "../blocks/babylonjs/demo/effects/spritesheetBlock.js"
            );
            return new module.SpritesheetBlock(smartFilter, serializedBlock?.name || "Spritesheet");
        },
        namespace: babylonDemoEffects,
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
                /* webpackChunkName: "premultiplyAlphaBlock" */ "../blocks/babylonjs/demo/utilities/premultiplyAlphaBlock.js"
            );
            return new module.PremultiplyAlphaBlock(smartFilter, serializedBlock?.name || "PremultiplyAlpha");
        },
        namespace: babylonDemoUtilities,
        tooltip: "Premultiplies the input texture's color against its alpha",
    },
    {
        blockType: BlockNames.wipe,
        factory: async (
            smartFilter: SmartFilter,
            _engine: ThinEngine,
            _smartFilterDeserializer: SmartFilterDeserializer,
            serializedBlock: ISerializedBlockV1 | undefined
        ) => {
            const module = await import(
                /* webpackChunkName: "wipeBlock" */ "../blocks/babylonjs/demo/transitions/wipeBlock.js"
            );
            return new module.WipeBlock(smartFilter, serializedBlock?.name || "Wipe");
        },
        namespace: babylonDemoTransitions,
        tooltip: "Transition from one texture to another using a wipe",
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
                    /* webpackChunkName: "blurBlockDeserializer" */ "../blocks/babylonjs/demo/effects/blurBlock.deserializer.js"
                );
                return module.blurBlockDeserializer(smartFilter, serializedBlock);
            } else {
                const module = await import(
                    /* webpackChunkName: "blurBlock" */ "../blocks/babylonjs/demo/effects/blurBlock.js"
                );
                return new module.BlurBlock(smartFilter, "Blur");
            }
        },
        namespace: babylonDemoEffects,
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
                    /* webpackChunkName: "compositionBlockDeserializer" */ "../blocks/babylonjs/demo/effects/compositionBlock.deserializer.js"
                );
                return module.compositionDeserializer(smartFilter, serializedBlock);
            } else {
                const module = await import(
                    /* webpackChunkName: "compositionBlock" */ "../blocks/babylonjs/demo/effects/compositionBlock.js"
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
        namespace: babylonDemoEffects,
        tooltip: "Composite the foreground texture over the background texture",
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
            const module = await import(
                /* webpackChunkName: "tintBlock" */ "../blocks/babylonjs/demo/effects/tintBlock.js"
            );
            return CustomShaderBlock.Create(
                smartFilter,
                serializedBlock?.name || "Tint",
                module.deserializedTintBlockDefinition
            );
        },
        namespace: babylonDemoEffects,
        tooltip: "Adds colored tint to the input texture",
    },

    // Standard input blocks
    // ---------------------
    {
        blockType: "Float",
        namespace: "Inputs",
        tooltip: "A floating point number representing a value with a fractional component",
    },
    {
        blockType: "Color3",
        namespace: "Inputs",
        tooltip: "A set of 3 floating point numbers representing a color",
    },
    {
        blockType: "Color4",
        namespace: "Inputs",
        tooltip: "A set of 4 floating point numbers representing a color",
    },
    {
        blockType: "Texture",
        namespace: "Inputs",
        tooltip: "A texture to be used as input",
    },
    {
        blockType: "Vector2",
        namespace: "Inputs",
        tooltip: "A Vector2 to be used as input",
    },
];
