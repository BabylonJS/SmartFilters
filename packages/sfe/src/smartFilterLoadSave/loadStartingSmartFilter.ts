import type { ThinEngine } from "@babylonjs/core/Engines/thinEngine";
import type { SmartFilter, SmartFilterDeserializer } from "@babylonjs/smart-filters";
import { createDefaultSmartFilter } from "../defaultSmartFilter.js";
import type { Nullable } from "@babylonjs/core/types";
import { getSnippet, setSnippet } from "./hashFunctions.js";
import { loadSmartFilterFromSnippetServer } from "./loadSmartFilterFromSnippetServer.js";

/**
 * Loads the starting SmartFilter for this session, consulting the URL first, and if
 * there isn't a snippet on the URL, loads a default SmartFilter.
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
