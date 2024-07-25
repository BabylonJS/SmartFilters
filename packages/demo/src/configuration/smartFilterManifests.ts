import type { SmartFilterManifest } from "../smartFilterLoader";
import { simpleLogoSmartFilterName, createSimpleLogoSmartFilter } from "../smartFilters/hardCoded/simpleLogo";
import { simpleWebcamSmartFilterName, createSimpleWebcamSmartFilter } from "../smartFilters/hardCoded/simpleWebcam";

/**
 * The manifests describing all of the Smart Filters than can be loaded in the app's
 * UI.
 */
export const smartFilterManifests: SmartFilterManifest[] = [
    {
        name: simpleLogoSmartFilterName,
        createSmartFilter: createSimpleLogoSmartFilter,
    },
    {
        name: simpleWebcamSmartFilterName,
        createSmartFilter: createSimpleWebcamSmartFilter,
    },
];
