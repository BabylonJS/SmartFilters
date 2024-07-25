import type { ThinEngine } from "@babylonjs/core/Engines/thinEngine";
import { SmartFilterOptimizer, type SmartFilter } from "@babylonjs/smart-filters";

export type SmartFilterManifest = {
    name: string;
    createSmartFilter: (engine: ThinEngine) => SmartFilter;
};

export class SmartFilterLoader {
    private readonly _engine: ThinEngine;
    private readonly _manifests: SmartFilterManifest[];

    public currentOptimizedSmartFilter: SmartFilter | undefined;
    public currentSmartFilter: SmartFilter | undefined;

    public get defaultSmartFilterName(): string {
        const firstManifest = this._manifests[0];
        return firstManifest?.name || "";
    }

    constructor(engine: ThinEngine, manifests: SmartFilterManifest[]) {
        this._engine = engine;
        this._manifests = manifests;
        if (this._manifests.length === 0) {
            throw new Error(
                "No SmartFilterManifests were passed to the SmartFilterLoader - add some manifests to smartFilterManifests.ts"
            );
        }
    }

    public loadSmartFilter(name: string, optimize: boolean): SmartFilter {
        let manifest = this._manifests.find((m: SmartFilterManifest) => m.name === name);
        if (!manifest) {
            const firstSmartFilter = this._manifests[0];
            if (!firstSmartFilter) {
                throw new Error("No SmartFilter manifests were registered");
            }
            manifest = firstSmartFilter;
        }

        const smartFilter = manifest.createSmartFilter(this._engine);

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
