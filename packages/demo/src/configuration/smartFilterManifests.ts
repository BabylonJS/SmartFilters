import type { SmartFilterManifest } from "../smartFilterLoader";
import { createSimpleLogoSmartFilter } from "../smartFilters/hardCoded/simpleLogo";
import { createSimpleWebcamSmartFilter } from "../smartFilters/hardCoded/simpleWebcam";

/**
 * The manifests describing all of the Smart Filters than can be loaded in the app's
 * UI.
 */
export const smartFilterManifests: SmartFilterManifest[] = [
    {
        name: "Simple Logo",
        createSmartFilter: createSimpleLogoSmartFilter,
    },
    {
        name: "Simple Webcam",
        createSmartFilter: createSimpleWebcamSmartFilter,
    },
];
