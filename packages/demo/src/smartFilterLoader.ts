import type { ThinEngine } from "@babylonjs/core/Engines/thinEngine";
import {
    SmartFilterOptimizer,
    type SmartFilter,
    SmartFilterDeserializer,
    type DeserializeBlockV1,
} from "@babylonjs/smart-filters";
import type { SmartFilterRenderer } from "./smartFilterRenderer";
import { Observable, ReadFile } from "@babylonjs/core";

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

export enum SmartFilterSource {
    Snippet,
    InRepo,
    File,
}

export type SmartFilterLoadedEvent = {
    smartFilter: SmartFilter;
    source: SmartFilterSource;
};

/**
 * Manges loading SmartFilters for the demo app
 */
export class SmartFilterLoader {
    private readonly _engine: ThinEngine;
    private readonly _deserializer: SmartFilterDeserializer;
    private readonly _renderer: SmartFilterRenderer;

    public readonly snippetUrl = "https://snippet.babylonjs.com";
    public readonly onSmartFilterLoadedObservable: Observable<SmartFilterLoadedEvent>;
    public readonly manifests: SmartFilterManifest[];

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
        this.onSmartFilterLoadedObservable = new Observable<SmartFilterLoadedEvent>();
        if (this.manifests.length === 0) {
            throw new Error(
                "No SmartFilterManifests were passed to the SmartFilterLoader - add some manifests to smartFilterManifests.ts"
            );
        }
        this._deserializer = new SmartFilterDeserializer(blockDeserializers);
    }

    /**
     * Loads a SmartFilter from the manifest registered with the given name.
     * @param name - Name of manifest to load
     * @param optimize - If true, the SmartFilter will be automatically optimized
     */
    public async loadFromManifest(name: string, optimize: boolean): Promise<SmartFilter> {
        return this._loadSmartFilter(
            async () => {
                const manifest = this.manifests.find((manifest) => manifest.name === name);
                switch (manifest?.type) {
                    case "HardCoded": {
                        return manifest.createSmartFilter(this._engine, this._renderer);
                    }
                    case "Serialized": {
                        const smartFilterJson = await manifest.getSmartFilterJson();
                        return this._deserializer.deserialize(this._engine, smartFilterJson);
                    }
                }
                throw new Error("Could not read manifest " + name);
            },
            SmartFilterSource.InRepo,
            optimize
        );
    }

    /**
     * Loads a SmartFilter from the provided file.
     * @param file - File object to load from
     * @param optimize - If true, the SmartFilter will be automatically optimized
     */
    public async loadFromFile(file: File, optimize: boolean): Promise<SmartFilter> {
        return this._loadSmartFilter(
            async () => {
                // Await (data)
                const data = await new Promise<string>((resolve, reject) => {
                    ReadFile(
                        file,
                        (data) => resolve(data),
                        undefined,
                        false,
                        (error) => reject(error)
                    );
                });
                return this._deserializer.deserialize(this._engine, JSON.parse(data));
            },
            SmartFilterSource.File,
            optimize
        );
    }

    /**
     * Loads a SmartFilter from the snippet server.
     * @param snippetToken - Snippet token to load
     * @param version - Version of the snippet to load
     * @param optimize - If true, the SmartFilter will be automatically optimized
     */
    public async loadFromSnippet(
        snippetToken: string,
        version: string | undefined,
        optimize: boolean
    ): Promise<SmartFilter> {
        return this._loadSmartFilter(
            async () => {
                const response = await fetch(`${this.snippetUrl}/${snippetToken}/${version || ""}`);

                if (!response.ok) {
                    throw new Error(`Could not fetch snippet ${snippetToken}. Response was: ${response.statusText}`);
                }

                const data = await response.json();
                const snippet = JSON.parse(data.jsonPayload);
                const serializedSmartFilter = JSON.parse(snippet.smartFilter);

                return this._deserializer.deserialize(this._engine, serializedSmartFilter);
            },
            SmartFilterSource.Snippet,
            optimize
        );
    }

    /**
     * Internal method to reuse common loading logic and fallback handling.
     * @param loader - Function that loads the SmartFilter from some source
     * @param source - Source of the SmartFilter (see SmartFilterSource)
     * @param optimize - If true, the SmartFilter will be automatically optimized
     */
    private async _loadSmartFilter(
        loader: () => Promise<SmartFilter>,
        source: SmartFilterSource,
        optimize: boolean
    ): Promise<SmartFilter> {
        this._renderer.beforeRenderObservable.clear();

        // Load the SmartFilter using the provided function. If that fails, retry with the default SmartFilter.
        let smartFilter: SmartFilter;
        try {
            smartFilter = await loader();
        } catch (e) {
            console.warn("Failed to load requested SmartFilter.", e);
            const defaultSmartFilterName = this.defaultSmartFilterName;
            if (!defaultSmartFilterName) {
                throw new Error("Cannot fallback to default SmartFilter - no SmartFilter manifests were registered");
            }
            return this.loadFromManifest(defaultSmartFilterName, optimize);
        }

        if (optimize) {
            smartFilter = this._optimize(smartFilter);
        }

        this.onSmartFilterLoadedObservable.notifyObservers({
            smartFilter,
            source: source,
        });

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
