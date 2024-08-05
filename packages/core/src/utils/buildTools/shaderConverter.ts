import * as fs from "fs";
import * as path from "path";

const TYPE_IMPORT_PATH = "@TYPE_IMPORT_PATH@";
const VERTEX_SHADER = "@VERTEX_SHADER@";
const UNIFORMS = "@UNIFORMS@";
const CONSTS_VALUE = "@CONSTS@";
const CONSTS_PROPERTY = "@CONSTS_PROPERTY@";
const MAIN_INPUT_NAME = "@MAIN_INPUT_NAME@";
const MAIN_FUNCTION_NAME = "@MAIN_FUNCTION_NAME@";
const FUNCTIONS = "@FUNCTIONS@";
const FUNCTION_NAME = "@FUNCTION_NAME@";
const FUNCTION_CODE = "@FUNCTION_CODE@";
const UNIFORM_NAMES = "@UNIFORM_NAMES@";

const ConstsTemplate = `
        const: \`${CONSTS_VALUE}\`,`;

const FunctionTemplate = `
            {
                name: "${FUNCTION_NAME}",
                code: \`
${FUNCTION_CODE}
                    \`,
            },`;

const CodeLinePrefix = "                    ";
const UniformLinePrefix = "            ";
const ConstLinePrefix = "            ";

const ShaderTemplate = `import type { ShaderProgram } from "${TYPE_IMPORT_PATH}";

/**
 * The shader program for the block.
 */
export const shaderProgram: ShaderProgram = {
    vertex: ${VERTEX_SHADER},
    fragment: {
        uniform: \`${UNIFORMS}\`,${CONSTS_PROPERTY}
        mainInputTexture: "${MAIN_INPUT_NAME}",
        mainFunctionName: "${MAIN_FUNCTION_NAME}",
        functions: [${FUNCTIONS}
        ],
    },
};

/**
 * The uniform names for this shader, to be used in the shader binding so
 * that the names are always in sync.
 */
export const uniforms = {
${UNIFORM_NAMES}
};
`;

const UniformNameLinePrefix = "    ";

