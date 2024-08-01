import type { ThinEngine } from "@babylonjs/core/Engines/thinEngine";
import {
    SmartFilterOptimizer,
    type SmartFilter,
    SmartFilterDeserializer,
    type DeserializeBlockV1,
} from "@babylonjs/smart-filters";
import type { SmartFilterRenderer } from "./smartFilterRenderer";

export type SerializedSmartFilterManifest = {
    type: "Serialized";
    name: string;
    getSmartFilterJson: () => Promise<any>;
};
export type HardCodedSmartFilterManifest = {
    type: "HardCoded";
    name: string;
    createSmartFilter: (engine: ThinEngine, renderer: SmartFilterRenderer) => Promise<SmartFilter>;
};

export type SmartFilterManifest = HardCodedSmartFilterManifest | SerializedSmartFilterManifest;

/**
 * Manges loading SmartFilters for the demo app
 */
export class SmartFilterLoader {
    private readonly _engine: ThinEngine;
    private readonly _deserializer: SmartFilterDeserializer;
    private readonly _renderer: SmartFilterRenderer;

    public readonly manifests: SmartFilterManifest[];
    public currentOptimizedSmartFilter: SmartFilter | undefined;
    public currentSmartFilter: SmartFilter | undefined;

    public get defaultSmartFilterName(): string {
        const firstManifest = this.manifests[0];
        return firstManifest?.name || "";
    }

    constructor(
        engine: ThinEngine,
        renderer: SmartFilterRenderer,
        manifests: SmartFilterManifest[],
        blockDeserializers: Map<string, DeserializeBlockV1>
    ) {
        this._engine = engine;
        this._renderer = renderer;
        this.manifests = manifests;
        if (this.manifests.length === 0) {
            throw new Error(
                "No SmartFilterManifests were passed to the SmartFilterLoader - add some manifests to smartFilterManifests.ts"
            );
        }
        this._deserializer = new SmartFilterDeserializer(blockDeserializers);
    }

    public async loadSmartFilter(name: string, optimize: boolean): Promise<SmartFilter> {
        this._renderer.beforeRenderObservable.clear();

        let manifest = this.manifests.find((m: SmartFilterManifest) => m.name === name);
        if (!manifest) {
            const firstSmartFilter = this.manifests[0];
            if (!firstSmartFilter) {
                throw new Error("No SmartFilter manifests were registered");
            }
            manifest = firstSmartFilter;
        }

        let smartFilter: SmartFilter;
        switch (manifest.type) {
            case "HardCoded":
                {
                    smartFilter = await manifest.createSmartFilter(this._engine, this._renderer);
                }
                break;
            case "Serialized":
                {
                    const smartFilterJson = await manifest.getSmartFilterJson();
                    smartFilter = await this._deserializer.deserialize(this._engine, smartFilterJson);
                }
                break;
        }

        if (optimize) {
            return this._optimize(smartFilter);
        }

        return smartFilter;
    }

    private _optimize(smartFilter: SmartFilter): SmartFilter {
        const forceMaxSamplersInFragmentShader = 0;

        const optimizer = new SmartFilterOptimizer(smartFilter, {
            maxSamplersInFragmentShader:
                forceMaxSamplersInFragmentShader || this._engine.getCaps().maxTexturesImageUnits,
            removeDisabledBlocks: true,
        });

        const optimizedSmartFilter = optimizer.optimize();

        if (optimizedSmartFilter === null) {
            throw new Error("Failed to optimize SmartFilter");
        }
        return optimizedSmartFilter;
    }
}
