import type { SmartFilter, AnyInputBlock } from "@babylonjs/smart-filters";
import { ConnectionPointType } from "@babylonjs/smart-filters";

export class BlockTools {
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
            case ConnectionPointType.Color4:
                color = "#be5126";
                break;
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
            case "[Inputs].[Float]":
                return ConnectionPointType.Float;
            case "[Inputs].[Texture]":
                return ConnectionPointType.Texture;
            case "[Inputs].[Color3]":
                return ConnectionPointType.Color3;
            case "[Inputs].[Color4]":
                return ConnectionPointType.Color4;
            case "[Inputs].[Vector2]":
                return ConnectionPointType.Vector2;
            case "[Inputs].[WebCam]":
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
            case ConnectionPointType.Color4:
                return "Color4";
            case ConnectionPointType.Texture:
                return "Texture";
            case ConnectionPointType.Vector2:
                return "Vector2";
        }

        return "";
    }

    /**
     * Gets the list of all input blocks attached to the Smart Filter.
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
