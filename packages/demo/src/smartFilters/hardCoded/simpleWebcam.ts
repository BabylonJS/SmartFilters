import type { ThinEngine } from "@babylonjs/core/Engines/thinEngine";
import {
    ConnectionPointType,
    InputBlock,
    SmartFilter,
    createImageTexture,
    createStrongRef,
} from "@babylonjs/smart-filters";
import { WebCamInputBlock, BlackAndWhiteBlock, PixelateBlock } from "@babylonjs/smart-filters-editor";

export function createSimpleWebcamSmartFilter(engine: ThinEngine): SmartFilter {
    const smartFilter = new SmartFilter("Simple Webcam Filter");
    const logoTexture = createImageTexture(engine, "/assets/logo.png");
    const webcamInput = new WebCamInputBlock(smartFilter, engine, createStrongRef(logoTexture));
    const blackAndWhite = new BlackAndWhiteBlock(smartFilter, "blackAndWhite");
    const pixelate = new PixelateBlock(smartFilter, "pixelate");
    const pixelateIntensity = new InputBlock(smartFilter, "intensity", ConnectionPointType.Float, 0.4);

    webcamInput.output.connectTo(blackAndWhite.input);
    blackAndWhite.output.connectTo(pixelate.input);
    pixelateIntensity.output.connectTo(pixelate.intensity);
    pixelate.output.connectTo(smartFilter.output);

    return smartFilter;
}
