import { BlockTypeLabel, parseFragmentShader } from "./shaderParsing.js";
import type { SerializedBlockDefinition } from "../../serialization/serializedBlockDefinition.js";

/**
 * Converts a single shader .glsl file to an SerializedBlockDefinition instance
 * @param fragmentShader - The contents of the .glsl fragment shader file
 * @returns The serialized block definition
 */
export function convertShaderToSerializedBlockDefinition(fragmentShader: string): SerializedBlockDefinition {
    const fragmentShaderInfo = parseFragmentShader(fragmentShader);

    if (!fragmentShaderInfo.blockType) {
        throw new Error(`${BlockTypeLabel} must be defined`);
    }

    // TODO: fix runtime connection point hookup issue
    // TODO: default value syntax

    return {
        version: 1,
        blockType: fragmentShaderInfo.blockType,
        shaderProgram: {
            fragment: fragmentShaderInfo.shaderCode,
        },
        inputConnectionPoints: fragmentShaderInfo.inputConnectionPoints,
        disableOptimization: !!fragmentShaderInfo.disableOptimization,
    };
}
