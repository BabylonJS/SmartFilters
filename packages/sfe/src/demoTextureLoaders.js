import { ThinTexture } from "@babylonjs/core/Materials/Textures/thinTexture.js";
import { createImageTexture } from "@babylonjs/smart-filters";
/**
 * Loads the texture for a texture InputBlock for use in the demo app.
 * Note: this must not be used in production code, it is intended only for the demo app.
 * @param inputBlock - The InputBlock to load the texture for
 * @param engine - The ThinEngine to create the texture with
 * @param beforeRenderObservable - Observable which is notified before rendering each frame
 * @returns The texture and dispose function for it, or null if the texture could not be loaded
 */
export async function loadTextureInputBlockAsset(inputBlock, engine, beforeRenderObservable) {
    const editorData = inputBlock.editorData;
    // Look at the editor data to determine if we can load a texture
    if (editorData && editorData.url) {
        switch (editorData.urlTypeHint) {
            case "video":
                {
                    const { videoTexture, update, disposeVideoElementAndTextures } = await createVideoTextureAsync(engine, editorData.url);
                    const observer = beforeRenderObservable.add(() => {
                        update();
                    });
                    if (videoTexture && editorData.anisotropicFilteringLevel !== null) {
                        videoTexture.anisotropicFilteringLevel = editorData.anisotropicFilteringLevel;
                    }
                    inputBlock.output.runtimeData.value = videoTexture;
                    return {
                        texture: videoTexture,
                        dispose: () => {
                            beforeRenderObservable.remove(observer);
                            disposeVideoElementAndTextures();
                        },
                    };
                }
                break;
            case "image":
            default:
                {
                    const texture = createImageTexture(engine, editorData.url, editorData.flipY);
                    if (texture && editorData.anisotropicFilteringLevel !== null) {
                        texture.anisotropicFilteringLevel = editorData.anisotropicFilteringLevel;
                    }
                    inputBlock.output.runtimeData.value = texture;
                    return {
                        texture,
                        dispose: texture.dispose,
                    };
                }
                break;
        }
    }
    return null;
}
/**
 * A helper for the editor which creates a texture from a video file using an HTMLVideoElement.
 * This approach would not be suitable for production use, but is handy for prototyping and demos.
 *
 * @param engine - The ThinEngine to create the texture with
 * @param url - The URL of the video file to create a texture from
 * @returns A promise that resolves to the loaded video texture
 */
export function createVideoTextureAsync(engine, url) {
    return new Promise((resolve, reject) => {
        let hiddenVideo = document.createElement("video");
        document.body.appendChild(hiddenVideo);
        hiddenVideo.crossOrigin = "anonymous";
        hiddenVideo.style.display = "none";
        hiddenVideo.setAttribute("playsinline", "");
        hiddenVideo.muted = true;
        hiddenVideo.autoplay = true;
        hiddenVideo.loop = true;
        hiddenVideo.onloadeddata = () => {
            if (!hiddenVideo) {
                return;
            }
            let internalVideoTexture = engine.createDynamicTexture(hiddenVideo.videoWidth, hiddenVideo.videoHeight, false, 2);
            const update = () => {
                if (!hiddenVideo || hiddenVideo.readyState < hiddenVideo.HAVE_CURRENT_DATA) {
                    return;
                }
                engine.updateVideoTexture(internalVideoTexture, hiddenVideo, false);
            };
            update();
            let videoTexture = new ThinTexture(internalVideoTexture);
            resolve({
                videoTexture,
                update,
                disposeVideoElementAndTextures: () => {
                    if (hiddenVideo) {
                        hiddenVideo.onloadeddata = null;
                        hiddenVideo.pause();
                        hiddenVideo.srcObject = null;
                        document.body.removeChild(hiddenVideo);
                        hiddenVideo = null;
                    }
                    if (videoTexture) {
                        videoTexture.dispose();
                        videoTexture = null;
                    }
                    if (internalVideoTexture) {
                        internalVideoTexture.dispose();
                        internalVideoTexture = null;
                    }
                },
            });
        };
        hiddenVideo.src = url;
        hiddenVideo.onerror = (error) => {
            reject(error);
        };
        hiddenVideo.play();
    });
}
//# sourceMappingURL=demoTextureLoaders.js.map