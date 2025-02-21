import type { TextureSize } from "@babylonjs/core/Materials/Textures/textureCreationOptions";
import type { OutputTextureOptions } from "../blocks/textureOptions";
import type { SmartFilter } from "../smartFilter";
import type { ThinEngine } from "@babylonjs/core/Engines/thinEngine";

/**
 * Determines the output texture size for a given shader block
 * @param smartFilter - The smart filter to use
 * @param engine - The engine to use
 * @param textureOptions - The texture options to use
 * @returns - The output texture size
 */
export function getBlockOutputTextureSize(
    smartFilter: SmartFilter,
    engine: ThinEngine,
    textureOptions: OutputTextureOptions
): TextureSize {
    let outputWidth: number;
    let outputHeight: number;
    const renderTargetWrapper = smartFilter.outputBlock.renderTargetWrapper;
    if (renderTargetWrapper) {
        outputWidth = renderTargetWrapper.value.width;
        outputHeight = renderTargetWrapper.value.height;
    } else {
        outputWidth = engine.getRenderWidth(true);
        outputHeight = engine.getRenderHeight(true);
    }
    return {
        width: Math.floor(outputWidth * textureOptions.ratio),
        height: Math.floor(outputHeight * textureOptions.ratio),
    };
}
