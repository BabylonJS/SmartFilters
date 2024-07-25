import type { ThinEngine } from "@babylonjs/core/Engines/thinEngine";
import {
    ConnectionPointType,
    InputBlock,
    SmartFilter,
    createImageTexture,
    createStrongRef,
} from "@babylonjs/smart-filters";
import { BlackAndWhiteBlock, PixelateBlock } from "@babylonjs/smart-filters-editor";

export const simpleLogoSmartFilterName = "Simple Logo";

export function createSimpleLogoSmartFilter(engine: ThinEngine): SmartFilter {
    const smartFilter = new SmartFilter(simpleLogoSmartFilterName);
    const logoTexture = createImageTexture(engine, "/assets/logo.png");
    const logoInput = new InputBlock(smartFilter, "logo", ConnectionPointType.Texture, createStrongRef(logoTexture));
    const blackAndWhite = new BlackAndWhiteBlock(smartFilter, "blackAndWhite");
    const pixelate = new PixelateBlock(smartFilter, "pixelate");
    const pixelateIntensity = new InputBlock(smartFilter, "intensity", ConnectionPointType.Float, 0.4);

    logoInput.output.connectTo(blackAndWhite.input);
    blackAndWhite.output.connectTo(pixelate.input);
    pixelateIntensity.output.connectTo(pixelate.intensity);
    pixelate.output.connectTo(smartFilter.output);

    return smartFilter;
}
