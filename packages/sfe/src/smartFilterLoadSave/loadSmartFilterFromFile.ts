import type { ThinEngine } from "@babylonjs/core/Engines/thinEngine";
import { ReadFile } from "@babylonjs/core/Misc/fileTools.js";
import type { SmartFilter, SmartFilterDeserializer } from "@babylonjs/smart-filters";

/**
 * Loads a SmartFilter from the provided file.
 * @param smartFilterDeserializer - SmartFilterDeserializer to use
 * @param engine - ThinEngine to use
 * @param file - File object to load from
 * @returns Promise that resolves with the loaded SmartFilter
 */
export async function loadFromFile(
    smartFilterDeserializer: SmartFilterDeserializer,
    engine: ThinEngine,
    file: File
): Promise<SmartFilter> {
    const data = await new Promise<string>((resolve, reject) => {
        ReadFile(
            file,
            (data) => resolve(data),
            undefined,
            false,
            (error) => reject(error)
        );
    });
    return smartFilterDeserializer.deserialize(engine, JSON.parse(data));
}
