import { ThinTexture } from "@babylonjs/core/Materials/Textures/thinTexture.js";
import { type ThinEngine } from "@babylonjs/core/Engines/thinEngine.js";

/**
 * Helper that takes in a URL to an image and returns a ThinTexture
 * @param engine - defines the engine to use to create the texture
 * @param url - defines a value which contains one of the following:
 * * A conventional http URL, e.g. 'http://...' or 'file://...'
 * * A base64 string of in-line texture data, e.g. 'data:image/jpg;base64,/...'
 * @param flipY - Indicates if the Y axis should be flipped
 * @param samplingMode - The sampling mode to use
 * @returns A ThinTexture of the image
 */
export function createImageTexture(
    engine: ThinEngine,
    url: string,
    flipY: boolean = true,
    samplingMode: number | undefined = undefined
): ThinTexture {
    const internalTexture = engine.createTexture(url, true, flipY, null, samplingMode);
    return new ThinTexture(internalTexture);
}

/*
    Future util ideas:
        HtmlElementTexture
        WebCamTexture
*/
