import type { ThinEngine } from "@babylonjs/core/Engines/thinEngine";
import { ConnectionPointType, InputBlock, SmartFilter, createImageTexture } from "@babylonjs/smart-filters";
import { BlackAndWhiteBlock } from "../../blocks/effects/blackAndWhiteBlock";
import { HardCodedSmartFilterNames } from "./hardCodedSmartFilterNames";
import { BlurBlock } from "../../blocks/effects/blurBlock";
import { FrameBlock } from "../../blocks/effects/frameBlock";
import type { SmartFilterRenderer } from "../../../smartFilterRenderer";
import { createVideoTextureAsync } from "@babylonjs/smart-filters-editor";

export async function createVideoWithFrameSmartFilter(
    engine: ThinEngine,
    renderer: SmartFilterRenderer
): Promise<SmartFilter> {
    const titleTexture = createImageTexture(engine, "/assets/title.png");
    const frameTexture = createImageTexture(engine, "/assets/frame.png");
    const { videoTexture, update } = await createVideoTextureAsync(engine, "/assets/babylonjs.mp4");

    renderer.beforeRenderObservable.add(() => {
        update();
    });

    const videoFilter = new SmartFilter(HardCodedSmartFilterNames.videoWithFrame);

    const videoInput = new InputBlock(videoFilter, "video", ConnectionPointType.Texture, videoTexture);
    const frameInput = new InputBlock(videoFilter, "frame", ConnectionPointType.Texture, frameTexture);
    const titleInput = new InputBlock(videoFilter, "title", ConnectionPointType.Texture, titleTexture);

    const blur = new BlurBlock(videoFilter, "blur");
    const blackAndWhite = new BlackAndWhiteBlock(videoFilter, "blackAndWhite");
    const frame = new FrameBlock(videoFilter, "frame");

    videoInput.output.connectTo(blackAndWhite.input);
    blackAndWhite.output.connectTo(blur.input);

    videoInput.output.connectTo(frame.foreground);
    blur.output.connectTo(frame.background);
    frameInput.output.connectTo(frame.frame);
    titleInput.output.connectTo(frame.overlay);

    frame.output.connectTo(videoFilter.output);
    return videoFilter;
}
