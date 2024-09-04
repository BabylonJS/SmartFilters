import type { RenderTargetWrapper } from "@babylonjs/core/Engines/renderTargetWrapper";
import type { ThinRenderTargetTexture } from "@babylonjs/core/Materials/Textures/thinRenderTargetTexture";
import type { Nullable } from "@babylonjs/core/types";
import { createCommand } from "../command/command.js";
import type { BaseBlock } from "../blocks/baseBlock";
import type { ShaderRuntime } from "../runtime/shaderRuntime";
import type { InternalSmartFilterRuntime } from "../runtime/smartFilterRuntime";

/**
 * Tries to get a renderTarget from a renderTargetTexture, throws an error if it fails.
 * @param renderTargetTexture - The renderTargetTexture to get the renderTarget from.
 * @param callerName - The name of the component calling this one, used for a more descriptive error message.
 * @returns - The renderTarget or throws an Error if it fails.
 */
export function getRenderTarget(
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
 * @param renderTargetTexture - If non-null, the render target texture to render to, otherwise the command will
 * render to the canvas.
 * @param runtime - The smart filter runtime to use.
 * @param commandOwner - The owner of the command.
 * @param shaderBlockRuntime - The shader block runtime to use.
 */
export function registerFinalRenderCommand(
    renderTargetTexture: Nullable<ThinRenderTargetTexture>,
    runtime: InternalSmartFilterRuntime,
    commandOwner: BaseBlock,
    shaderBlockRuntime: ShaderRuntime
): void {
    const commandOwnerClassName = commandOwner.getClassName();
    if (renderTargetTexture) {
        const renderTarget = getRenderTarget(renderTargetTexture, commandOwnerClassName);
        runtime.registerCommand(
            createCommand(`${commandOwnerClassName}.renderToFinalTexture`, commandOwner, () => {
                shaderBlockRuntime.renderToTexture(renderTarget);
            })
        );
    } else {
        runtime.registerCommand(
            createCommand(`${commandOwnerClassName}.renderToCanvas`, commandOwner, () => {
                shaderBlockRuntime.renderToCanvas();
            })
        );
    }
}
