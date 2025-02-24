import type { ThinEngine } from "@babylonjs/core/Engines/thinEngine";
import type { SmartFilter, SmartFilterDeserializer } from "@babylonjs/smart-filters";
import { createDefaultSmartFilter } from "../defaultSmartFilter.js";
import type { Nullable } from "@babylonjs/core/types";
import { getSnippet, setSnippet } from "./hashFunctions.js";
import { loadSmartFilterFromSnippetServer } from "./loadSmartFilterFromSnippetServer.js";

/**
 * Loads the starting SmartFilter for this session, consulting the URL first, then local storage,
 * and finally loading a default SmartFilter if neither of those are available.
 *
 * @param smartFilterDeserializer - SmartFilterDeserializer to use
 * @param engine - ThinEngine to use
 * @returns Promise that resolves with the loaded SmartFilter
 */
export function loadStartingSmartFilter(
    smartFilterDeserializer: SmartFilterDeserializer,
    engine: ThinEngine
): Promise<SmartFilter> {
    const smartFilterPromiseFromUrl = loadFromUrl(smartFilterDeserializer, engine);
    if (smartFilterPromiseFromUrl) {
        return smartFilterPromiseFromUrl;
    }

    const smartFilterPromiseFromLocalStorage = loadFromLocalStorage(smartFilterDeserializer, engine);
    if (smartFilterPromiseFromLocalStorage) {
        return smartFilterPromiseFromLocalStorage;
    }

    return Promise.resolve(createDefaultSmartFilter());
}

/**
 * Checks the hash for a snippet token and loads the SmartFilter if one is found.
 * Otherwise, loads the last in-repo SmartFilter or the default.
 * @param smartFilterDeserializer - SmartFilterDeserializer to use
 * @param engine - ThinEngine to use
 * @returns Promise that resolves with the loaded SmartFilter, or null if no SmartFilter was loaded
 */
function loadFromUrl(
    smartFilterDeserializer: SmartFilterDeserializer,
    engine: ThinEngine
): Nullable<Promise<SmartFilter>> {
    const [snippetToken, version] = getSnippet();

    if (snippetToken) {
        // Reset hash with our formatting to keep it looking consistent
        setSnippet(snippetToken, version, false);
        return loadSmartFilterFromSnippetServer(smartFilterDeserializer, engine, snippetToken, version);
    }
    return null;
}

const LocalStorageSmartFilterName = "LoadedSmartFilter";

// TODO: save to local storage after load from JSON

/**
 * Checks local storage for a SmartFilter to load, and loads it if found.
 * @param smartFilterDeserializer - SmartFilterDeserializer to use
 * @param engine - ThinEngine to use
 * @returns Promise that resolves with the loaded SmartFilter, or null if no SmartFilter was loaded
 */
function loadFromLocalStorage(
    smartFilterDeserializer: SmartFilterDeserializer,
    engine: ThinEngine
): Nullable<Promise<SmartFilter>> {
    const serializedLocalStorageSmartFilter = localStorage.getItem(LocalStorageSmartFilterName);
    if (serializedLocalStorageSmartFilter) {
        return Promise.resolve(
            smartFilterDeserializer.deserialize(engine, JSON.parse(serializedLocalStorageSmartFilter))
        );
    }
    return null;
}
