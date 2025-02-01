import { ConnectionPointType } from "../connection/connectionPointType.js";
import { BlockTypeLabel, parseFragmentShader } from "../utils/buildTools/shaderParsing.js";
import type { SerializedBlockDefinition } from "./serializedBlockDefinition.js";
import type { SerializedInputConnectionPointV1 } from "./v1/blockSerialization.types.js";

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

    // Calculate the input connection points
    const inputConnectionPoints: SerializedInputConnectionPointV1[] = [];
    for (const uniform of fragmentShaderInfo.unRenamedUniforms) {
        if (!uniform) {
            continue;
        }
        const split = uniform.split(" ");
        const uniformTypeString = split[1];
        const uniformName = split[2]?.replace(";", "");
        if (!uniformTypeString || !uniformName) {
            throw new Error(`Uniforms must have a type and a name: '${uniform}'`);
        }

        let type: ConnectionPointType;
        switch (uniformTypeString) {
            case "sampler2D":
                type = ConnectionPointType.Texture;
                break;
            case "vec3":
                type = ConnectionPointType.Color3;
                break;
            case "float":
                type = ConnectionPointType.Float;
                break;
            default:
                throw new Error(`Unsupported uniform type: '${uniformTypeString}'`);
        }

        inputConnectionPoints.push({
            name: uniformName,
            type,
        });
    }

    // TODO: fix runtime connection point hookup issue
    // TODO: default value syntax

    return {
        version: 1,
        blockType: fragmentShaderInfo.blockType,
        shaderProgram: {
            fragment: fragmentShaderInfo.shaderCode,
        },
        inputConnectionPoints,
        disableOptimization: !!fragmentShaderInfo.disableOptimization,
    };
}
