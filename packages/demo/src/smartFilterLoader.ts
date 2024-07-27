import type { ThinEngine } from "@babylonjs/core/Engines/thinEngine";
import {
    SmartFilterOptimizer,
    type SmartFilter,
    SmartFilterDeserializer,
    type IBlockDeserializer,
} from "@babylonjs/smart-filters";

export type SerializedSmartFilterManifest = {
    type: "Serialized";
    name: string;
    smartFilterString: string;
};
export type HardCodedSmartFilterManifest = {
    type: "HardCoded";
    name: string;
    createSmartFilter: (engine: ThinEngine) => SmartFilter;
};

export type SmartFilterManifest = HardCodedSmartFilterManifest | SerializedSmartFilterManifest;

export class SmartFilterLoader {
    private readonly _engine: ThinEngine;
    private readonly _deserializer: SmartFilterDeserializer;

    public readonly manifests: SmartFilterManifest[];
    public currentOptimizedSmartFilter: SmartFilter | undefined;
    public currentSmartFilter: SmartFilter | undefined;

    public get defaultSmartFilterName(): string {
        const firstManifest = this.manifests[0];
        return firstManifest?.name || "";
    }

    constructor(engine: ThinEngine, manifests: SmartFilterManifest[], blockDeserializers: IBlockDeserializer[]) {
        this._engine = engine;
        this.manifests = manifests;
        if (this.manifests.length === 0) {
            throw new Error(
                "No SmartFilterManifests were passed to the SmartFilterLoader - add some manifests to smartFilterManifests.ts"
            );
        }
        this._deserializer = new SmartFilterDeserializer(blockDeserializers);
    }

    public loadSmartFilter(name: string, optimize: boolean): SmartFilter {
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
                    smartFilter = manifest.createSmartFilter(this._engine);
                }
                break;
            case "Serialized":
                {
                    smartFilter = this._deserializer.deserialize(manifest.smartFilterString);
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
