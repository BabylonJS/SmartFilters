import type { ThinEngine } from "@babylonjs/core/Engines/thinEngine";
import {
    ConnectionPointType,
    InputBlock,
    SmartFilter,
    createImageTexture,
    createStrongRef,
} from "@babylonjs/smart-filters";
import { HardCodedSmartFilterNames } from "./hardCodedSmartFilterNames";
import { BlackAndWhiteBlock } from "../../blocks/effects/blackAndWhiteBlock";
import { PixelateBlock } from "../../blocks/effects/pixelateBlock";
import { PremultiplyAlphaBlock } from "../../blocks/utility/premultiplyAlphaBlock";

export function createSimpleLogoSmartFilter(engine: ThinEngine): SmartFilter {
    const smartFilter = new SmartFilter(HardCodedSmartFilterNames.simpleLogo);
    const logoTexture = createImageTexture(engine, "/assets/logo.png");
    const logoInput = new InputBlock(smartFilter, "logo", ConnectionPointType.Texture, createStrongRef(logoTexture));
    const blackAndWhite = new BlackAndWhiteBlock(smartFilter, "blackAndWhite");
    const pixelate = new PixelateBlock(smartFilter, "pixelate");
    const pixelateIntensity = new InputBlock(smartFilter, "intensity", ConnectionPointType.Float, 0.4);
    const premultiplyAlpha = new PremultiplyAlphaBlock(smartFilter, "premultiplyAlpha");

    logoInput.output.connectTo(blackAndWhite.input);
    blackAndWhite.output.connectTo(pixelate.input);
    pixelateIntensity.output.connectTo(pixelate.intensity);
    pixelate.output.connectTo(premultiplyAlpha.input);
    premultiplyAlpha.output.connectTo(smartFilter.output);

    return smartFilter;
}
