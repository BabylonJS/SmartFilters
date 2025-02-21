import { BlackAndWhiteAndBlurBlock } from "../blocks/effects/blackAndWhiteAndBlurBlock";
import { BlackAndWhiteBlock } from "../blocks/effects/blackAndWhiteBlock";
import { BlurBlock } from "../blocks/effects/blurBlock";
import { CompositionBlock } from "../blocks/effects/compositionBlock";
import { ContrastBlock } from "../blocks/effects/contrastBlock";
import { DesaturateBlock } from "../blocks/effects/desaturateBlock";
import { ExposureBlock } from "../blocks/effects/exposureBlock";
import { FrameBlock } from "../blocks/effects/frameBlock";
import { GlassBlock } from "../blocks/effects/glassBlock";
import { GreenScreenBlock } from "../blocks/effects/greenScreenBlock";
import { KaleidoscopeBlock } from "../blocks/effects/kaleidoscopeBlock";
import { MaskBlock } from "../blocks/effects/maskBlock";
import { PixelateBlock } from "../blocks/effects/pixelateBlock";
import { PosterizeBlock } from "../blocks/effects/posterizeBlock";
import { VhsGlitchBlock } from "../blocks/effects/vhsGlitchBlock";
import { SketchBlock } from "../blocks/effects/sketchBlock";
import { SoftThresholdBlock } from "../blocks/effects/softThresholdBlock";
import { GlitchBlock } from "../blocks/transitions/glitchBlock";
import { TileBlock } from "../blocks/transitions/tileBlock";
import { WipeBlock } from "../blocks/transitions/wipeBlock";
import { PremultiplyAlphaBlock } from "../blocks/utility/premultiplyAlphaBlock";
import type { IBlockEditorRegistration } from "./IBlockEditorRegistration";
import {
    ConnectionPointType,
    CustomAggregateBlock,
    CustomShaderBlock,
    InputBlock,
    type SmartFilterDeserializer,
    type SmartFilter,
} from "@babylonjs/smart-filters";
import { WebCamInputBlockName } from "../blocks/inputs/webCamInputBlock";
import { SpritesheetBlock } from "../blocks/effects/spritesheetBlock";
import { deserializedTintBlockDefinition } from "../blocks/effects/tintBlock";
import type { ThinEngine } from "@babylonjs/core/Engines/thinEngine";
import { pixelateAndDesaturateBlockDefinition } from "../blocks/effects/pixelateAndDesaturateBlock";

/**
 * Extends the default block editor registrations with registrations for the hardcoded blocks
 * (those who are defined in code and included in this project)
 */
