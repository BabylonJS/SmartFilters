import type { ThinEngine } from "@babylonjs/core/Engines/thinEngine";
import type { ThinTexture } from "@babylonjs/core/Materials/Textures/thinTexture";
import type { ConnectionPointType, InputBlock, InputBlockEditorData } from "@babylonjs/smart-filters";
import { loadTextureInputBlockAsset } from "../demoTextureLoaders";
import type { Observable } from "@babylonjs/core/Misc/observable";

type CacheEntry = {
    key: InputBlockEditorData<ConnectionPointType.Texture>;
    texture: ThinTexture;
    dispose: () => void;
    stillUsed: boolean;
};

/**
 * Tracks assets loaded for a SmartFilter, such as images and videos.
 * When a SmartFilter is reloaded, this cache helps reuse previously loaded assets
 * while ensuring previously loaded assets that are no longer used are disposed.
 */
export class TextureAssetCache {
    private _cache: CacheEntry[] = [];
    private readonly _engine: ThinEngine;
    private readonly _beforeRenderObservable: Observable<void>;

    public constructor(engine: ThinEngine, beforeRenderObservable: Observable<void>) {
        this._engine = engine;
        this._beforeRenderObservable = beforeRenderObservable;
    }

    public async loadAssetsForInputBlocks(inputBlocks: InputBlock<ConnectionPointType.Texture>[]) {
        // Set all entries to be unused
        for (const entry of this._cache) {
            entry.stillUsed = false;
        }

        for (const inputBlock of inputBlocks) {
            const editorData = inputBlock.editorData;

            if (!editorData) {
                continue;
            }

            const cacheEntry = this._cache.find(
                (entry) =>
                    entry.key.url === editorData.url &&
                    entry.key.urlTypeHint === editorData.urlTypeHint &&
                    entry.key.anisotropicFilteringLevel === editorData.anisotropicFilteringLevel &&
                    entry.key.flipY === editorData.flipY &&
                    entry.key.forcedExtension === editorData.forcedExtension
            );

            if (cacheEntry) {
                console.log("TextureAssetCache", inputBlock.name, "Cache hit");
                // Cache hit: mark as still used and set the texture
                cacheEntry.stillUsed = true;
                inputBlock.output.runtimeData.value = cacheEntry.texture;
            } else {
                console.log("TextureAssetCache", inputBlock.name, "Cache miss");
                // Cache miss: try to load the asset
                const result = await loadTextureInputBlockAsset(inputBlock, this._engine, this._beforeRenderObservable);

                // If the asset was loaded, add it to the cache
                if (result) {
                    this._cache.push({
                        key: {
                            ...editorData,
                        },
                        texture: result.texture,
                        dispose: result.dispose,
                        stillUsed: true,
                    });
                }
            }
        }

        // Dispose all entries that are no longer used
        let cacheEntry: CacheEntry | undefined;
        for (let index = this._cache.length - 1; index >= 0; index--) {
            cacheEntry = this._cache[index];
            if (cacheEntry?.stillUsed === false) {
                console.log("TextureAssetCache", "Disposing", cacheEntry.key.url);
                cacheEntry.dispose();
                this._cache.splice(index, 1);
            }
        }
    }
}
