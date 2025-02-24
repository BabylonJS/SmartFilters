import type { ThinEngine } from "@babylonjs/core/Engines/thinEngine";
import { ThinTexture } from "@babylonjs/core/Materials/Textures/thinTexture.js";
import type { Observable } from "@babylonjs/core/Misc/observable";
import type { Nullable } from "@babylonjs/core/types";
import { type ConnectionPointType, type InputBlock } from "@babylonjs/smart-filters";
/**
 * The result of loading a texture for a texture InputBlock.
 */
export type LoadResult = {
    /**
     * The loaded texture.
     */
    texture: ThinTexture;
    /**
     * The dispose function for the texture.
     */
    dispose: () => void;
};
/**
 * Loads the texture for a texture InputBlock for use in the demo app.
 * Note: this must not be used in production code, it is intended only for the demo app.
 * @param inputBlock - The InputBlock to load the texture for
 * @param engine - The ThinEngine to create the texture with
 * @param beforeRenderObservable - Observable which is notified before rendering each frame
 * @returns The texture and dispose function for it, or null if the texture could not be loaded
 */
export declare function loadTextureInputBlockAsset(inputBlock: InputBlock<ConnectionPointType.Texture>, engine: ThinEngine, beforeRenderObservable: Observable<void>): Promise<Nullable<LoadResult>>;
/**
 * The type of the loaded video texture.
 */
export type EditorLoadedVideoTexture = {
    /**
     * The loaded video texture.
     */
    videoTexture: ThinTexture;
    /**
     * The update function for the video texture.
     */
    update: () => void;
    /**
     * The dispose function for the video element and textures.
     */
    disposeVideoElementAndTextures: () => void;
};
/**
 * A helper for the editor which creates a texture from a video file using an HTMLVideoElement.
 * This approach would not be suitable for production use, but is handy for prototyping and demos.
 *
 * @param engine - The ThinEngine to create the texture with
 * @param url - The URL of the video file to create a texture from
 * @returns A promise that resolves to the loaded video texture
 */
export declare function createVideoTextureAsync(engine: ThinEngine, url: string): Promise<EditorLoadedVideoTexture>;
//# sourceMappingURL=demoTextureLoaders.d.ts.map