const GetFunctionNamesRegEx = /\S*\w+\s+(\w+)\s*\(/g;

/**
 * Converts a single shader
 * @param fragmentShaderPath - The path to the fragment file for the shader
 * @param importPath - The path to import the ShaderProgram type from
 */
function convertShader(fragmentShaderPath: string, importPath: string): void {
    console.log(`Processing fragment shader: ${fragmentShaderPath}`);

    // See if there is a corresponding vertex shader
    let vertexShader: string | undefined = undefined;
    const vertexShaderPath = fragmentShaderPath.replace(".fragment.glsl", ".vertex.glsl");
    if (fs.existsSync(vertexShaderPath)) {
        vertexShader = fs.readFileSync(vertexShaderPath, "utf8");
    }
    if (vertexShader) {
        console.log("Found vertex shader");
    }

    // Read the fragment shader
    const fragmentShader = fs.readFileSync(fragmentShaderPath, "utf8");

    // Version check
    const versionsFound = [...fragmentShader.matchAll(/\/\/\s+\[Smart Filter Shader Version\]\s*=\s*(\d+)/g)].map(
        (match) => match[1]
    );
    let version: number = 1;
    if (versionsFound.length === 1 && versionsFound[0]) {
        version = parseInt(versionsFound[0]);
    }
    console.log(`Shader version: ${version}`);

    let fragmentShaderInfo: FragmentShaderInfo;

    switch (version) {
        case 1:
            {
                fragmentShaderInfo = processFragmentShaderV1(fragmentShader);
            }
            break;
        default: {
            throw new Error(`Unsupported shader version: ${version}`);
        }
    }

    // Write the shader TS file
    const shaderFile = fragmentShaderPath.replace(".fragment.glsl", ".shader.ts");
    const finalContents = ShaderTemplate.replace(VERTEX_SHADER, vertexShader ? `\`${vertexShader}\`` : "undefined")
        .replace(TYPE_IMPORT_PATH, importPath)
        .replace(UNIFORMS, "\n" + addLinePrefixes(fragmentShaderInfo.finalUniforms.join("\n"), UniformLinePrefix))
        .replace(MAIN_FUNCTION_NAME, fragmentShaderInfo.mainFunctionName)
        .replace(MAIN_INPUT_NAME, fragmentShaderInfo.mainInputName)
        .replace(
            CONSTS_PROPERTY,
            fragmentShaderInfo.finalConsts.length > 0
                ? ConstsTemplate.replace(
                      CONSTS_VALUE,
                      addLinePrefixes(fragmentShaderInfo.finalConsts.join("\n"), ConstLinePrefix)
                  )
                : ""
        )
        .replace(FUNCTIONS, fragmentShaderInfo.extractedFunctions.join(""))
        .replace(UNIFORM_NAMES, addLinePrefixes(fragmentShaderInfo.uniformNames.join("\n"), UniformNameLinePrefix));

    fs.writeFileSync(shaderFile, finalContents);
}

/**
 * Information about a fragment shader
 */
type FragmentShaderInfo = {
    /**
     * The lines of code which declare the uniforms
     */
    finalUniforms: (string | undefined)[];

    /**
     * The main function name
     */
    mainFunctionName: string;

    /**
     * The main input name
     */
    mainInputName: string;

    /**
     * The lines of code which declare the consts
     */
    finalConsts: (string | undefined)[];

    /**
     * The lines of code which declare the functions
     */
    extractedFunctions: string[];

    /**
     * The lines of code which declare the uniform names
     */
    uniformNames: string[];
};

/**
 * Processes a fragment shader
 * @param fragmentShader - The fragment shader to process
 * @returns The processed fragment shader
 */
function processFragmentShaderV1(fragmentShader: string): FragmentShaderInfo {
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
        const regex = new RegExp(`(\\S*(?:\\s|;|,|\\)|\\()+)${symbol}((\\s|;|,|\\)|\\()+)`, "gs");
        fragmentShaderWithRenamedSymbols = fragmentShaderWithRenamedSymbols.replace(regex, `$1_${symbol}_$2`);
    }
    console.log(`${symbolsToDecorate.length} symbol(s) renamed`);
    const uniformNames = uniforms.map((uniform) => `${uniform}: "${uniform}",`);

    // Extract all the uniforms
    const finalUniforms = [...fragmentShaderWithRenamedSymbols.matchAll(/^\s*(uniform\s.*)/gm)].map(
        (match) => match[1]
    );

    // Extract all the consts
    const finalConsts = [...fragmentShaderWithRenamedSymbols.matchAll(/^\s*(const\s.*)/gm)].map((match) => match[1]);

    // Extract all the functions
    const { extractedFunctions, mainFunctionName } = extractFunctions(fragmentShaderWithRenamedSymbols);

    // Find the main input
    const mainInputs = [...fragmentShaderWithRenamedSymbols.matchAll(/\S*uniform.*\s(\w*);\s*\/\/\s*main/gm)].map(
        (match) => match[1]
    );
    if (mainInputs.length !== 1 || !mainInputs[0]) {
        throw new Error("Exactly one main input must be defined in the shader");
    }
    const mainInputName = mainInputs[0];

    return {
        finalUniforms,
        mainFunctionName,
        mainInputName,
        finalConsts,
        extractedFunctions,
        uniformNames,
    };
}

/**
 * Prefixes each line in the input
 * @param input - The input string
 * @param prefix - The prefix to add to each line
 * @returns The input with each line prefixed
 */
function addLinePrefixes(input: string, prefix: string): string {
    return input
        .split("\n")
        .map((line) => prefix + line)
        .join("\n");
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
    extractedFunctions: string[];

    /**
     * The name of the main function
     */
    mainFunctionName: string;
} {
    const lines = fragment.split("\n");
    const extractedFunctions: string[] = [];
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
            extractedFunctions.push(
                FunctionTemplate.replace(FUNCTION_NAME, functionName).replace(
                    FUNCTION_CODE,
                    addLinePrefixes(functionBody, CodeLinePrefix)
                )
            );
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
 * Converts .fragment.glsl and vertex.glsl file pairs into .shader.ts files which export a ShaderProgram object.
 * @param shaderPath - The path to the .glsl files to convert.
 * @param importPath - The path to import the ShaderProgram type from.
 */
function convertShaders(shaderPath: string, importPath: string) {
    // Get all files in the path
    const allFiles = fs.readdirSync(shaderPath, { withFileTypes: true, recursive: true });

    // Find all fragment shaders (excluding the template)
    const fragmentShaderFiles = allFiles.filter(
        (file) => file.isFile() && file.name.endsWith(".fragment.glsl") && !file.name.endsWith("template.fragment.glsl")
    );

    // Convert all shaders
    for (const fragmentShaderFile of fragmentShaderFiles) {
        convertShader(path.join(fragmentShaderFile.path, fragmentShaderFile.name), importPath);
    }
}

const externalArguments = process.argv.slice(2);
if (externalArguments.length >= 2 && externalArguments[0] && externalArguments[1]) {
    convertShaders(externalArguments[0], externalArguments[1]);
}

// TODO: simple copy from shader file to .ts, get it to build (including import trick)
