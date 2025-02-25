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
import type { IBlockEditorRegistration } from "@babylonjs/smart-filters-editor";
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
        blockType: WebCamInputBlockName,
        namespace: "Inputs",
        tooltip: "Supplies a texture from a webcam",
    },
    {
        blockType: "TimeBlock",
        namespace: "Inputs",
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
        blockType: BlackAndWhiteBlock.ClassName,
        factory: (smartFilter: SmartFilter) => Promise.resolve(new BlackAndWhiteBlock(smartFilter, "BlackAndWhite")),
        namespace: BlackAndWhiteBlock.Namespace,
        tooltip: "Transform the input texture to black and white",
    },
    {
        blockType: BlurBlock.ClassName,
        factory: (smartFilter: SmartFilter) => Promise.resolve(new BlurBlock(smartFilter, "Blur")),
        namespace: BlurBlock.Namespace,
        tooltip: "Blur the input texture",
    },
    {
        blockType: CompositionBlock.ClassName,
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
        namespace: CompositionBlock.Namespace,
        tooltip: "Composite the foreground texture over the background texture",
    },
    {
        blockType: FrameBlock.ClassName,
        factory: (smartFilter: SmartFilter) => Promise.resolve(new FrameBlock(smartFilter, "Frame")),
        namespace: FrameBlock.Namespace,
        tooltip: "Green screen like effect",
    },
    {
        blockType: GlassBlock.ClassName,
        factory: (smartFilter: SmartFilter) => Promise.resolve(new GlassBlock(smartFilter, "Glass")),
        namespace: GlassBlock.Namespace,
        tooltip: "Creates a glass like effect",
    },
    {
        blockType: KaleidoscopeBlock.ClassName,
        factory: (smartFilter: SmartFilter) => {
            const block = new KaleidoscopeBlock(smartFilter, "Kaleidoscope");
            const input = new InputBlock(smartFilter, "Angle", ConnectionPointType.Float, 0);
            input.output.connectTo(block.time);
            return Promise.resolve(block);
        },
        namespace: KaleidoscopeBlock.Namespace,
        tooltip: "Kaleidoscope effect",
    },
    {
        blockType: PosterizeBlock.ClassName,
        factory: (smartFilter: SmartFilter) => {
            const block = new PosterizeBlock(smartFilter, "Posterize");
            const input = new InputBlock(smartFilter, "Intensity", ConnectionPointType.Float, 0.5);
            input.output.connectTo(block.intensity);
            return Promise.resolve(block);
        },
        namespace: PosterizeBlock.Namespace,
        tooltip: "Posterize to the input texture",
    },
    {
        blockType: DesaturateBlock.ClassName,
        factory: (smartFilter: SmartFilter) => {
            const block = new DesaturateBlock(smartFilter, "Desaturate");
            const input = new InputBlock(smartFilter, "Intensity", ConnectionPointType.Float, 0.5);
            input.output.connectTo(block.intensity);
            return Promise.resolve(block);
        },
        namespace: DesaturateBlock.Namespace,
        tooltip: "Applies a desaturated effect to the input texture",
    },
    {
        blockType: ContrastBlock.ClassName,
        factory: (smartFilter: SmartFilter) => {
            const block = new ContrastBlock(smartFilter, "Contrast");
            const input = new InputBlock(smartFilter, "Intensity", ConnectionPointType.Float, 0.5);
            input.output.connectTo(block.intensity);
            return Promise.resolve(block);
        },
        namespace: ContrastBlock.Namespace,
        tooltip: "Change the contrast of the input texture",
    },
    {
        blockType: GreenScreenBlock.ClassName,
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
        namespace: GreenScreenBlock.Namespace,
        tooltip: "Replaces a green screen background with a different texture",
    },
    {
        blockType: BlackAndWhiteAndBlurBlock.ClassName,
        factory: (smartFilter: SmartFilter) =>
            Promise.resolve(new BlackAndWhiteAndBlurBlock(smartFilter, "BlackAndWhiteAndBlurBlock")),
        namespace: BlackAndWhiteAndBlurBlock.Namespace,
        tooltip: "Transforms the input texture to black and white and blurs it",
    },
    {
        blockType: GlitchBlock.ClassName,
        factory: (smartFilter: SmartFilter) => Promise.resolve(new GlitchBlock(smartFilter, "Glitch")),
        namespace: GlitchBlock.Namespace,
        tooltip: "Funky glitch transition",
    },
    {
        blockType: TileBlock.ClassName,
        factory: (smartFilter: SmartFilter) => Promise.resolve(new TileBlock(smartFilter, "Tile")),
        namespace: TileBlock.Namespace,
        tooltip: "Transition from one texture to another using tiles",
    },
    {
        blockType: WipeBlock.ClassName,
        factory: (smartFilter: SmartFilter) => Promise.resolve(new WipeBlock(smartFilter, "Wipe")),
        namespace: WipeBlock.Namespace,
        tooltip: "Transition from one texture to another using a wipe",
    },
    {
        blockType: PixelateBlock.ClassName,
        factory: (smartFilter: SmartFilter) => {
            const block = new PixelateBlock(smartFilter, "Pixelate");
            const input = new InputBlock(smartFilter, "Intensity", ConnectionPointType.Float, 0.4);
            input.output.connectTo(block.intensity);
            return Promise.resolve(block);
        },
        namespace: PixelateBlock.Namespace,
        tooltip: "Add pixelation to the input texture",
    },
    {
        blockType: ExposureBlock.ClassName,
        factory: (smartFilter: SmartFilter) => {
            const block = new ExposureBlock(smartFilter, "Exposure");
            const input = new InputBlock(smartFilter, "Amount", ConnectionPointType.Float, 0.7);
            input.output.connectTo(block.amount);
            return Promise.resolve(block);
        },
        namespace: ExposureBlock.Namespace,
        tooltip: "Alters the exposure of the input texture",
    },
    {
        blockType: MaskBlock.ClassName,
        factory: (smartFilter: SmartFilter) => Promise.resolve(new MaskBlock(smartFilter, "Mask")),
        namespace: MaskBlock.Namespace,
        tooltip: "Applies mask in one texture to another texture",
    },
    {
        blockType: VhsGlitchBlock.ClassName,
        factory: (smartFilter: SmartFilter) => Promise.resolve(new VhsGlitchBlock(smartFilter, "VhsGlitch")),
        namespace: VhsGlitchBlock.Namespace,
        tooltip: "Adds a VHS glitch effect to the input texture",
    },
    {
        blockType: SketchBlock.ClassName,
        factory: (smartFilter: SmartFilter) => Promise.resolve(new SketchBlock(smartFilter, "Sketch")),
        namespace: SketchBlock.Namespace,
        tooltip: "Adds a hand-drawn sketch effect to the input texture",
    },
    {
        blockType: SoftThresholdBlock.ClassName,
        factory: (smartFilter: SmartFilter) => Promise.resolve(new SoftThresholdBlock(smartFilter, "SoftThreshold")),
        namespace: SoftThresholdBlock.Namespace,
        tooltip: "Adds a high contrast, softened black-and-white effect to the input texture",
    },
    {
        blockType: SpritesheetBlock.ClassName,
        factory: (smartFilter: SmartFilter) => Promise.resolve(new SpritesheetBlock(smartFilter, "Spritesheet")),
        namespace: SpritesheetBlock.Namespace,
        tooltip: "Animates a sprite sheet texture",
    },
    {
        blockType: deserializedTintBlockDefinition.blockType,
        factory: (smartFilter: SmartFilter) =>
            Promise.resolve(CustomShaderBlock.Create(smartFilter, "Tint", deserializedTintBlockDefinition)),
        namespace: deserializedTintBlockDefinition.namespace,
        tooltip: "Adds colored tint to the input texture",
    },
    {
        blockType: pixelateAndDesaturateBlockDefinition.blockType,
        factory: (smartFilter: SmartFilter, engine: ThinEngine, smartFilterDeserializer: SmartFilterDeserializer) =>
            CustomAggregateBlock.Create(
                smartFilter,
                engine,
                "PixelateAndDesaturate",
                pixelateAndDesaturateBlockDefinition,
                smartFilterDeserializer
            ),
        namespace: pixelateAndDesaturateBlockDefinition.namespace,
        tooltip: "Adds colored tint to the input texture",
    },
    {
        blockType: PremultiplyAlphaBlock.ClassName,
        factory: (smartFilter: SmartFilter) =>
            Promise.resolve(new PremultiplyAlphaBlock(smartFilter, "PremultiplyAlpha")),
        namespace: PremultiplyAlphaBlock.Namespace,
        tooltip: "Premultiplies the input texture's color against its alpha",
    },
];
