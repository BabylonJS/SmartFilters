import type { RenderTargetWrapper } from "@babylonjs/core/Engines/renderTargetWrapper";
import type { Nullable } from "@babylonjs/core/types";
import { createCommand } from "../command/command.js";
import type { BaseBlock } from "../blocks/baseBlock";
import type { ShaderRuntime } from "../runtime/shaderRuntime";
import type { InternalSmartFilterRuntime } from "../runtime/smartFilterRuntime";

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
    renderTargetWrapper: Nullable<RenderTargetWrapper>,
    runtime: InternalSmartFilterRuntime,
    commandOwner: BaseBlock,
    shaderBlockRuntime: ShaderRuntime
): void {
    const commandOwnerClassName = commandOwner.getClassName();
    if (renderTargetWrapper) {
        runtime.registerCommand(
            createCommand(`${commandOwnerClassName}.renderToFinalTexture`, commandOwner, () => {
                shaderBlockRuntime.renderToTexture(renderTargetWrapper);
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
