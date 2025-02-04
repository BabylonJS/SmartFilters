import { ConnectionPointType } from "../connection/connectionPointType.js";
import { hasGlslHeader, parseFragmentShader } from "../utils/buildTools/shaderConverter.js";
import type { SerializedBlockDefinition } from "./serializedBlockDefinition.js";
import type { SerializedInputConnectionPointV1 } from "./v1/blockSerialization.types.js";

/**
 * Imports a serialized custom shader block definition. Supports importing a JSON string
 * of an SerializedBlockDefinition object, or a glsl shader with the required annotations
 * so it can be converted to a SerializedBlockDefinition object.
 * See readme.md for more information.
 * @param serializedBlockDefinition - The serialized block definition - either a SerializedBlockDefinition object in a JSON string, or an annotated glsl shader
 * @returns The serialized block definition
 */
export function importCustomShaderBlockDefinition(serializedBlockDefinition: string): SerializedBlockDefinition {
    if (hasGlslHeader(serializedBlockDefinition)) {
        return importAnnotatedGlsl(serializedBlockDefinition);
    } else {
        // Assume this is a serialized SerializedBlockDefinition object
        return JSON.parse(serializedBlockDefinition);
    }
}

/**
 * Converts a fragment shader .glsl file to an SerializedBlockDefinition instance for use
 * as a CustomShaderBlock. The .glsl file must contain certain annotations to be imported.
 * See readme.md for more information.
 * @param fragmentShader - The contents of the .glsl fragment shader file
 * @returns The serialized block definition
 */
function importAnnotatedGlsl(fragmentShader: string): SerializedBlockDefinition {
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

        // Parse the uniform
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

        // Convert to ConnectionPointType
        let type: ConnectionPointType;
        switch (uniformTypeString) {
            case "float":
                type = ConnectionPointType.Float;
                break;
            case "sampler2D":
                type = ConnectionPointType.Texture;
                break;
            case "vec3":
                type = ConnectionPointType.Color3;
                break;
            case "vec4":
                type = ConnectionPointType.Color4;
                break;
            case "bool":
                type = ConnectionPointType.Boolean;
                break;
            case "vec2":
                type = ConnectionPointType.Vector2;
                break;
            default:
                throw new Error(`Unsupported uniform type: '${uniformTypeString}'`);
        }

        // Add to input connection point list
        const inputConnectionPoint: SerializedInputConnectionPointV1 = {
            name: uniformName,
            type,
        };
        if (inputConnectionPoint.type !== ConnectionPointType.Texture && defaultValue) {
            inputConnectionPoint.defaultValue = defaultValue;
        }
        inputConnectionPoints.push(inputConnectionPoint);
    }

    return {
        formatVersion: 1,
        blockType: fragmentShaderInfo.blockType,
        shaderProgram: {
            fragment: fragmentShaderInfo.shaderCode,
        },
        inputConnectionPoints,
        disableOptimization: !!fragmentShaderInfo.disableOptimization,
    };
}
