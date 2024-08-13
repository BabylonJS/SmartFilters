import type { IBlockEditorRegistration } from "../configuration/editor/IBlockEditorRegistration";

export const defaultBlockEditorRegistrations: IBlockEditorRegistration[] = [
    {
        name: "Float",
        category: "Inputs",
        tooltip: "A floating point number representing a value with a fractional component",
    },
    {
        name: "Color3",
        category: "Inputs",
        tooltip: "A set of 3 floating point numbers representing a color",
    },
    {
        name: "Texture",
        category: "Inputs",
        tooltip: "A texture to be used as input",
    },
    // TODO: Can I add the rest of the ConnectionPointTypes here? They all seem supported.
    //       Or at least add the ones used by current blocks.
];
