import { ConnectionPointType, InputBlock, SmartFilter } from "@babylonjs/smart-filters";
import { PixelateBlock } from "./blocks/effects/pixelateBlock.js";

/**
 * Creates a new instance of the default Smart Filter for the Smart Filter Editor
 * @returns The default Smart Filter
 */
export function createDefaultSmartFilter(): SmartFilter {
    const smartFilter = new SmartFilter("Default");

    const pixelateBlock = new PixelateBlock(smartFilter, "Pixelate");
    const intensityInputBlock = new InputBlock(smartFilter, "Intensity", ConnectionPointType.Float, 0.5);
    intensityInputBlock.editorData = {
        animationType: null,
        valueDeltaPerMs: null,
        min: 0.0,
        max: 1.0,
    };

    intensityInputBlock.output.connectTo(pixelateBlock.intensity);
    pixelateBlock.output.connectTo(smartFilter.output);

    return smartFilter;
}
