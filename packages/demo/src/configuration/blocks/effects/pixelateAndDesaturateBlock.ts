import { type SerializedBlockDefinition } from "@babylonjs/smart-filters";

/**
 * This is included to show how a serialized aggregate block definition can be loaded and used.
 * This object could have been deserialized from a JSON file, for example.
 */
export const pixelateAndDesaturateBlockDefinition: SerializedBlockDefinition = {
    format: "smartFilter",
    formatVersion: 1,
    name: "PixelateAndDesaturate",
    blockType: "PixelateAndDesaturateBlock",
    comments: null,
    editorData: {
        locations: [
            {
                blockId: 1,
                x: 1100,
                y: 100,
                isCollapsed: false,
            },
            {
                blockId: 2,
                x: 0,
                y: 0,
                isCollapsed: false,
            },
            {
                blockId: 4,
                x: 360,
                y: 100,
                isCollapsed: false,
            },
            {
                blockId: 5,
                x: 100,
                y: 260,
                isCollapsed: false,
            },
            {
                blockId: 34,
                x: 740,
                y: 240,
                isCollapsed: false,
            },
            {
                blockId: 35,
                x: 140,
                y: 400,
                isCollapsed: false,
            },
        ],
        x: 16.25,
        y: -11.25,
        zoom: 1,
    },
    blocks: [
        {
            name: "output",
            uniqueId: 1,
            blockType: "OutputBlock",
            comments: null,
            data: null,
        },
        {
            name: "logo",
            uniqueId: 2,
            blockType: "InputBlock",
            comments: null,
            data: {
                inputType: 2,
                url: "/assets/logo.png",
                urlTypeHint: null,
                flipY: true,
                anisotropicFilteringLevel: 4,
                forcedExtension: null,
            },
        },
        {
            name: "pixelate",
            uniqueId: 4,
            blockType: "PixelateBlock",
            comments: null,
            data: null,
        },
        {
            name: "Pixelate",
            uniqueId: 5,
            blockType: "InputBlock",
            comments: null,
            data: {
                inputType: 1,
                value: 0.4,
                animationType: null,
                valueDeltaPerMs: null,
                min: null,
                max: null,
            },
        },
        {
            name: "Desaturate",
            uniqueId: 34,
            blockType: "DesaturateBlock",
            comments: null,
            data: null,
        },
        {
            name: "Desaturate",
            uniqueId: 35,
            blockType: "InputBlock",
            comments: null,
            data: {
                inputType: 1,
                value: 0.26,
                animationType: null,
                valueDeltaPerMs: null,
                min: 0,
                max: 1,
            },
        },
    ],
    connections: [
        {
            inputBlock: 1,
            inputConnectionPoint: "input",
            outputBlock: 34,
            outputConnectionPoint: "output",
        },
        {
            inputBlock: 4,
            inputConnectionPoint: "input",
            outputBlock: 2,
            outputConnectionPoint: "output",
        },
        {
            inputBlock: 4,
            inputConnectionPoint: "intensity",
            outputBlock: 5,
            outputConnectionPoint: "output",
        },
        {
            inputBlock: 34,
            inputConnectionPoint: "input",
            outputBlock: 4,
            outputConnectionPoint: "output",
        },
        {
            inputBlock: 34,
            inputConnectionPoint: "intensity",
            outputBlock: 35,
            outputConnectionPoint: "output",
        },
    ],
};
