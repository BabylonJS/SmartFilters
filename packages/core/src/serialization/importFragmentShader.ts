import { ConnectionPointType } from "../connection/connectionPointType.js";
import { BlockTypeLabel, parseFragmentShader } from "../utils/buildTools/shaderConverter.js";
import type { SerializedBlockDefinition } from "./serializedBlockDefinition.js";
import type { SerializedInputConnectionPointV1 } from "./v1/blockSerialization.types.js";

/**
 * Converts a single fragment shader .glsl file to an SerializedBlockDefinition instance for use
 * as a CustomShaderBlock.
 * @param fragmentShader - The contents of the .glsl fragment shader file
 * @returns The serialized block definition
 */
export function importFragmentShader(fragmentShader: string): SerializedBlockDefinition {
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
        const defaultString = new RegExp(/\/\/\s*default:(.*)/gs).exec(uniform)?.[1];
        let defaultValue: any | undefined = undefined;
        if (defaultString) {
            defaultValue = JSON.parse(defaultString.trim());
        }
        if (!uniformTypeString || !uniformName) {
            throw new Error(`Uniforms must have a type and a name: '${uniform}'`);
        }

        let inputConnectionPoint: SerializedInputConnectionPointV1;
        switch (uniformTypeString) {
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
            case "float":
                inputConnectionPoint = {
                    name: uniformName,
                    type: ConnectionPointType.Float,
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
