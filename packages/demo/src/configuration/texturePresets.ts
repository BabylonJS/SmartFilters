import type { TexturePreset } from "@babylonjs/smart-filters-editor";

/**
 * Add new assets to packages/demo/www/assets then add them to this list
 * to have them appear in the editor. These make it easy to quickly assign
 * an asset to texture InputBlock without the user having to find the file
 * in a file dialog box each time the editor is reloaded.
 */
export const texturePresets: TexturePreset[] = [
    {
        name: "Bablyon.js Logo",
        url: "/assets/logo.png",
    },
];