export const hardcodedBlockEditorRegistrations: IBlockEditorRegistration[] = [
    {
        name: WebCamInputBlockName,
        category: "Inputs",
        tooltip: "Supplies a texture from a webcam",
    },
    {
        name: "TimeBlock",
        category: "Inputs",
        tooltip: "Supplies a float value representing the current time",
        factory: (smartFilter: SmartFilter) => {
            const inputBlock = new InputBlock(smartFilter, "Time", ConnectionPointType.Float, 0.0);
            inputBlock.editorData = {
                animationType: "time",
                valueDeltaPerMs: 0.001,
                min: null,
                max: null,
            };
            return Promise.resolve(inputBlock);
        },
    },
    {
        name: BlackAndWhiteBlock.ClassName,
        factory: (smartFilter: SmartFilter) => Promise.resolve(new BlackAndWhiteBlock(smartFilter, "BlackAndWhite")),
        category: BlackAndWhiteBlock.Namespace,
        tooltip: "Transform the input texture to black and white",
    },
    {
        name: BlurBlock.ClassName,
        factory: (smartFilter: SmartFilter) => Promise.resolve(new BlurBlock(smartFilter, "Blur")),
        category: BlurBlock.Namespace,
        tooltip: "Blur the input texture",
    },
    {
        name: CompositionBlock.ClassName,
        factory: (smartFilter: SmartFilter) => {
            const block = new CompositionBlock(smartFilter, "Composition");
            const top = new InputBlock(smartFilter, "Top", ConnectionPointType.Float, 0.0);
            const left = new InputBlock(smartFilter, "Left", ConnectionPointType.Float, 0.0);
            const width = new InputBlock(smartFilter, "Width", ConnectionPointType.Float, 1.0);
            const height = new InputBlock(smartFilter, "Height", ConnectionPointType.Float, 1.0);

            top.output.connectTo(block.foregroundTop);
            left.output.connectTo(block.foregroundLeft);
            width.output.connectTo(block.foregroundWidth);
            height.output.connectTo(block.foregroundHeight);
            return Promise.resolve(block);
        },
        category: CompositionBlock.Namespace,
        tooltip: "Composite the foreground texture over the background texture",
    },
    {
        name: FrameBlock.ClassName,
        factory: (smartFilter: SmartFilter) => Promise.resolve(new FrameBlock(smartFilter, "Frame")),
        category: FrameBlock.Namespace,
        tooltip: "Green screen like effect",
    },
    {
        name: GlassBlock.ClassName,
        factory: (smartFilter: SmartFilter) => Promise.resolve(new GlassBlock(smartFilter, "Glass")),
        category: GlassBlock.Namespace,
        tooltip: "Creates a glass like effect",
    },
    {
        name: KaleidoscopeBlock.ClassName,
        factory: (smartFilter: SmartFilter) => {
            const block = new KaleidoscopeBlock(smartFilter, "Kaleidoscope");
            const input = new InputBlock(smartFilter, "Angle", ConnectionPointType.Float, 0);
            input.output.connectTo(block.time);
            return Promise.resolve(block);
        },
        category: KaleidoscopeBlock.Namespace,
        tooltip: "Kaleidoscope effect",
    },
    {
        name: PosterizeBlock.ClassName,
        factory: (smartFilter: SmartFilter) => {
            const block = new PosterizeBlock(smartFilter, "Posterize");
            const input = new InputBlock(smartFilter, "Intensity", ConnectionPointType.Float, 0.5);
            input.output.connectTo(block.intensity);
            return Promise.resolve(block);
        },
        category: PosterizeBlock.Namespace,
        tooltip: "Posterize to the input texture",
    },
    {
        name: DesaturateBlock.ClassName,
        factory: (smartFilter: SmartFilter) => {
            const block = new DesaturateBlock(smartFilter, "Desaturate");
            const input = new InputBlock(smartFilter, "Intensity", ConnectionPointType.Float, 0.5);
            input.output.connectTo(block.intensity);
            return Promise.resolve(block);
        },
        category: DesaturateBlock.Namespace,
        tooltip: "Applies a desaturated effect to the input texture",
    },
    {
        name: ContrastBlock.ClassName,
        factory: (smartFilter: SmartFilter) => {
            const block = new ContrastBlock(smartFilter, "Contrast");
            const input = new InputBlock(smartFilter, "Intensity", ConnectionPointType.Float, 0.5);
            input.output.connectTo(block.intensity);
            return Promise.resolve(block);
        },
        category: ContrastBlock.Namespace,
        tooltip: "Change the contrast of the input texture",
    },
    {
        name: GreenScreenBlock.ClassName,
        factory: (smartFilter: SmartFilter) => {
            const block = new GreenScreenBlock(smartFilter, "GreenScreen");
            const reference = new InputBlock(smartFilter, "Reference", ConnectionPointType.Color3, {
                r: 92 / 255,
                g: 204 / 255,
                b: 78 / 255,
            });
            const distance = new InputBlock(smartFilter, "Distance", ConnectionPointType.Float, 0.25);
            reference.output.connectTo(block.reference);
            distance.output.connectTo(block.distance);
            return Promise.resolve(block);
        },
        category: GreenScreenBlock.Namespace,
        tooltip: "Replaces a green screen background with a different texture",
    },
    {
        name: BlackAndWhiteAndBlurBlock.ClassName,
        factory: (smartFilter: SmartFilter) =>
            Promise.resolve(new BlackAndWhiteAndBlurBlock(smartFilter, "BlackAndWhiteAndBlurBlock")),
        category: BlackAndWhiteAndBlurBlock.Namespace,
        tooltip: "Transforms the input texture to black and white and blurs it",
    },
    {
        name: GlitchBlock.ClassName,
        factory: (smartFilter: SmartFilter) => Promise.resolve(new GlitchBlock(smartFilter, "Glitch")),
        category: GlitchBlock.Namespace,
        tooltip: "Funky glitch transition",
    },
    {
        name: TileBlock.ClassName,
        factory: (smartFilter: SmartFilter) => Promise.resolve(new TileBlock(smartFilter, "Tile")),
        category: TileBlock.Namespace,
        tooltip: "Transition from one texture to another using tiles",
    },
    {
        name: WipeBlock.ClassName,
        factory: (smartFilter: SmartFilter) => Promise.resolve(new WipeBlock(smartFilter, "Wipe")),
        category: WipeBlock.Namespace,
        tooltip: "Transition from one texture to another using a wipe",
    },
    {
        name: PixelateBlock.ClassName,
        factory: (smartFilter: SmartFilter) => {
            const block = new PixelateBlock(smartFilter, "Pixelate");
            const input = new InputBlock(smartFilter, "Intensity", ConnectionPointType.Float, 0.4);
            input.output.connectTo(block.intensity);
            return Promise.resolve(block);
        },
        category: PixelateBlock.Namespace,
        tooltip: "Add pixelation to the input texture",
    },
    {
        name: ExposureBlock.ClassName,
        factory: (smartFilter: SmartFilter) => {
            const block = new ExposureBlock(smartFilter, "Exposure");
            const input = new InputBlock(smartFilter, "Amount", ConnectionPointType.Float, 0.7);
            input.output.connectTo(block.amount);
            return Promise.resolve(block);
        },
        category: ExposureBlock.Namespace,
        tooltip: "Alters the exposure of the input texture",
    },
    {
        name: MaskBlock.ClassName,
        factory: (smartFilter: SmartFilter) => Promise.resolve(new MaskBlock(smartFilter, "Mask")),
        category: MaskBlock.Namespace,
        tooltip: "Applies mask in one texture to another texture",
    },
    {
        name: VhsGlitchBlock.ClassName,
        factory: (smartFilter: SmartFilter) => Promise.resolve(new VhsGlitchBlock(smartFilter, "VhsGlitch")),
        category: VhsGlitchBlock.Namespace,
        tooltip: "Adds a VHS glitch effect to the input texture",
    },
    {
        name: SketchBlock.ClassName,
        factory: (smartFilter: SmartFilter) => Promise.resolve(new SketchBlock(smartFilter, "Sketch")),
        category: SketchBlock.Namespace,
        tooltip: "Adds a hand-drawn sketch effect to the input texture",
    },
    {
        name: SoftThresholdBlock.ClassName,
        factory: (smartFilter: SmartFilter) => Promise.resolve(new SoftThresholdBlock(smartFilter, "SoftThreshold")),
        category: SoftThresholdBlock.Namespace,
        tooltip: "Adds a high contrast, softened black-and-white effect to the input texture",
    },
    {
        name: SpritesheetBlock.ClassName,
        factory: (smartFilter: SmartFilter) => Promise.resolve(new SpritesheetBlock(smartFilter, "Spritesheet")),
        category: SpritesheetBlock.Namespace,
        tooltip: "Animates a sprite sheet texture",
    },
    {
        name: deserializedTintBlockDefinition.blockType,
        factory: (smartFilter: SmartFilter) =>
            Promise.resolve(CustomShaderBlock.Create(smartFilter, "Tint", deserializedTintBlockDefinition)),
        category: deserializedTintBlockDefinition.namespace,
        tooltip: "Adds colored tint to the input texture",
    },
    {
        name: pixelateAndDesaturateBlockDefinition.blockType,
        factory: (smartFilter: SmartFilter, engine: ThinEngine, smartFilterDeserializer: SmartFilterDeserializer) =>
            CustomAggregateBlock.Create(
                smartFilter,
                engine,
                "PixelateAndDesaturate",
                pixelateAndDesaturateBlockDefinition,
                smartFilterDeserializer
            ),
        category: pixelateAndDesaturateBlockDefinition.namespace,
        tooltip: "Adds colored tint to the input texture",
    },
    {
        name: PremultiplyAlphaBlock.ClassName,
        factory: (smartFilter: SmartFilter) =>
            Promise.resolve(new PremultiplyAlphaBlock(smartFilter, "PremultiplyAlpha")),
        category: PremultiplyAlphaBlock.Namespace,
        tooltip: "Premultiplies the input texture's color against its alpha",
    },
];
