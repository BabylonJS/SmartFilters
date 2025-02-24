import type { SmartFilterDeserializer, ISerializedBlockV1, SmartFilter } from "@babylonjs/smart-filters";
import { BlockNames } from "../blocks/blockNames.js";

import type { IBlockEditorRegistration } from "@babylonjs/smart-filters-editor-control";
import type { ThinEngine } from "@babylonjs/core/Engines/thinEngine.js";

/**
 * The block registrations for the built in blocks
 */
export const builtInBlockEditorRegistrations: IBlockEditorRegistration[] = [
    // {
    //     name: WebCamInputBlockName,
    //     category: "Inputs",
    //     tooltip: "Supplies a texture from a webcam",
    // },
    // {
    //     name: "TimeBlock",
    //     category: "Inputs",
    //     tooltip: "Supplies a float value representing the current time",
    //     factory: (smartFilter: SmartFilter) => {
    //         const inputBlock = new InputBlock(smartFilter, "Time", ConnectionPointType.Float, 0.0);
    //         inputBlock.editorData = {
    //             animationType: "time",
    //             valueDeltaPerMs: 0.001,
    //             min: null,
    //             max: null,
    //         };
    //         return Promise.resolve(inputBlock);
    //     },
    // },
    {
        name: BlockNames.blackAndWhite,
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
        category: "Effects",
        tooltip: "Transform the input texture to black and white",
    },
    // {
    //     name: "BlurBlock",
    //     factory: (smartFilter: SmartFilter) => Promise.resolve(new BlurBlock(smartFilter, "Blur")),
    //     category: "Effects",
    //     tooltip: "Blur the input texture",
    // },
    // {
    //     name: "CompositionBlock",
    //     factory: (smartFilter: SmartFilter) => {
    //         const block = new CompositionBlock(smartFilter, "Composition");
    //         const top = new InputBlock(smartFilter, "Top", ConnectionPointType.Float, 0.0);
    //         const left = new InputBlock(smartFilter, "Left", ConnectionPointType.Float, 0.0);
    //         const width = new InputBlock(smartFilter, "Width", ConnectionPointType.Float, 1.0);
    //         const height = new InputBlock(smartFilter, "Height", ConnectionPointType.Float, 1.0);

    //         top.output.connectTo(block.foregroundTop);
    //         left.output.connectTo(block.foregroundLeft);
    //         width.output.connectTo(block.foregroundWidth);
    //         height.output.connectTo(block.foregroundHeight);
    //         return Promise.resolve(block);
    //     },
    //     category: "Effects",
    //     tooltip: "Composite the foreground texture over the background texture",
    // },
    // {
    //     name: "FrameBlock",
    //     factory: (smartFilter: SmartFilter) => Promise.resolve(new FrameBlock(smartFilter, "Frame")),
    //     category: "Effects",
    //     tooltip: "Green screen like effect",
    // },
    // {
    //     name: "GlassBlock",
    //     factory: (smartFilter: SmartFilter) => Promise.resolve(new GlassBlock(smartFilter, "Glass")),
    //     category: "Effects",
    //     tooltip: "Creates a glass like effect",
    // },
    // {
    //     name: "KaleidoscopeBlock",
    //     factory: (smartFilter: SmartFilter) => {
    //         const block = new KaleidoscopeBlock(smartFilter, "Kaleidoscope");
    //         const input = new InputBlock(smartFilter, "Angle", ConnectionPointType.Float, 0);
    //         input.output.connectTo(block.time);
    //         return Promise.resolve(block);
    //     },
    //     category: "Effects",
    //     tooltip: "Kaleidoscope effect",
    // },
    // {
    //     name: "PosterizeBlock",
    //     factory: (smartFilter: SmartFilter) => {
    //         const block = new PosterizeBlock(smartFilter, "Posterize");
    //         const input = new InputBlock(smartFilter, "Intensity", ConnectionPointType.Float, 0.5);
    //         input.output.connectTo(block.intensity);
    //         return Promise.resolve(block);
    //     },
    //     category: "Effects",
    //     tooltip: "Posterize to the input texture",
    // },
    // {
    //     name: "DesaturateBlock",
    //     factory: (smartFilter: SmartFilter) => {
    //         const block = new DesaturateBlock(smartFilter, "Desaturate");
    //         const input = new InputBlock(smartFilter, "Intensity", ConnectionPointType.Float, 0.5);
    //         input.output.connectTo(block.intensity);
    //         return Promise.resolve(block);
    //     },
    //     category: "Effects",
    //     tooltip: "Applies a desaturated effect to the input texture",
    // },
    // {
    //     name: "ContrastBlock",
    //     factory: (smartFilter: SmartFilter) => {
    //         const block = new ContrastBlock(smartFilter, "Contrast");
    //         const input = new InputBlock(smartFilter, "Intensity", ConnectionPointType.Float, 0.5);
    //         input.output.connectTo(block.intensity);
    //         return Promise.resolve(block);
    //     },
    //     category: "Effects",
    //     tooltip: "Change the contrast of the input texture",
    // },
    // {
    //     name: "GreenScreenBlock",
    //     factory: (smartFilter: SmartFilter) => {
    //         const block = new GreenScreenBlock(smartFilter, "GreenScreen");
    //         const reference = new InputBlock(smartFilter, "Reference", ConnectionPointType.Color3, {
    //             r: 92 / 255,
    //             g: 204 / 255,
    //             b: 78 / 255,
    //         });
    //         const distance = new InputBlock(smartFilter, "Distance", ConnectionPointType.Float, 0.25);
    //         reference.output.connectTo(block.reference);
    //         distance.output.connectTo(block.distance);
    //         return Promise.resolve(block);
    //     },
    //     category: "Effects",
    //     tooltip: "Replaces a green screen background with a different texture",
    // },
    // {
    //     name: "GlitchBlock",
    //     factory: (smartFilter: SmartFilter) => Promise.resolve(new GlitchBlock(smartFilter, "Glitch")),
    //     category: "Transitions",
    //     tooltip: "Funky glitch transition",
    // },
    // {
    //     name: "TileBlock",
    //     factory: (smartFilter: SmartFilter) => Promise.resolve(new TileBlock(smartFilter, "Tile")),
    //     category: "Transitions",
    //     tooltip: "Transition from one texture to another using tiles",
    // },
    // {
    //     name: "WipeBlock",
    //     factory: (smartFilter: SmartFilter) => Promise.resolve(new WipeBlock(smartFilter, "Wipe")),
    //     category: "Transitions",
    //     tooltip: "Transition from one texture to another using a wipe",
    // },
    // {
    //     name: "PixelateBlock",
    //     factory: (smartFilter: SmartFilter) => {
    //         const block = new PixelateBlock(smartFilter, "Pixelate");
    //         const input = new InputBlock(smartFilter, "Intensity", ConnectionPointType.Float, 0.4);
    //         input.output.connectTo(block.intensity);
    //         return Promise.resolve(block);
    //     },
    //     category: "Effects",
    //     tooltip: "Add pixelation to the input texture",
    // },
    // {
    //     name: "ExposureBlock",
    //     factory: (smartFilter: SmartFilter) => {
    //         const block = new ExposureBlock(smartFilter, "Exposure");
    //         const input = new InputBlock(smartFilter, "Amount", ConnectionPointType.Float, 0.7);
    //         input.output.connectTo(block.amount);
    //         return Promise.resolve(block);
    //     },
    //     category: "Effects",
    //     tooltip: "Alters the exposure of the input texture",
    // },
    // {
    //     name: "MaskBlock",
    //     factory: (smartFilter: SmartFilter) => Promise.resolve(new MaskBlock(smartFilter, "Mask")),
    //     category: "Effects",
    //     tooltip: "Applies mask in one texture to another texture",
    // },
    // {
    //     name: "SketchBlock",
    //     factory: (smartFilter: SmartFilter) => Promise.resolve(new SketchBlock(smartFilter, "Sketch")),
    //     category: "Effects",
    //     tooltip: "Adds a hand-drawn sketch effect to the input texture",
    // },
    // {
    //     name: "SpritesheetBlock",
    //     factory: (smartFilter: SmartFilter) => Promise.resolve(new SpritesheetBlock(smartFilter, "Spritesheet")),
    //     category: "Effects",
    //     tooltip: "Animates a sprite sheet texture",
    // },
    // {
    //     name: "TintBlock",
    //     factory: (smartFilter: SmartFilter) =>
    //         Promise.resolve(CustomShaderBlock.Create(smartFilter, "Tint", deserializedTintBlockDefinition)),
    //     category: "Effects",
    //     tooltip: "Adds colored tint to the input texture",
    // },
    // {
    //     name: "PremultiplyAlphaBlock",
    //     factory: (smartFilter: SmartFilter) =>
    //         Promise.resolve(new PremultiplyAlphaBlock(smartFilter, "PremultiplyAlpha")),
    //     category: "Utility",
    //     tooltip: "Premultiplies the input texture's color against its alpha",
    // },
];
