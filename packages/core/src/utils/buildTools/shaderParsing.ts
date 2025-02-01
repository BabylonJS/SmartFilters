import type { Nullable } from "@babylonjs/core/types";
import type { ShaderCode, ShaderFunction } from "../shaderCodeUtils";

const GetFunctionNamesRegEx = /\S*\w+\s+(\w+)\s*\(/g;

/**
 * Information about a fragment shader
 */
export type FragmentShaderInfo = {
    /**
     * The version of the smart filter shader header format
     */
    smartFilterShaderFormatVersion: number;

    /**
     * If supplied, the blockType to use for the block
     */
    blockType?: string;

    /**
     * If true, optimization should be disabled for this shader
     */
    disableOptimization?: boolean;

    /**
     * The shader code
     */
    shaderCode: ShaderCode;

    /**
     * The lines of code which declare the uniform names
     */
    uniformNames: string[];

    /**
     * The original uniform declarations, before any renaming happened
     */
    unRenamedUniforms: string[];
};

/**
 * Parses a fragment shader
 * @param fragmentShader - The fragment shader to process
 * @returns The processed fragment shader
 */
export function parseFragmentShader(fragmentShader: string): FragmentShaderInfo {
    const header = readHeader(fragmentShader);
    const smartFilterShaderFormatVersion = header?.smartFilterShaderFormatVersion || 1;

    // Version check
    if (smartFilterShaderFormatVersion !== 1) {
        throw new Error(`Unsupported shader format version: ${smartFilterShaderFormatVersion}`);
    }

    // First skip past the header if there is one
    if (fragmentShader.indexOf(SmartFilterShaderVersionLabel) !== -1) {
        fragmentShader = fragmentShader.substring(fragmentShader.indexOf("*/") + 2);
    }

    // Capture the uniforms before they are renamed
    const unRenamedUniforms: string[] = [];
    const unRenamedUniformMatches = fragmentShader.matchAll(/^\s*(uniform\s.*)/gm);
    for (const match of unRenamedUniformMatches) {
        if (match[1]) {
            unRenamedUniforms.push(match[1]);
        }
    }

    const fragmentShaderWithNoFunctionBodies = removeFunctionBodies(fragmentShader);

    // Collect uniform, const, and function names which need to be decorated
    // eslint-disable-next-line prettier/prettier
    const uniforms = [...fragmentShader.matchAll(/\S*uniform.*\s(\w*);/g)].map((match) => match[1]);
    console.log(`Uniforms found: ${JSON.stringify(uniforms)}`);
    const consts = [...fragmentShader.matchAll(/\S*const\s+\w*\s+(\w*)\s*=.*;/g)].map((match) => match[1]);
    console.log(`Consts found: ${JSON.stringify(consts)}`);
    const functionNames = [...fragmentShaderWithNoFunctionBodies.matchAll(GetFunctionNamesRegEx)].map(
        (match) => match[1]
    );
    console.log(`Functions found: ${JSON.stringify(functionNames)}`);

    // Decorate the uniforms, consts, and functions
    const symbolsToDecorate = [...uniforms, ...consts, ...functionNames];
    let fragmentShaderWithRenamedSymbols = fragmentShader;
    for (const symbol of symbolsToDecorate) {
        const regex = new RegExp(`(?<=\\W+)${symbol}(?=\\W+)`, "gs");
        fragmentShaderWithRenamedSymbols = fragmentShaderWithRenamedSymbols.replace(regex, `_${symbol}_`);
    }
    console.log(`${symbolsToDecorate.length} symbol(s) renamed`);
    const uniformNames = uniforms.map((uniform) => `${uniform}: "${uniform}",`);

    // Extract all the uniforms
    const finalUniforms = [...fragmentShaderWithRenamedSymbols.matchAll(/^\s*(uniform\s.*)/gm)].map(
        (match) => match[1]
    );

    // Extract all the consts
    const finalConsts = [...fragmentShaderWithRenamedSymbols.matchAll(/^\s*(const\s.*)/gm)].map((match) => match[1]);

    // Find the main input
    const mainInputs = [...fragmentShaderWithRenamedSymbols.matchAll(/\S*uniform.*\s(\w*);\s*\/\/\s*main/gm)].map(
        (match) => match[1]
    );
    if (mainInputs.length !== 1 || !mainInputs[0]) {
        throw new Error("Exactly one main input must be defined in the shader");
    }
    const mainInputTexture = mainInputs[0];

    // Extract all the functions
    const { extractedFunctions, mainFunctionName } = extractFunctions(fragmentShaderWithRenamedSymbols);

    const shaderCode: ShaderCode = {
        uniform: finalUniforms.join("\n"),
        mainFunctionName,
        mainInputTexture,
        functions: extractedFunctions,
    };

    if (finalConsts.length > 0) {
        shaderCode.const = finalConsts.join("\n");
    }

    return {
        smartFilterShaderFormatVersion,
        blockType: header?.blockType,
        shaderCode,
        uniformNames,
        unRenamedUniforms,
        disableOptimization: !!header?.disableOptimizer,
    };
}

/**
 * Extracts all the functions from the shader
 * @param fragment - The shader code to process
 * @returns A list of functions
 */
function extractFunctions(fragment: string): {
    /**
     * The extracted functions
     */
    extractedFunctions: ShaderFunction[];

    /**
     * The name of the main function
     */
    mainFunctionName: string;
} {
    const lines = fragment.split("\n");
    const extractedFunctions: ShaderFunction[] = [];
    let mainFunctionName: string | undefined;
    let inFunction = false;
    let depth = 0;
    let currentFunction = "";

    for (const line of lines) {
        if (!inFunction && line.includes("{")) {
            inFunction = true;
        }
        if (inFunction) {
            currentFunction += line + "\n";
        }
        for (let pos = 0; pos < line.length; pos++) {
            if (line[pos] === "{") {
                depth++;
            } else if (line[pos] === "}") {
                depth--;
            }
        }
        if (inFunction && depth === 0) {
            inFunction = false;
            const { functionBody, functionName, isMainFunction } = processFunctionBody(currentFunction);

            extractedFunctions.push({
                name: functionName,
                code: functionBody,
            });

            if (isMainFunction) {
                if (mainFunctionName) {
                    throw new Error("Multiple main functions found in shader code");
                }
                mainFunctionName = functionName;
            }
            currentFunction = "";
        }
    }

    if (!mainFunctionName) {
        throw new Error("No main function found in shader code");
    }

    return { extractedFunctions, mainFunctionName };
}

/**
 * Creates code for a ShaderFunction instance from the body of a function
 * @param functionBody - The body of the function
 * @returns The body, name, and whether the function is the main function
 */
function processFunctionBody(functionBody: string): {
    /**
     * The body of the function
     */
    functionBody: string;

    /**
     * The name of the function
     */
    functionName: string;

    /**
     * Whether the function is the main function
     */
    isMainFunction: boolean;
} {
    // Extract the function name
    const functionNamesFound = [...functionBody.matchAll(GetFunctionNamesRegEx)].map((match) => match[1]);
    const functionName = functionNamesFound[0];
    if (!functionName) {
        throw new Error("No function name found in shader code");
    }

    const isMainFunction = functionBody.includes("// main");

    if (isMainFunction) {
        functionBody = functionBody.replace("// main", "");
    }

    return { functionBody, functionName, isMainFunction };
}

/**
 * Removes all function bodies from the shader code, leaving just curly braces behind at the top level
 * @param input - The shader code to process
 * @returns The shader code with all function bodies removed
 */
function removeFunctionBodies(input: string): string {
    let output: string = "";
    let depth: number = 0;

    for (let pos = 0; pos < input.length; pos++) {
        if (input[pos] === "{") {
            depth++;
            // Special case - if we just hit the first { then include it
            if (depth === 1) {
                output += "{";
            }
        } else if (input[pos] === "}") {
            depth--;
            // Special case - if we just hit the last } then include it
            if (depth === 0) {
                output += "}";
            }
        } else if (depth === 0) {
            output += input[pos];
        }
    }

    if (depth !== 0) {
        console.error("Unbalanced curly braces in shader code");
    }

    return output;
}

/**
 * The format of the header we expect in a GLSL shader
 */
type GlslHeader = {
    /**
     * The version of the smart filter shader header format
     */
    smartFilterShaderFormatVersion: number;

    /**
     * The block type to use for the shader, required when converting to a
     * SerializedBlockDefinition, but not when exporting to a .ts file
     * to be included in a hardcoded block definition
     */
    blockType?: string;

    /**
     * If true, optimization should be disabled for this shader
     */
    disableOptimizer?: boolean;
};
export const SmartFilterShaderVersionLabel = "smartFilterShaderVersion";
export const BlockTypeLabel = "blockType";

/**
 * Searches the shader code for specially encoded values required by our format
 * @param shaderCode - The shader code to search
 * @returns - The value of the label or undefined if not found
 */
export function readHeader(shaderCode: string): Nullable<GlslHeader> {
    const match = new RegExp("\\/\\*(.*)\\*\\/", "gs").exec(shaderCode);
    return match && match[1] ? JSON.parse(match[1].trim()) : null;
}
