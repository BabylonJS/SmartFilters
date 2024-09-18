import type { SmartFilterRuntime } from "@babylonjs/smart-filters";
import { ConnectionPointType, createStrongRef, InputBlock, SmartFilter } from "@babylonjs/smart-filters";
import type { ThinEngine } from "@babylonjs/core/Engines/thinEngine";
import type { ThinTexture } from "@babylonjs/core/Materials/Textures/thinTexture";
import { BlackAndWhiteBlock } from "../configuration/blocks/effects/blackAndWhiteBlock";

export class ReactionsSmartFilter {
    private _blackAndWhiteDisabledInputBlock: InputBlock<ConnectionPointType.Boolean>;
    private _engine: ThinEngine;
    public smartFilter: SmartFilter;
    public textureInputBlock: InputBlock<ConnectionPointType.Texture>;

    public get blackAndWhiteDisabled(): boolean {
        return this._blackAndWhiteDisabledInputBlock.runtimeValue.value;
    }
    public set blackAndWhiteDisabled(value: boolean) {
        this._blackAndWhiteDisabledInputBlock.runtimeValue.value = value;
    }

    constructor(engine: ThinEngine) {
        this._engine = engine;

        this.smartFilter = new SmartFilter("Teams Reactions");
        this.textureInputBlock = new InputBlock<ConnectionPointType.Texture>(
            this.smartFilter,
            "videoFrame",
            ConnectionPointType.Texture,
            createStrongRef(null)
        );
        this._blackAndWhiteDisabledInputBlock = new InputBlock<ConnectionPointType.Boolean>(
            this.smartFilter,
            "blackAndWhiteDisabled",
            ConnectionPointType.Boolean,
            createStrongRef(true)
        );
        const blackAndWhiteBlock = new BlackAndWhiteBlock(this.smartFilter, "BlackAndWhite");
        this._blackAndWhiteDisabledInputBlock.output.connectTo(blackAndWhiteBlock.disabled);
        this.textureInputBlock.output.connectTo(blackAndWhiteBlock.input);
        blackAndWhiteBlock.output.connectTo(this.smartFilter.output);
    }

    public async initRuntime(inputTexture: ThinTexture): Promise<SmartFilterRuntime> {
        const smartFilterRuntime = await this.smartFilter.createRuntimeAsync(this._engine);

        this.textureInputBlock.runtimeValue.value = inputTexture;

        return smartFilterRuntime;
    }
}
