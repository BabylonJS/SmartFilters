import type { Nullable } from "@babylonjs/core/types";

/**
 * The editor uses a single string to uniquely identify a block type, but Smart Filter blocks use
 * a namespace and block type. This function converts a block type and namespace to the string used
 * by the editor.
 * @param blockType - The block type
 * @param namespace - The namespace of the block
 * @returns - The block name for the editor
 */
export function getBlockNameForEditor(blockType: string, namespace: Nullable<string>) {
    if (namespace === null) {
        return blockType;
    }
    return `[${namespace}].[${blockType}]`;
}

/**
 * The editor uses a single string to uniquely identify a block type, but Smart Filter blocks use
 * a namespace and block type. This function converts the block name used by the editor to the block
 * type and namespace used by Smart Filter blocks.
 * @param blockNameForEditor - The block name used by the editor
 * @returns - The block type and namespace
 */
export function getBlockTypeAndNamespaceFromBlockNameForEditor(blockNameForEditor: string): {
    blockType: string;
    namespace: Nullable<string>;
} {
    if (blockNameForEditor.indexOf("].[") === -1) {
        return { blockType: blockNameForEditor, namespace: null };
    }

    const [namespace, blockType] = blockNameForEditor.slice(1, -1).split("].[");

    if (!blockType) {
        throw new Error(`Invalid block name: ${blockNameForEditor}`);
    }

    return { blockType, namespace: namespace || null };
}
