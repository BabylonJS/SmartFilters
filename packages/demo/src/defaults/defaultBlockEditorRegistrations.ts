import type { IBlockEditorRegistration } from "@babylonjs/smart-filters-editor";

export const defaultBlockEditorRegistrations: IBlockEditorRegistration[] = [
    {
        blockType: "Float",
        namespace: "Inputs",
        tooltip: "A floating point number representing a value with a fractional component",
    },
    {
        blockType: "Color3",
        namespace: "Inputs",
        tooltip: "A set of 3 floating point numbers representing a color",
    },
    {
        blockType: "Color4",
        namespace: "Inputs",
        tooltip: "A set of 4 floating point numbers representing a color",
    },
    {
        blockType: "Texture",
        namespace: "Inputs",
        tooltip: "A texture to be used as input",
    },
    {
        blockType: "Vector2",
        namespace: "Inputs",
        tooltip: "A Vector2 to be used as input",
    },
];
