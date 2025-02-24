import { ConnectionPointType, type SmartFilter, type InputBlock } from "@babylonjs/smart-filters";
import { WebCamInputBlock } from "../configuration/editorBlocks/webCamInputBlock/webCamInputBlock.js";
import type { Observable } from "@babylonjs/core/Misc/observable.js";

/**
 * Registers animations for the Smart Filter Editor specific to the editor blocks, such as the time and webcam blocks.
 * @param smartFilter - The Smart Filter to register animations for
 * @param beforeRenderObservable - The before render observable to register animations to
 * @returns A function to unregister the animations
 */
export function registerAnimations(smartFilter: SmartFilter, beforeRenderObservable: Observable<void>): () => void {
    const disposeWork: (() => void)[] = [];

    for (const block of smartFilter.attachedBlocks) {
        if (block.getClassName() === "InputBlock" && (block as any).type === ConnectionPointType.Float) {
            const inputBlock = block as InputBlock<ConnectionPointType.Float>;
            if (inputBlock.editorData?.animationType === "time") {
                let deltaPerMs = 0;
                let currentTime = performance.now();
                let lastTime = performance.now();

                const observer = beforeRenderObservable.add(() => {
                    currentTime = performance.now();
                    deltaPerMs = inputBlock.editorData?.valueDeltaPerMs ?? 0.001;
                    inputBlock.runtimeValue.value += (currentTime - lastTime) * deltaPerMs;
                    lastTime = currentTime;
                });

                disposeWork.push(() => {
                    beforeRenderObservable.remove(observer);
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
