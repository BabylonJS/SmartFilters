import type { ThinEngine } from "@babylonjs/core/Engines/thinEngine";
import type { SmartFilter, SmartFilterDeserializer } from "@babylonjs/smart-filters";
import type { SmartFilterRenderer } from "./smartFilterRenderer";
import { Observable } from "@babylonjs/core/Misc/observable.js";
import { ReadFile } from "@babylonjs/core/Misc/fileTools.js";

/**
 * Indicates the source of a SmartFilter
 */
export enum SmartFilterSource {
    /**
     * The SmartFilter was loaded from the snippet server
     */
    Snippet,

    /**
     * The SmartFilter was loaded from a JSON file
     */
    File,
}

/**
 * Data for the onSmartFilterLoadedObservable event
 */
export type SmartFilterLoadedEvent = {
    /**
     * The loaded SmartFilter
     */
    smartFilter: SmartFilter;

    /**
     * The source of the SmartFilter
     */
    source: SmartFilterSource;
};

/**
 * Manges loading SmartFilters for the demo app
 */
export class SmartFilterLoader {
    private readonly _engine: ThinEngine;
    private readonly _renderer: SmartFilterRenderer;

    /**
     * The SmartFilterDeserializer used to deserialize SmartFilters
     */
    public readonly smartFilterDeserializer: SmartFilterDeserializer;

    /**
     * The URL of the snippet server
     */
    public readonly snippetUrl = "https://snippet.babylonjs.com";

    /**
     * Observable that notifies when a SmartFilter has been loaded
     */
    public readonly onSmartFilterLoadedObservable: Observable<SmartFilterLoadedEvent>;

    /**
     * Creates a new SmartFilterLoader
     * @param engine - The ThinEngine to use
     * @param renderer - The SmartFilterRenderer to use
     * @param smartFilterDeserializer - The SmartFilterDeserializer to use
     */
    constructor(engine: ThinEngine, renderer: SmartFilterRenderer, smartFilterDeserializer: SmartFilterDeserializer) {
        this._engine = engine;
        this._renderer = renderer;
        this.onSmartFilterLoadedObservable = new Observable<SmartFilterLoadedEvent>();
        this.smartFilterDeserializer = smartFilterDeserializer;
    }

    /**
     * Loads a SmartFilter from the provided file.
     * @param file - File object to load from
     * @returns Promise that resolves with the loaded SmartFilter
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
     * @returns Promise that resolves with the loaded SmartFilter
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
     * @returns Promise that resolves with the loaded SmartFilter
     */
    private async _loadSmartFilter(
        loader: () => Promise<SmartFilter>,
        source: SmartFilterSource
    ): Promise<SmartFilter> {
        this._renderer.beforeRenderObservable.clear();

        // Load the SmartFilter using the provided function.
        const smartFilter = await loader();

        this.onSmartFilterLoadedObservable.notifyObservers({
            smartFilter,
            source,
        });

        return smartFilter;
    }
}
