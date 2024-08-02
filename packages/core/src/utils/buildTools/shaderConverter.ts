import * as fs from "fs";
import * as path from "path";

const TYPE_IMPORT_PATH = "@TYPE_IMPORT_PATH@";
const VERTEX_SHADER = "@VERTEX_SHADER@";
const UNIFORMS = "@UNIFORMS";
const MAIN_FUNCTION_NAME = "@MAIN_FUNCTION_NAME@";
const FUNCTIONS = "@FUNCTIONS@";
// const FUNCTION_NAME = "@FUNCTION_NAME@";
// const FUNCTION_CODE = "@FUNCTION_CODE@";

// const FunctionTemplate = `
//                 {
//                     name: "${FUNCTION_NAME}",
//                     code: \`
// ${FUNCTION_CODE}
//                     \`,
//                 },
// `;

const ShaderTemplate = `import type { ShaderProgram } from "${TYPE_IMPORT_PATH}";
export const shaderProgram: ShaderProgram = {
    vertex: ${VERTEX_SHADER},
    fragment: {
        uniform: \`${UNIFORMS}\`,
        mainFunctionName: \`${MAIN_FUNCTION_NAME}\`,
        functions: [
            ${FUNCTIONS}
        ],
    },
};
`;

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
    const fragmentShaderWithNoFunctionBodies = removeFunctionBodies(fragmentShader);

    console.log("Fragment shader with no function bodies:");
    console.log(fragmentShaderWithNoFunctionBodies);

    // Collect uniform, const, and function names which need to be decorated
    // eslint-disable-next-line prettier/prettier
    const uniforms = [...fragmentShader.matchAll(/\S*uniform.*\s(\w*);/g)].map((match) => match[1]);
    console.log(`Uniforms found: ${JSON.stringify(uniforms)}`);
    const consts = [...fragmentShader.matchAll(/\S*const\s+\w*\s+(\w*)\s*=.*;/g)].map((match) => match[1]);
    console.log(`Consts found: ${JSON.stringify(consts)}`);
    const functions = [...fragmentShaderWithNoFunctionBodies.matchAll(/\S*\w+\s+(\w+)\s*\(/g)].map((match) => match[1]);
    console.log(`Functions found: ${JSON.stringify(functions)}`);

    // Decorate the uniforms, consts, and functions
    const symbolsToDecorate = [...uniforms, ...consts, ...functions];
    let fragmentShaderWithRenamedSymbols = fragmentShader;
    for (const symbol of symbolsToDecorate) {
        const regex = new RegExp(`(\\S*(?:\\s|;|\\()+)${symbol}((\\s|;|\\()+)`, "gs");
        fragmentShaderWithRenamedSymbols = fragmentShaderWithRenamedSymbols.replace(regex, `$1_${symbol}_$2`);
    }
    console.log(`${symbolsToDecorate.length} symbol(s) renamed`);

    // Extract all the uniforms
    console.log("Fragment shader with renamed symbols:");
    const finalUniforms = [...fragmentShaderWithRenamedSymbols.matchAll(/$\s*(uniform\s.*)/gm)].map(
        (match) => match[1]
    );
    console.log(`Final uniforms: ${JSON.stringify(finalUniforms)}`);

    // Write the shader TS file
    const shaderFile = fragmentShaderPath.replace(".fragment.glsl", ".shader.ts");
    fs.writeFileSync(
        shaderFile,
        ShaderTemplate.replace(VERTEX_SHADER, vertexShader ? `\`${vertexShader}\`` : "undefined")
            .replace(TYPE_IMPORT_PATH, importPath)
            .replace(UNIFORMS, "\n" + finalUniforms.join("\n"))
            .replace(MAIN_FUNCTION_NAME, "main")
            .replace(FUNCTIONS, "")
    );
}

/**
 * Removes all function bodies from the shader code, leaving just curly braces behind at the top level
 * @param input - The shader code to process
 * @returns The shader code with all function bodies removed
 */
function removeFunctionBodies(input: string): string {
    let output: string = "";
    let parenDepth: number = 0;

    for (let pos = 0; pos < input.length; pos++) {
        if (input[pos] === "{") {
            parenDepth++;
            // Special case - if we just hit the first { then include it
            if (parenDepth === 1) {
                output += "{";
            }
        } else if (input[pos] === "}") {
            parenDepth--;
            // Special case - if we just hit the last } then include it
            if (parenDepth === 0) {
                output += "}";
            }
        } else if (parenDepth === 0) {
            output += input[pos];
        }
    }

    if (parenDepth !== 0) {
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
