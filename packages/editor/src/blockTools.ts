import type { Nullable } from "@babylonjs/core/types";
import type { SmartFilter, BaseBlock, AnyInputBlock } from "@babylonjs/smart-filters";
import { InputBlock, ConnectionPointType, CopyBlock } from "@babylonjs/smart-filters";
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
} from "./demoBlocks/index.js";

export class BlockTools {
    public static GetBlockFromString(data: string, smartFilter: SmartFilter): Nullable<BaseBlock> {
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

    public static GetColorFromConnectionNodeType(type: ConnectionPointType) {
        let color = "#880000";
        switch (type) {
            case ConnectionPointType.Boolean:
                color = "#228e0f";
                break;
            case ConnectionPointType.Float:
                color = "#cb9e27";
                break;
            // case NodeMaterialBlockConnectionPointTypes.Vector2:
            //     color = "#16bcb1";
            //     break;
            // case NodeMaterialBlockConnectionPointTypes.Vector3:
            case ConnectionPointType.Color3:
                color = "#b786cb";
                break;
            // case NodeMaterialBlockConnectionPointTypes.Vector4:
            // case NodeMaterialBlockConnectionPointTypes.Color4:
            //     color = "#be5126";
            //     break;
            // case NodeMaterialBlockConnectionPointTypes.Matrix:
            //     color = "#591990";
            //     break;
            case ConnectionPointType.Texture:
                color = "#6174FA";
                break;
        }

        return color;
    }

    public static GetConnectionNodeTypeFromString(type: string) {
        switch (type) {
            case "Float":
                return ConnectionPointType.Float;
            case "Texture":
                return ConnectionPointType.Texture;
            case "Color3":
                return ConnectionPointType.Color3;
            case "WebCam":
                return ConnectionPointType.Texture;
        }

        // TODO AutoDetect...
        return ConnectionPointType.Float;
    }

    public static GetStringFromConnectionNodeType(type: ConnectionPointType) {
        switch (type) {
            case ConnectionPointType.Float:
                return "Float";
            case ConnectionPointType.Color3:
                return "Color3";
            case ConnectionPointType.Texture:
                return "Texture";
        }

        return "";
    }

    public static IsUniqueBlock(block: BaseBlock) {
        if (block.getClassName() === "OutputBlock") {
            return true;
        }

        return false;
    }

    /**
     * Gets the list of all input blocks attached to the video filter.
     * @returns The list of input blocks
     */
    public static GetInputBlocks(smartFilter: SmartFilter): AnyInputBlock[] {
        const blocks: AnyInputBlock[] = [];
        for (const block of smartFilter.attachedBlocks) {
            if (block.isInput) {
                blocks.push(block as AnyInputBlock);
            }
        }

        return blocks;
    }
}
