import type { ThinEngine } from "@babylonjs/core/Engines/thinEngine";
import {
    ConnectionPointType,
    InputBlock,
    SmartFilter,
    createImageTexture,
    createStrongRef,
} from "@babylonjs/smart-filters";
import { HardCodedSmartFilterNames } from "./hardCodedSmartFilterNames";
import { CompositionBlock } from "../../blocks/effects/compositionBlock";
import { MaskBlock } from "../../blocks/effects/maskBlock";

export function createVideoReactionSmartFilter(engine: ThinEngine): SmartFilter {
    const smartFilter = new SmartFilter(HardCodedSmartFilterNames.videoReaction);

    // Inputs
    const backgroundTexture = createImageTexture(engine, "/assets/teamsBackground1.png");
    const backgroundInput = new InputBlock(
        smartFilter,
        "background",
        ConnectionPointType.Texture,
        createStrongRef(backgroundTexture)
    );

    const personTexture = createImageTexture(engine, "/assets/person.png");
    const personInput = new InputBlock(
        smartFilter,
        "person",
        ConnectionPointType.Texture,
        createStrongRef(personTexture)
    );

    const maskTexture = createImageTexture(engine, "/assets/personMask.png");
    const maskInput = new InputBlock(smartFilter, "mask", ConnectionPointType.Texture, createStrongRef(maskTexture));

    // MaskBlock
    const maskBlock = new MaskBlock(smartFilter, "maskBlock");
    personInput.output.connectTo(maskBlock.input);
    maskInput.output.connectTo(maskBlock.mask);

    // CompositionBlock
    const compositionBlock = new CompositionBlock(smartFilter, "personOnBackground");
    const personTopInput = new InputBlock(smartFilter, "personTop", ConnectionPointType.Float, 0.0);
    const personLeftInput = new InputBlock(smartFilter, "personLeft", ConnectionPointType.Float, 0.0);
    const personWidthInput = new InputBlock(smartFilter, "personWidth", ConnectionPointType.Float, 1.0);
    const personHeightInput = new InputBlock(smartFilter, "personHeight", ConnectionPointType.Float, 1.0);
    personTopInput.output.connectTo(compositionBlock.foregroundTop);
    personLeftInput.output.connectTo(compositionBlock.foregroundLeft);
    personWidthInput.output.connectTo(compositionBlock.foregroundWidth);
    personHeightInput.output.connectTo(compositionBlock.foregroundHeight);
    backgroundInput.output.connectTo(compositionBlock.background);
    maskBlock.output.connectTo(compositionBlock.foreground);
    compositionBlock.output.connectTo(smartFilter.output);

    return smartFilter;
}
