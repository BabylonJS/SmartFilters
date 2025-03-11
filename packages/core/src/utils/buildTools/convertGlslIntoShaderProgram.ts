import * as fs from "fs";
import { parseFragmentShader } from "./shaderConverter.js";

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

/**
 * Converts a single shader to a .ts file which can be imported by a hardcoded block
 * @param fragmentShaderPath - The path to the fragment file for the shader
 * @param importPath - The path to import the ShaderProgram type from
 */
export function convertShaderGlslIntoShaderProgram(fragmentShaderPath: string, importPath: string): void {
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
    const fragmentShaderInfo = parseFragmentShader(fragmentShader);

    // Write the shader TS file
    const shaderFile = fragmentShaderPath.replace(".fragment.glsl", ".autogen.shaderProgram.ts");
    const functionsSection: string[] = [];
    for (const shaderFunction of fragmentShaderInfo.shaderCode.functions) {
        functionsSection.push(
            FunctionTemplate.replace(FUNCTION_NAME, shaderFunction.name).replace(
                FUNCTION_CODE,
                addLinePrefixes(shaderFunction.code, CodeLinePrefix)
            )
        );
    }
    const finalContents = ShaderTemplate.replace(VERTEX_SHADER, vertexShader ? `\`${vertexShader}\`` : "undefined")
        .replace(TYPE_IMPORT_PATH, importPath)
        .replace(UNIFORMS, "\n" + addLinePrefixes(fragmentShaderInfo.shaderCode.uniform || "", UniformLinePrefix))
        .replace(MAIN_FUNCTION_NAME, fragmentShaderInfo.shaderCode.mainFunctionName)
        .replace(MAIN_INPUT_NAME, fragmentShaderInfo.shaderCode.mainInputTexture || '""')
        .replace(
            CONSTS_PROPERTY,
            fragmentShaderInfo.shaderCode.const
                ? ConstsTemplate.replace(
                      CONSTS_VALUE,
                      addLinePrefixes(fragmentShaderInfo.shaderCode.const, ConstLinePrefix)
                  )
                : ""
        )
        .replace(FUNCTIONS, functionsSection.join(""))
        .replace(
            UNIFORM_NAMES,
            addLinePrefixes(
                fragmentShaderInfo.uniforms.map((u) => `${u.name}: "${u.name}",`).join("\n"),
                UniformNameLinePrefix
            )
        );

    fs.writeFileSync(shaderFile, finalContents);
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
