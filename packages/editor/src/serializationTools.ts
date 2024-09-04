import type { ThinEngine } from "@babylonjs/core/Engines/thinEngine";
import { ThinTexture } from "@babylonjs/core/Materials/Textures/thinTexture.js";
import {
    createImageTexture,
    type ConnectionPointType,
    type InputBlock,
    type SmartFilter,
} from "@babylonjs/smart-filters";
import type { GlobalState } from "./globalState";
import type { GraphCanvasComponent } from "@babylonjs/shared-ui-components/nodeGraphSystem/graphCanvas";
import type { Observable } from "@babylonjs/core/Misc/observable";
import type { Nullable } from "@babylonjs/core/types";

/**
 * Sets the SmartFilter's stored editor data (block locations, canvas position, zoom) using the current graph canvas state.
 * @param smartFilter - Target SmartFilter to update
 * @param globalState - State of the editor
 * @param graphCanvas - Graph canvas to pull data from
 */
export function setEditorData(smartFilter: SmartFilter, globalState: GlobalState, graphCanvas: GraphCanvasComponent) {
    smartFilter.editorData = {
        locations: [],
        x: graphCanvas.x,
        y: graphCanvas.y,
        zoom: graphCanvas.zoom,
    };

    for (const block of smartFilter.attachedBlocks) {
        const node = globalState.onGetNodeFromBlock(block);
        if (node) {
            smartFilter.editorData.locations.push({
                blockId: block.uniqueId,
                x: node.x,
                y: node.y,
            });
        }
    }
}

/**
 * Loads the texture for a texture InputBlock for use in the Editor.
 * Note: this must not be used in production code, it is intended only for the editor.
 * @param inputBlock - The InputBlock to load the texture for
 * @param engine - The ThinEngine to create the texture with
 * @param beforeRenderObservable - Observable which is notified before rendering each frame
 * @returns A function to dispose of the textures when they are no longer needed, or null if no textures were loaded
 */
export async function loadTextureInputBlockAsset(
    inputBlock: InputBlock<ConnectionPointType.Texture>,
    engine: ThinEngine,
    beforeRenderObservable: Observable<void>
): Promise<Nullable<() => void>> {
    const editorData = inputBlock.editorData;

    // Look at the editor data to determine if we can load a texture
    if (editorData && editorData.url) {
        // Unload the texture if it already has a value
        if (inputBlock.output.runtimeData.value !== null) {
            inputBlock.output.runtimeData.value = null;
            if (editorData && editorData.dispose) {
                editorData.dispose();
                editorData.dispose = null;
            }
        }

        switch (editorData.urlTypeHint) {
            case "video":
                {
                    const { videoTexture, update } = await createVideoTextureAsync(engine, editorData.url);
                    const observer = beforeRenderObservable.add(() => {
                        update();
                    });

                    if (videoTexture && editorData.anisotropicFilteringLevel !== null) {
                        videoTexture.anisotropicFilteringLevel = editorData.anisotropicFilteringLevel;
                    }

                    inputBlock.output.runtimeData.value = videoTexture;
                    editorData.dispose = () => {
                        beforeRenderObservable.remove(observer);
                        videoTexture.dispose();
                    };

                    return editorData.dispose;
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
                    editorData.dispose = () => {
                        texture.dispose();
                    };

                    return editorData.dispose;
                }
                break;
        }
    }

    return null;
}

export type EditorLoadedVideoTexture = {
    videoTexture: ThinTexture;
    update: () => void;
};

/**
 * A helper for the editor which creates a texture from a video file using an HTMLVideoElement.
 * This approach would not be suitable for production use, but is handy for prototyping and demos.
 *
 * @param engine - The ThinEngine to create the texture with
 * @param url - The URL of the video file to create a texture from
 */
export function createVideoTextureAsync(engine: ThinEngine, url: string): Promise<EditorLoadedVideoTexture> {
    return new Promise((resolve, reject) => {
        const hiddenVideo = document.createElement("video");
        document.body.append(hiddenVideo);
        hiddenVideo.crossOrigin = "anonymous";
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
