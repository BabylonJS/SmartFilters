import type { SmartFilterManifest } from "../smartFilterLoader";
import { simpleLogoSmartFilterName, createSimpleLogoSmartFilter } from "./smartFilters/hardCoded/simpleLogo";
import { simpleWebcamSmartFilterName, createSimpleWebcamSmartFilter } from "./smartFilters/hardCoded/simpleWebcam";
import * as serializedSimpleLogo from "./smartFilters/serialized/serializedSimpleLogo.json";

/**
 * The manifests describing all of the Smart Filters than can be loaded in the app's UI.
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
        name: "Serialized Simple Logo",
        smartFilterJson: serializedSimpleLogo,
    },
];
