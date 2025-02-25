import type { Nullable } from "@babylonjs/core/types";
import type { ShaderCode, ShaderFunction } from "./shaderCode.types";

const GetFunctionNamesRegEx = /\S*\w+\s+(\w+)\s*\(/g;

/**
 * Describes the supported metadata properties for a uniform
 */
export type UniformMetadataProperties = {
    /**
     * If supplied, the default value to use for the corresponding input connection point
     */
    default?: any;

    /**
     * If supplied, the input will be automatically bound to this value, instead of creating an input connection point
     * @see InputAutoBindV1 for possible values.
     */
    autoBind?: string;
};

/**
 * Describes a uniform in a shader
 */
export type UniformMetadata = {
    /**
     * The original name of the uniform (not renamed)
     */
    name: string;

    /**
     * The type string of the uniform
     */
    type: string;

    /**
     * Optional properties of the uniform
     */
    properties?: UniformMetadataProperties;
};

/**
 * Information about a fragment shader
 */
export type FragmentShaderInfo = {
    /**
     * If supplied, the blockType to use for the block
     */
    blockType?: string;

    /**
     * If supplied, the namespace of the block
     */
    namespace: Nullable<string>;

    /**
     * If true, optimization should be disabled for this shader
     */
    disableOptimization?: boolean;

    /**
     * The shader code
     */
    shaderCode: ShaderCode;

    /**
     * The set of uniforms
     */
    uniforms: UniformMetadata[];
};

/**
 * Parses a fragment shader
 * @param fragmentShader - The fragment shader to process
 * @returns The processed fragment shader
 */
export function parseFragmentShader(fragmentShader: string): FragmentShaderInfo {
    const { header, fragmentShaderWithoutHeader } = readHeader(fragmentShader);
    fragmentShader = fragmentShaderWithoutHeader;
    const blockType = header?.[SmartFilterBlockTypeKey] || undefined;
    const namespace = header?.namespace || null;

    // Read the uniforms
    const uniforms: UniformMetadata[] = [];
    const uniformRegExp = new RegExp(/(\/\/\s*\{.*\}\s*(?:\r\n|\r|\n)+)?(uniform .*)/gm);
    const uniformGroups = fragmentShader.matchAll(uniformRegExp);
    for (const matches of uniformGroups) {
        const annotationJSON = matches[1];
        const uniformLine = matches[2];

        if (!uniformLine) {
            throw new Error("Uniform line not found");
        }

        const uniformLineMatches = new RegExp(/^uniform\s+(\w+)\s+(\w+)\s*;?/gm).exec(uniformLine);
        if (!uniformLineMatches || uniformLineMatches.length < 3) {
            throw new Error(`Uniforms must have a type and a name: '${uniformLine}'`);
        }
        const uniformTypeString = uniformLineMatches[1];
        const uniformName = uniformLineMatches[2];

        if (!uniformTypeString) {
            throw new Error(`Uniforms must have a type: '${uniformLine}'`);
        }
        if (!uniformName) {
            throw new Error(`Uniforms must have a name: '${uniformLine}'`);
        }

        uniforms.push({
            name: uniformName,
            type: uniformTypeString,
            properties: annotationJSON ? JSON.parse(annotationJSON.replace("//", "").trim()) : undefined,
        });

        if (annotationJSON) {
            // Strip out any annotation so it isn't mistaken for function bodies
            fragmentShader = fragmentShader.replace(annotationJSON, "");
        }
    }

    const fragmentShaderWithNoFunctionBodies = removeFunctionBodies(fragmentShader);

    // Collect uniform, const, and function names which need to be decorated
    // eslint-disable-next-line prettier/prettier
    const uniformNames = uniforms.map((uniform) => uniform.name);
    console.log(`Uniforms found: ${JSON.stringify(uniforms)}`);
    const consts = [...fragmentShader.matchAll(/\S*const\s+\w*\s+(\w*)\s*=.*;/g)].map((match) => match[1]);
    console.log(`Consts found: ${JSON.stringify(consts)}`);
    const functionNames = [...fragmentShaderWithNoFunctionBodies.matchAll(GetFunctionNamesRegEx)].map(
        (match) => match[1]
    );
    console.log(`Functions found: ${JSON.stringify(functionNames)}`);

    // Decorate the uniforms, consts, and functions
    const symbolsToDecorate = [...uniformNames, ...consts, ...functionNames];
    let fragmentShaderWithRenamedSymbols = fragmentShader;
    for (const symbol of symbolsToDecorate) {
        const regex = new RegExp(`(?<=\\W+)${symbol}(?=\\W+)`, "gs");
        fragmentShaderWithRenamedSymbols = fragmentShaderWithRenamedSymbols.replace(regex, `_${symbol}_`);
    }
    console.log(`${symbolsToDecorate.length} symbol(s) renamed`);

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
    if (mainInputs.length > 1) {
        throw new Error("Shaders may have no more than 1 main input");
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
        blockType,
        namespace,
        shaderCode,
        uniforms,
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

const SmartFilterBlockTypeKey = "smartFilterBlockType";

/**
 * The format of the header we expect in a GLSL shader
 */
type GlslHeader = {
    /**
     * The block type to use for the shader, required when converting to a
     * SerializedBlockDefinition, but not when exporting to a .ts file
     * to be included in a hardcoded block definition
     */
    [SmartFilterBlockTypeKey]: string;

    /**
     * The namespace to use for the block
     */
    namespace?: string;

    /**
     * If true, optimization should be disabled for this shader
     */
    disableOptimizer?: boolean;
};

/**
 * Reads the GlslHeader from the shader code
 * @param fragmentShader - The shader code to read
 * @returns - The GlslHeader if found, otherwise null
 */
function readHeader(fragmentShader: string): {
    /**
     * The glsl header, or null if there wasn't one
     */
    header: Nullable<GlslHeader>;

    /**
     * The fragment shader code with the header removed if there was one
     */
    fragmentShaderWithoutHeader: string;
} {
    const singleLineHeaderMatch = new RegExp(/^\/\/\s*(\{.*\})/gm).exec(fragmentShader);
    if (singleLineHeaderMatch && singleLineHeaderMatch[1]) {
        return {
            header: JSON.parse(singleLineHeaderMatch[1].trim()),
            fragmentShaderWithoutHeader: fragmentShader.replace(singleLineHeaderMatch[0], ""),
        };
    }

    const multiLineHeaderMatch = new RegExp("^\\/\\*(.*)\\*\\/", "gs").exec(fragmentShader);
    if (multiLineHeaderMatch && multiLineHeaderMatch[1]) {
        return {
            header: JSON.parse(multiLineHeaderMatch[1].trim()),
            fragmentShaderWithoutHeader: fragmentShader.replace(multiLineHeaderMatch[0], ""),
        };
    }

    return {
        header: null,
        fragmentShaderWithoutHeader: fragmentShader,
    };
}

/**
 * Determines if a fragment shader has the GLSL header required for parsing
 * @param fragmentShader - The fragment shader to check
 * @returns True if the fragment shader has the GLSL header
 */
export function hasGlslHeader(fragmentShader: string): boolean {
    return fragmentShader.indexOf(SmartFilterBlockTypeKey) !== -1;
}
