import type { ThinEngine } from "@babylonjs/core/Engines/thinEngine";
import { ConnectionPointType, InputBlock, SmartFilter } from "@babylonjs/smart-filters";
import { HardCodedSmartFilterNames } from "./hardCodedSmartFilterNames";
import { WebCamInputBlock } from "../../blocks/hardcoded/inputs/webCamInputBlock";
import { BlackAndWhiteBlock } from "../../blocks/hardcoded/effects/blackAndWhiteBlock";
import { PixelateBlock } from "../../blocks/hardcoded/effects/pixelateBlock";

export function createSimpleWebcamSmartFilter(engine: ThinEngine): SmartFilter {
    const smartFilter = new SmartFilter(HardCodedSmartFilterNames.simpleWebcam);
    const webcamInput = new WebCamInputBlock(smartFilter, engine);
    const blackAndWhite = new BlackAndWhiteBlock(smartFilter, "blackAndWhite");
    const pixelate = new PixelateBlock(smartFilter, "pixelate");
    const pixelateIntensity = new InputBlock(smartFilter, "intensity", ConnectionPointType.Float, 0.4);

    webcamInput.output.connectTo(blackAndWhite.input);
    blackAndWhite.output.connectTo(pixelate.input);
    pixelateIntensity.output.connectTo(pixelate.intensity);
    pixelate.output.connectTo(smartFilter.output);

    return smartFilter;
}
