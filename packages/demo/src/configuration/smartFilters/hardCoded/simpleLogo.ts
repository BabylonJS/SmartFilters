import type { ThinEngine } from "@babylonjs/core/Engines/thinEngine";
import {
    ConnectionPointType,
    CopyBlock,
    InputBlock,
    SmartFilter,
    createImageTexture,
    createStrongRef,
} from "@babylonjs/smart-filters";
import { HardCodedSmartFilterNames } from "./hardCodedSmartFilterNames";

export function createSimpleLogoSmartFilter(engine: ThinEngine): SmartFilter {
    const smartFilter = new SmartFilter(HardCodedSmartFilterNames.simpleLogo);
    const logoTexture = createImageTexture(engine, "/assets/logo.png");

    const logoInput = new InputBlock(smartFilter, "logo", ConnectionPointType.Texture, createStrongRef(logoTexture));

    const copyBlock = new CopyBlock(smartFilter, "copy");

    logoInput.output.connectTo(copyBlock.input);
    copyBlock.output.connectTo(smartFilter.output);

    return smartFilter;
}
