import type { ThinEngine } from "@babylonjs/core/Engines/thinEngine";
import { ThinTexture } from "@babylonjs/core/Materials/Textures/thinTexture";

export type DemoVideoTexture = {
    videoTexture: ThinTexture;
    update: () => void;
};

/**
 * A helper for the demo app which creates a texture from a video file using an HTMLVideoElement.
 * This approach would not be suitable for production use, but is handy for the demo app.
 *
 * @param engine - The ThinEngine to create the texture with
 * @param url - The URL of the video file to create a texture from
 */
export function createVideoTextureAsync(engine: ThinEngine, url: string): Promise<DemoVideoTexture> {
    return new Promise((resolve, reject) => {
        const hiddenVideo = document.createElement("video");
        document.body.append(hiddenVideo);
        hiddenVideo.style.display = "none";
        hiddenVideo.setAttribute("playsinline", "");
        hiddenVideo.muted = true;
        hiddenVideo.autoplay = true;
        hiddenVideo.loop = true;

        hiddenVideo.onloadeddata = () => {
            const internalVideoTexture = engine.createDynamicTexture(
                hiddenVideo.videoWidth,
                hiddenVideo.videoHeight,
                false,
                2
            );

            const update = () => {
                if (hiddenVideo.readyState < hiddenVideo.HAVE_CURRENT_DATA) {
                    return;
                }

                engine.updateVideoTexture(internalVideoTexture, hiddenVideo, false);
            };

            update();

            const videoTexture = new ThinTexture(internalVideoTexture);
            resolve({ videoTexture, update });
        };

        hiddenVideo.src = url;
        hiddenVideo.onerror = (error) => {
            reject(error);
        };
        hiddenVideo.play();
    });
}
