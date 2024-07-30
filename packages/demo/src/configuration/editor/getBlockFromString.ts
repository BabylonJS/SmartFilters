import { ConnectionPointType, CopyBlock, InputBlock, type SmartFilter } from "@babylonjs/smart-filters";
import {
    BlackAndWhiteAndBlurBlock,
    BlackAndWhiteBlock,
    BlurBlock,
    CompositionBlock,
    ContrastBlock,
    DesaturateBlock,
    FrameBlock,
    GlassBlock,
    GlitchBlock,
    GreenScreenBlock,
    KaleidoscopeBlock,
    PixelateBlock,
    PosterizeBlock,
    TileBlock,
    WipeBlock,
} from "../blocks";

export function getBlockFromString(data: string, smartFilter: SmartFilter) {
    switch (data) {
        case "GlitchBlock":
            return new GlitchBlock(smartFilter, "Glitch");
        case "TileBlock":
            return new TileBlock(smartFilter, "Tile");
        case "WipeBlock":
            return new WipeBlock(smartFilter, "Wipe");
        case "CopyBlock":
            return new CopyBlock(smartFilter, "Copy");
        case "BlackAndWhiteBlock":
            return new BlackAndWhiteBlock(smartFilter, "BlackAndWhite");
        case "BlurBlock":
            return new BlurBlock(smartFilter, "BlurBlock");
        case "BlackAndWhiteAndBlurBlock":
            return new BlackAndWhiteAndBlurBlock(smartFilter, "BlackAndWhiteAndBlurBlock");
        case "CompositionBlock": {
            const block = new CompositionBlock(smartFilter, "Composition");
            const top = new InputBlock(smartFilter, "Top", ConnectionPointType.Float, 0.0);
            const left = new InputBlock(smartFilter, "Left", ConnectionPointType.Float, 0.0);
            const width = new InputBlock(smartFilter, "With", ConnectionPointType.Float, 1.0);
            const height = new InputBlock(smartFilter, "Height", ConnectionPointType.Float, 1.0);

            top.output.connectTo(block.foregroundTop);
            left.output.connectTo(block.foregroundLeft);
            width.output.connectTo(block.foregroundWidth);
            height.output.connectTo(block.foregroundHeight);
            return block;
        }
        case "FrameBlock":
            return new FrameBlock(smartFilter, "Frame");
        case "GlassBlock":
            return new GlassBlock(smartFilter, "Glass");
        case "KaleidoscopeBlock": {
            const block = new KaleidoscopeBlock(smartFilter, "Kaleidoscope");
            const input = new InputBlock(smartFilter, "Angle", ConnectionPointType.Float, 0);
            input.output.connectTo(block.time);
            return block;
        }
        case "PixelateBlock": {
            const block = new PixelateBlock(smartFilter, "Pixelate");
            const input = new InputBlock(smartFilter, "Intensity", ConnectionPointType.Float, 0.4);
            input.output.connectTo(block.intensity);
            return block;
        }
        case "PosterizeBlock": {
            const block = new PosterizeBlock(smartFilter, "Posterize");
            const input = new InputBlock(smartFilter, "Intensity", ConnectionPointType.Float, 0.5);
            input.output.connectTo(block.intensity);
            return block;
        }
        case "DesaturateBlock": {
            const block = new DesaturateBlock(smartFilter, "Desaturate");
            const input = new InputBlock(smartFilter, "Intensity", ConnectionPointType.Float, 0.5);
            input.output.connectTo(block.intensity);
            return block;
        }
        case "ContrastBlock": {
            const block = new ContrastBlock(smartFilter, "Contrast");
            const input = new InputBlock(smartFilter, "Intensity", ConnectionPointType.Float, 0.5);
            input.output.connectTo(block.intensity);
            return block;
        }
        case "GreenScreenBlock": {
            const block = new GreenScreenBlock(smartFilter, "GreenScreen");
            const reference = new InputBlock(smartFilter, "Reference", ConnectionPointType.Color3, {
                r: 92 / 255,
                g: 204 / 255,
                b: 78 / 255,
            });
            const distance = new InputBlock(smartFilter, "Distance", ConnectionPointType.Float, 0.25);
            reference.output.connectTo(block.reference);
            distance.output.connectTo(block.distance);
            return block;
        }
    }

    return null;
}
