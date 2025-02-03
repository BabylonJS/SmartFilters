import { ConnectionPointType } from "../connection/connectionPointType.js";
import { parseFragmentShader } from "../utils/buildTools/shaderConverter.js";
import type { SerializedBlockDefinition } from "./serializedBlockDefinition.js";
import type { SerializedInputConnectionPointV1 } from "./v1/blockSerialization.types.js";

/**
 * Converts a fragment shader .glsl file to an SerializedBlockDefinition instance for use
 * as a CustomShaderBlock. The .glsl file must contain certain annotations to be able to be
 * imported. See readme.md for more information.
 * @param fragmentShader - The contents of the .glsl fragment shader file
 * @returns The serialized block definition
 */
export function importFragmentShader(fragmentShader: string): SerializedBlockDefinition {
    const fragmentShaderInfo = parseFragmentShader(fragmentShader);

    if (!fragmentShaderInfo.blockType) {
        throw new Error("blockType must be defined");
    }

    // Calculate the input connection points
    const inputConnectionPoints: SerializedInputConnectionPointV1[] = [];
    for (const uniform of fragmentShaderInfo.unRenamedUniforms) {
        if (!uniform) {
            continue;
        }
        const matches = new RegExp(/^uniform\s+(\w+)\s+(\w+)\s*;(?:\s*\/\/\s*default:\s*(.*)\s*)?/gm).exec(uniform);
        if (!matches || matches.length < 3) {
            throw new Error(`Uniforms must have a type and a name: '${uniform}'`);
        }
        const uniformTypeString = matches[1];
        const uniformName = matches[2];
        const defaultValue = matches[3] ? JSON.parse(matches[3].trim()) : undefined;
        if (!uniformTypeString || !uniformName) {
            throw new Error(`Uniforms must have a type and a name: '${uniform}'`);
        }

        let inputConnectionPoint: SerializedInputConnectionPointV1;
        switch (uniformTypeString) {
            case "float":
                inputConnectionPoint = {
                    name: uniformName,
                    type: ConnectionPointType.Float,
                    defaultValue,
                };
                break;
            case "sampler2D":
                inputConnectionPoint = {
                    name: uniformName,
                    type: ConnectionPointType.Texture,
                };
                break;
            case "vec3":
                inputConnectionPoint = {
                    name: uniformName,
                    type: ConnectionPointType.Color3,
                    defaultValue,
                };
                break;
            case "vec4":
                inputConnectionPoint = {
                    name: uniformName,
                    type: ConnectionPointType.Color4,
                    defaultValue,
                };
                break;
            case "bool":
                inputConnectionPoint = {
                    name: uniformName,
                    type: ConnectionPointType.Boolean,
                    defaultValue,
                };
                break;
            case "vec2":
                inputConnectionPoint = {
                    name: uniformName,
                    type: ConnectionPointType.Vector2,
                    defaultValue,
                };
                break;
            default:
                throw new Error(`Unsupported uniform type: '${uniformTypeString}'`);
        }

        inputConnectionPoints.push(inputConnectionPoint);
    }

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
