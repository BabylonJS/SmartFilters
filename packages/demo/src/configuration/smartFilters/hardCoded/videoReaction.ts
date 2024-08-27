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

export function createVideoReactionSmartFilter(engine: ThinEngine): SmartFilter {
    const smartFilter = new SmartFilter(HardCodedSmartFilterNames.videoReaction);

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

    const personTopInput = new InputBlock(smartFilter, "personTop", ConnectionPointType.Float, 0.0);
    const personLeftInput = new InputBlock(smartFilter, "personLeft", ConnectionPointType.Float, 0.0);
    const personWidthInput = new InputBlock(smartFilter, "personWidth", ConnectionPointType.Float, 1.0);
    const personHeightInput = new InputBlock(smartFilter, "personHeight", ConnectionPointType.Float, 1.0);

    const compositionBlock = new CompositionBlock(smartFilter, "personOnBackground");
    personTopInput.output.connectTo(compositionBlock.foregroundTop);
    personLeftInput.output.connectTo(compositionBlock.foregroundLeft);
    personWidthInput.output.connectTo(compositionBlock.foregroundWidth);
    personHeightInput.output.connectTo(compositionBlock.foregroundHeight);

    backgroundInput.output.connectTo(compositionBlock.background);
    personInput.output.connectTo(compositionBlock.foreground);

    compositionBlock.output.connectTo(smartFilter.output);

    return smartFilter;
}
