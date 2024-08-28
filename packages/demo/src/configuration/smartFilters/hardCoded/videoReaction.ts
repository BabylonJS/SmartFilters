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
import type { SmartFilterRenderer } from "../../../smartFilterRenderer";
import { createVideoTextureAsync } from "../../../helpers/createVideoTexture";
import { GreenScreenBlock } from "../../blocks/effects/greenScreenBlock";
import { Color3 } from "@babylonjs/core";

export async function createVideoReactionSmartFilter(
    engine: ThinEngine,
    renderer: SmartFilterRenderer
): Promise<SmartFilter> {
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

    const { videoTexture: behindPersonVideoTexture, update: updateBehindPersonVideo } = await createVideoTextureAsync(
        engine,
        "/assets/balloons.mp4"
    );
    const behindPersonInput = new InputBlock(
        smartFilter,
        "behindPerson",
        ConnectionPointType.Texture,
        createStrongRef(behindPersonVideoTexture)
    );
    const { videoTexture: foregroundVideoTexture, update: updateForegroundVideo } = await createVideoTextureAsync(
        engine,
        "/assets/confetti.mp4"
    );
    const foregroundInput = new InputBlock(
        smartFilter,
        "foreground",
        ConnectionPointType.Texture,
        createStrongRef(foregroundVideoTexture)
    );
    renderer.beforeRenderObservable.add(() => {
        updateBehindPersonVideo();
        updateForegroundVideo();
    });

    const greenScreen1Distance = new InputBlock(smartFilter, "greenScreen1Distance", ConnectionPointType.Float, 0.74);
    const greenScreen2Distance = new InputBlock(smartFilter, "greenScreen2Distance", ConnectionPointType.Float, 0.78);
    const greenScreenReference = new InputBlock(
        smartFilter,
        "greenScreen1Reference",
        ConnectionPointType.Color3,
        new Color3(0, 1, 0)
    );

    // MaskBlock
    const maskBlock = new MaskBlock(smartFilter, "maskBlock");
    personInput.output.connectTo(maskBlock.input);
    maskInput.output.connectTo(maskBlock.mask);

    // GreenScreenBlock1
    const greenScreenBlock1 = new GreenScreenBlock(smartFilter, "greenScreenBehindPerson");
    backgroundInput.output.connectTo(greenScreenBlock1.background);
    behindPersonInput.output.connectTo(greenScreenBlock1.input);
    greenScreenReference.output.connectTo(greenScreenBlock1.reference);
    greenScreen1Distance.output.connectTo(greenScreenBlock1.distance);

    // CompositionBlock2
    const compositionBlock2 = new CompositionBlock(smartFilter, "personOnBehindPerson");
    greenScreenBlock1.output.connectTo(compositionBlock2.background);
    maskBlock.output.connectTo(compositionBlock2.foreground);

    // GreenScreenBlock2
    const greenScreenBlock2 = new GreenScreenBlock(smartFilter, "greenScreenForeground");
    compositionBlock2.output.connectTo(greenScreenBlock2.background);
    foregroundInput.output.connectTo(greenScreenBlock2.input);
    greenScreenReference.output.connectTo(greenScreenBlock2.reference);
    greenScreen2Distance.output.connectTo(greenScreenBlock2.distance);

    greenScreenBlock2.output.connectTo(smartFilter.output);

    return smartFilter;
}
