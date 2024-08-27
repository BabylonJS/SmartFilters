import type { ThinEngine } from "@babylonjs/core/Engines/thinEngine";
import type { SmartFilterManifest } from "../smartFilterLoader";
import { HardCodedSmartFilterNames } from "./smartFilters/hardCoded/hardCodedSmartFilterNames";
import type { SmartFilterRenderer } from "../smartFilterRenderer";

/**
 * The manifests describing all of the Smart Filters than can be loaded in the app's UI.
 * Note: these are dynamically loaded so that the blocks aren't loaded unless they're needed.
 */
export const smartFilterManifests: SmartFilterManifest[] = [
    {
        type: "HardCoded",
        name: HardCodedSmartFilterNames.simpleLogo,
        createSmartFilter: async (engine: ThinEngine) => {
            const module = await import(/* webpackChunkName: "simpleLogo" */ "./smartFilters/hardCoded/simpleLogo");
            return module.createSimpleLogoSmartFilter(engine);
        },
    },
    {
        type: "HardCoded",
        name: HardCodedSmartFilterNames.simpleWebcam,
        createSmartFilter: async (engine: ThinEngine) => {
            const module = await import(/* webpackChunkName: "simpleWebcam" */ "./smartFilters/hardCoded/simpleWebcam");
            return module.createSimpleWebcamSmartFilter(engine);
        },
    },
    {
        type: "HardCoded",
        name: HardCodedSmartFilterNames.videoWithFrame,
        createSmartFilter: async (engine: ThinEngine, renderer: SmartFilterRenderer) => {
            const module = await import(
                /* webpackChunkName: "videoWithFrame" */ "./smartFilters/hardCoded/videoWithFrame"
            );
            return module.createVideoWithFrameSmartFilter(engine, renderer);
        },
    },
    {
        type: "HardCoded",
        name: HardCodedSmartFilterNames.simplePhotoEdit,
        createSmartFilter: async (engine: ThinEngine) => {
            const module = await import(
                /* webpackChunkName: "simplePhotoEdit" */ "./smartFilters/hardCoded/simplePhotoEdit"
            );
            return module.createSimplePhotoEditSmartFilter(engine);
        },
    },
    {
        type: "Serialized",
        name: "Serialized Simple Logo",
        getSmartFilterJson: async () => {
            return await import(
                /* webpackChunkName: "serializedSimpleLogo" */ "./smartFilters/serialized/serializedSimpleLogo.json"
            );
        },
    },
    {
        type: "HardCoded",
        name: HardCodedSmartFilterNames.videoReaction,
        createSmartFilter: async (engine: ThinEngine) => {
            const module = await import(
                /* webpackChunkName: "videoReaction" */ "./smartFilters/hardCoded/videoReaction"
            );
            return module.createVideoReactionSmartFilter(engine);
        },
    },
];
