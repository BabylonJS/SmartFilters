import type { SmartFilterManifest } from "../smartFilterLoader";
import { simpleLogoSmartFilterName, createSimpleLogoSmartFilter } from "../smartFilters/hardCoded/simpleLogo";
import { simpleWebcamSmartFilterName, createSimpleWebcamSmartFilter } from "../smartFilters/hardCoded/simpleWebcam";

/**
 * The manifests describing all of the Smart Filters than can be loaded in the app's
 * UI.
 */
export const smartFilterManifests: SmartFilterManifest[] = [
    {
        type: "HardCoded",
        name: simpleLogoSmartFilterName,
        createSmartFilter: createSimpleLogoSmartFilter,
    },
    {
        type: "HardCoded",
        name: simpleWebcamSmartFilterName,
        createSmartFilter: createSimpleWebcamSmartFilter,
    },
    {
        type: "Serialized",
        name: "Serialization Test",
        smartFilterString: `
            {
            "version": 1,
            "name": "Serialization Test",
            "blocks": [
                {
                "name": "output",
                "className": "OutputBlock",
                "comments": ""
                },
                {
                "name": "logo",
                "className": "InputBlock",
                "comments": null,
                "data": {
                    "inputType": 2,
                    "url": "/assets/logo.png"
                }
                },
                {
                "name": "blackAndWhite",
                "className": "BlackAndWhiteBlock",
                "comments": ""
                },
                {
                "name": "pixelate",
                "className": "PixelateBlock",
                "comments": ""
                },
                {
                "name": "intensity",
                "className": "InputBlock",
                "comments": null,
                "data": {
                    "inputType": 1,
                    "value": 0.4
                }
                }
            ],
            "connections": [
                {
                "inputBlock": "output",
                "inputConnectionPoint": "input",
                "outputBlock": "pixelate",
                "outputConnectionPoint": "output"
                },
                {
                "inputBlock": "blackAndWhite",
                "inputConnectionPoint": "input",
                "outputBlock": "logo",
                "outputConnectionPoint": "output"
                },
                {
                "inputBlock": "pixelate",
                "inputConnectionPoint": "input",
                "outputBlock": "blackAndWhite",
                "outputConnectionPoint": "output"
                },
                {
                "inputBlock": "pixelate",
                "inputConnectionPoint": "intensity",
                "outputBlock": "intensity",
                "outputConnectionPoint": "output"
                }
            ]
            }
        `,
    },
];
