import type { ThinEngine } from "@babylonjs/core/Engines/thinEngine";
import type { ThinTexture } from "@babylonjs/core/Materials/Textures/thinTexture";
import { ConnectionPointType, InputBlock, SmartFilter, createStrongRef } from "@babylonjs/smart-filters";
import { CompositionBlock, WebCamInputBlock } from "@babylonjs/smart-filters-editor";

export function createSimpleWebcamFilter(engine: ThinEngine, logoTexture: ThinTexture): SmartFilter {
    // const smartFilter = new SmartFilter("Simple Webcam Filter");
    // const webcamInput = new WebCamInputBlock(smartFilter, engine, createStrongRef(logoTexture));
    // const blackAndWhite = new BlackAndWhiteBlock(smartFilter, "blackAndWhite");
    // const pixelate = new PixelateBlock(smartFilter, "pixelate");
    // const pixelateIntensity = new InputBlock(smartFilter, "intensity", ConnectionPointType.Float, 0.4);

    // webcamInput.output.connectTo(blackAndWhite.input);
    // blackAndWhite.output.connectTo(pixelate.input);
    // pixelateIntensity.output.connectTo(pixelate.intensity);
    // pixelate.output.connectTo(smartFilter.output);

    // return smartFilter;

    const smartFilter = new SmartFilter("Simple Webcam Filter");
    const webcamInput = new WebCamInputBlock(smartFilter, engine, createStrongRef(logoTexture));
    const logoInput = new InputBlock(smartFilter, "logo", ConnectionPointType.Texture, createStrongRef(logoTexture));

    const compositionBlock = new CompositionBlock(smartFilter, "composition");
    webcamInput.output.connectTo(compositionBlock.background);
    logoInput.output.connectTo(compositionBlock.foreground);

    compositionBlock.output.connectTo(smartFilter.output);

    // setInterval(() => {
    //     logoInput.runtimeValue.value = logoInput.runtimeValue.value ? null : logoTexture;
    // }, 1000);

    return smartFilter;
}
