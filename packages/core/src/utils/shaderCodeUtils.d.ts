import type { Effect } from "@babylonjs/core/Materials/effect";
import type { ShaderCode } from "./buildTools/shaderCode.types";
/**
 * The shader code decorator.
 * Used to decorate the names of uniform, function and const variables for easier parsing.
 */
export declare const decorateChar = "_";
/**
 * Describes a shader program.
 */
export type ShaderProgram = {
    /**
     * The vertex shader code.
     */
    vertex?: string | undefined;
    /**
     * The fragment shader code.
     */
    fragment: ShaderCode;
};
/**
 * The list of options required to create a shader block.
 * It mainly contains the shader code to execute and its associated parameters.
 */
export type ShaderCreationOptions = {
    /**
     * A friendly name for the shader visible in Spector or in logs.
     */
    name: string;
    /**
     * Fragment shader source code.
     */
    fragmentShader: string;
    /**
     * Vertex shader source code.
     */
    vertexShader?: string;
    /**
     * Attributes to use in the shader
     */
    attributeNames?: Array<string>;
    /**
     * Uniforms to use in the shader
     */
    uniformNames?: Array<string>;
    /**
     * Texture sampler names to use in the shader
     */
    samplerNames?: Array<string>;
    /**
     * Defines to use in the shader
     */
    defines?: Array<string>;
    /**
     * Callback when the effect is compiled
     */
    onCompiled?: (effect: Effect) => void;
};
export declare const AutoDisableMainInputColorName = "autoMainInputColor";
export declare const DisableUniform = "disabled";
/**
 * Injects the disable uniform and adds a check for it at the beginning of the main function
 * @param shaderProgram - The shader program to inject the disable feature into
 */
export declare function injectAutoSampleDisableCode(shaderProgram: ShaderProgram): void;
/**
 * Gets the shader fragment code.
 * @param shaderProgram - The shader program to extract the code from.
 * @param mainCodeOnly - If true, only the main function code will be returned.
 * @returns The shader fragment code.
 */
export declare function getShaderFragmentCode(shaderProgram: ShaderProgram, mainCodeOnly?: boolean): string;
/**
 * Gets the shader creation options from a shader program.
 * @param shaderProgram - The shader program to build the create options from.
 * @returns The shader creation options.
 */
export declare function getShaderCreateOptions(shaderProgram: ShaderProgram): ShaderCreationOptions;
/**
 * Decorates a symbol (uniform, function or const) name.
 * @param symbol - The symbol to decorate.
 * @returns The decorated symbol.
 */
export declare function decorateSymbol(symbol: string): string;
/**
 * Undecorates a symbol (uniform, function or const) name.
 * @param symbol - The symbol to undecorate.
 * @returns The undecorated symbol. Throws an error if the symbol is not decorated.
 */
export declare function undecorateSymbol(symbol: string): string;
//# sourceMappingURL=shaderCodeUtils.d.ts.map