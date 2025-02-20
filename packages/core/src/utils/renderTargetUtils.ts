import type { RenderTargetWrapper } from "@babylonjs/core/Engines/renderTargetWrapper";
import type { Nullable } from "@babylonjs/core/types";
import { createCommand } from "../command/command.js";
import type { BaseBlock } from "../blocks/baseBlock";
import type { ShaderRuntime } from "../runtime/shaderRuntime";
import type { InternalSmartFilterRuntime } from "../runtime/smartFilterRuntime";
import type { ThinRenderTargetTexture } from "@babylonjs/core/Materials/Textures/thinRenderTargetTexture.js";
import type { StrongRef } from "../runtime/strongRef.js";

/**
 * Tries to get a renderTargetWrapper from a ThinRenderTargetTexture, and throws an error if it fails.
 * @param renderTargetTexture - The ThinRenderTargetTexture to get the renderTarget from.
 * @param callerName - The name of the component calling this one, used for a more descriptive error message.
 * @returns - The renderTarget or it throws an Error if it fails.
 */
export function getRenderTargetWrapper(
    renderTargetTexture: Nullable<ThinRenderTargetTexture>,
    callerName: string
): RenderTargetWrapper {
    const renderTarget = renderTargetTexture?.renderTarget;
    if (!renderTarget) {
        throw new Error(`${callerName} could not get a renderTarget it needed.`);
    }
    return renderTarget;
}

/**
 * Registers the final command of the command queue - the one that draws to either the canvas or
 * renderTargetTexture.
 * @param renderTargetWrapper - If non-null, the RenderTargetWrapper to render to, otherwise the command will
 * render to the canvas.
 * @param runtime - The smart filter runtime to use.
 * @param commandOwner - The owner of the command.
 * @param shaderBlockRuntime - The shader block runtime to use.
 */
export function registerFinalRenderCommand(
    renderTargetWrapper: Nullable<StrongRef<RenderTargetWrapper>>,
    runtime: InternalSmartFilterRuntime,
    commandOwner: BaseBlock,
    shaderBlockRuntime: ShaderRuntime
): void {
    const commandOwnerBlockType = commandOwner.blockType;
    if (renderTargetWrapper) {
        runtime.registerCommand(
            createCommand(`${commandOwnerBlockType}.renderToFinalTexture`, commandOwner, () => {
                shaderBlockRuntime.renderToStrongRefTexture(renderTargetWrapper);
            })
        );
    } else {
        runtime.registerCommand(
            createCommand(`${commandOwnerBlockType}.renderToCanvas`, commandOwner, () => {
                shaderBlockRuntime.renderToCanvas();
            })
        );
    }
}
