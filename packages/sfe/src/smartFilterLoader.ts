import { type SmartFilter } from "@babylonjs/smart-filters";
import type { SmartFilterRenderer } from "./smartFilterRenderer";
import { Observable } from "@babylonjs/core/Misc/observable.js";
import { createDefaultSmartFilter } from "./defaultSmartFilter.js";

/**
 * Manges loading SmartFilters for the demo app
 */
export class SmartFilterLoader {
    private readonly _renderer: SmartFilterRenderer;

    /**
     * Observable that is triggered when a SmartFilter is loaded.
     */
    public readonly onSmartFilterLoadedObservable: Observable<SmartFilter>;

    /**
     * Creates a new SmartFilterLoader
     * @param renderer - The renderer to use to render the filter
     */
    constructor(renderer: SmartFilterRenderer) {
        this._renderer = renderer;
        this.onSmartFilterLoadedObservable = new Observable<SmartFilter>();
    }

    /**
     * Loads a SmartFilter from the manifest registered with the given name.
     * @returns The loaded SmartFilter
     */
    public async loadDefault(): Promise<SmartFilter> {
        return this._loadSmartFilter(async () => createDefaultSmartFilter());
    }

    /**
     * Disposes the SmartFilterLoader
     */
    public dispose() {
        this.onSmartFilterLoadedObservable.clear();
    }

    /**
     * Internal method to reuse common loading logic
     * @param loader - Function that loads the SmartFilter from some source
     * @returns The loaded SmartFilter
     */
    private async _loadSmartFilter(loader: () => Promise<SmartFilter>): Promise<SmartFilter> {
        this._renderer.beforeRenderObservable.clear();

        // Load the SmartFilter using the provided function.
        const smartFilter = await loader();

        this.onSmartFilterLoadedObservable.notifyObservers(smartFilter);

        return smartFilter;
    }
}
