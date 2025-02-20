import type { ThinEngine } from "@babylonjs/core/Engines/thinEngine";
import { createStrongRef, type SmartFilter, type SmartFilterDeserializer } from "@babylonjs/smart-filters";
import type { SmartFilterRenderer } from "./smartFilterRenderer";
import type { TextureRenderHelper } from "./textureRenderHelper";
import { Observable } from "@babylonjs/core/Misc/observable";
import type { Nullable } from "@babylonjs/core/types";
import { ReadFile } from "@babylonjs/core/Misc/fileTools";

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
    private readonly _renderer: SmartFilterRenderer;
    private readonly _textureRenderHelper: Nullable<TextureRenderHelper>;

    public readonly smartFilterDeserializer: SmartFilterDeserializer;
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
        smartFilterDeserializer: SmartFilterDeserializer,
        textureRenderHelper: Nullable<TextureRenderHelper>
    ) {
        this._engine = engine;
        this._renderer = renderer;
        this.manifests = manifests;
        this._textureRenderHelper = textureRenderHelper;
        this.onSmartFilterLoadedObservable = new Observable<SmartFilterLoadedEvent>();
        if (this.manifests.length === 0) {
            throw new Error(
                "No SmartFilterManifests were passed to the SmartFilterLoader - add some manifests to smartFilterManifests.ts"
            );
        }
        this.smartFilterDeserializer = smartFilterDeserializer;
    }

    /**
     * Loads a SmartFilter from the manifest registered with the given name.
     * @param name - Name of manifest to load
     */
    public async loadFromManifest(name: string): Promise<SmartFilter> {
        return this._loadSmartFilter(async () => {
            const manifest = this.manifests.find(
                (manifest) => manifest.name === name || manifest.name + " - optimized" === name
            );
            switch (manifest?.type) {
                case "HardCoded": {
                    return manifest.createSmartFilter(this._engine, this._renderer);
                }
                case "Serialized": {
                    const smartFilterJson = await manifest.getSmartFilterJson();
                    return this.smartFilterDeserializer.deserialize(this._engine, smartFilterJson);
                }
            }
            throw new Error("Could not read manifest " + name);
        }, SmartFilterSource.InRepo);
    }

    /**
     * Loads a SmartFilter from the provided file.
     * @param file - File object to load from
     */
    public async loadFromFile(file: File): Promise<SmartFilter> {
        return this._loadSmartFilter(async () => {
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
            return this.smartFilterDeserializer.deserialize(this._engine, JSON.parse(data));
        }, SmartFilterSource.File);
    }

    /**
     * Loads a SmartFilter from the snippet server.
     * @param snippetToken - Snippet token to load
     * @param version - Version of the snippet to load
     */
    public async loadFromSnippet(snippetToken: string, version: string | undefined): Promise<SmartFilter> {
        return this._loadSmartFilter(async () => {
            const response = await fetch(`${this.snippetUrl}/${snippetToken}/${version || ""}`);

            if (!response.ok) {
                throw new Error(`Could not fetch snippet ${snippetToken}. Response was: ${response.statusText}`);
            }

            const data = await response.json();
            const snippet = JSON.parse(data.jsonPayload);
            const serializedSmartFilter = JSON.parse(snippet.smartFilter);

            return this.smartFilterDeserializer.deserialize(this._engine, serializedSmartFilter);
        }, SmartFilterSource.Snippet);
    }

    /**
     * Internal method to reuse common loading logic
     * @param loader - Function that loads the SmartFilter from some source
     * @param source - Source of the SmartFilter (see SmartFilterSource)
     */
    private async _loadSmartFilter(
        loader: () => Promise<SmartFilter>,
        source: SmartFilterSource
    ): Promise<SmartFilter> {
        this._renderer.beforeRenderObservable.clear();

        // Load the SmartFilter using the provided function.
        const smartFilter = await loader();

        // If the SmartFilter has a texture render helper, assign its input texture as the Smart Filter's output
        if (this._textureRenderHelper?.renderTargetTexture.renderTarget) {
            smartFilter.outputBlock.renderTargetWrapper = createStrongRef(
                this._textureRenderHelper.renderTargetTexture.renderTarget
            );
        }

        this.onSmartFilterLoadedObservable.notifyObservers({
            smartFilter,
            source,
        });

        return smartFilter;
    }
}
