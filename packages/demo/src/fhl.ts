import { app, videoEffects } from "@microsoft/teams-js";
import { LOCAL_SMART_FILTER_EFFECT_ID, SMART_FILTER_EFFECT_ID, SmartFilterVideoApp } from "./fhl/smartFilterVideoApp";
import { Observable } from "@babylonjs/core/Misc/observable";

// Read page elements
const likeButton = document.getElementById("likeButton") as HTMLButtonElement;
const outputCanvas = document.getElementById("outputCanvas") as HTMLCanvasElement;

// Register button click handlers
const onLikeClickedObservable = new Observable<void>();
likeButton.addEventListener("click", () => {
    onLikeClickedObservable.notifyObservers();
});

// Initialize the SmartFilter Video App
console.log("Initializing SmartFilter Video App...");
const videoApp = new SmartFilterVideoApp(outputCanvas, onLikeClickedObservable);

/**
 * Main function to initialize the app.
 */
async function main(): Promise<void> {
    console.log("Initializing SmartFilter Runtime...");
    await videoApp.initRuntime();

    try {
        console.log("Initializing Teams API...");
        await app.initialize();

        console.log("Registering for video effect selections...");
        videoEffects.registerForVideoEffect(videoApp.videoEffectSelected.bind(videoApp));

        console.log("Registering for video frame callbacks...");
        videoEffects.registerForVideoFrame({
            videoFrameHandler: videoApp.videoFrameHandler.bind(videoApp),
            /**
             * Callback function to process the video frames shared by the host.
             */
            videoBufferHandler: videoApp.videoBufferHandler.bind(videoApp),
            /**
             * Video frame configuration supplied to the host to customize the generated video frame parameters, like format
             */
            config: {
                format: videoEffects.VideoFrameFormat.NV12,
            },
        });

        // Tell Teams we want to show our effect
        videoEffects.notifySelectedVideoEffectChanged(
            videoEffects.EffectChangeType.EffectChanged,
            document.location.hostname.indexOf("localhost") !== -1
                ? LOCAL_SMART_FILTER_EFFECT_ID
                : SMART_FILTER_EFFECT_ID
        );
    } catch (e) {
        console.log("Initialize failed - not in Teams - running in debug mode:", e);
    }
}

main().catch((e) => {
    console.error(e);
});
