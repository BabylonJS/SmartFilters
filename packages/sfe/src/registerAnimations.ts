import { ConnectionPointType, type SmartFilter, type InputBlock } from "@babylonjs/smart-filters";
import type { SmartFilterRenderer } from "./smartFilterRenderer.js";
import { WebCamInputBlock } from "./blocks/inputs/webCamInputBlock.js";

/**
 * Registers animations for the Smart Filter.
 * @param smartFilter - The Smart Filter to register animations for
 * @param renderer - The Smart Filter renderer
 * @returns A function to unregister the animations
 */
export function registerAnimations(smartFilter: SmartFilter, renderer: SmartFilterRenderer): () => void {
    const disposeWork: (() => void)[] = [];

    for (const block of smartFilter.attachedBlocks) {
        if (block.getClassName() === "InputBlock" && (block as any).type === ConnectionPointType.Float) {
            const inputBlock = block as InputBlock<ConnectionPointType.Float>;
            if (inputBlock.editorData?.animationType === "time") {
                let deltaPerMs = 0;
                let currentTime = performance.now();
                let lastTime = performance.now();

                const observer = renderer.beforeRenderObservable.add(() => {
                    currentTime = performance.now();
                    deltaPerMs = inputBlock.editorData?.valueDeltaPerMs ?? 0.001;
                    inputBlock.runtimeValue.value += (currentTime - lastTime) * deltaPerMs;
                    lastTime = currentTime;
                });

                disposeWork.push(() => {
                    renderer.beforeRenderObservable.remove(observer);
                });
            }
        } else if (block instanceof WebCamInputBlock) {
            const webCamRuntime = block.initializeWebCamRuntime();
            disposeWork.push(() => {
                webCamRuntime.dispose();
            });
        }
    }

    return () => {
        for (const disposeWorkToDo of disposeWork) {
            disposeWorkToDo();
        }
    };
}
