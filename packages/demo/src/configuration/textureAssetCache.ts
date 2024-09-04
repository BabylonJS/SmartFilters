import type { ThinTexture } from "@babylonjs/core/Materials/Textures/thinTexture";
import type { ConnectionPointType, InputBlock, InputBlockEditorData } from "@babylonjs/smart-filters";

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
                cacheEntry.stillUsed = true;
            }
        }
    }
}
