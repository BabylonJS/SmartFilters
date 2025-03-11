import * as fs from "fs";
import * as path from "path";
import { convertShaderGlslIntoShaderProgram } from "./convertGlslIntoShaderProgram.js";
import { convertShaderIntoCustomBlockFile } from "./convertGlslIntoBlock.js";

/**
 * Converts all GLSL files in a path into blocks for use in the build system.
 * @param shaderPath - The path to the .glsl files to convert.
 * @param importPath - The path to import the ShaderProgram type from.
 */
export function convertShaders(shaderPath: string, importPath: string) {
    // Get all files in the path
    const allFiles = fs.readdirSync(shaderPath, { withFileTypes: true, recursive: true });

    // Find all fragment shaders (excluding the template)
    const fragmentShaderFiles = allFiles.filter(
        (file) => file.isFile() && file.name.endsWith(".fragment.glsl") && !file.name.endsWith("template.fragment.glsl")
    );

    // Convert all shaders
    for (const fragmentShaderFile of fragmentShaderFiles) {
        const fullPathAndFileName = path.join(fragmentShaderFile.path, fragmentShaderFile.name);
        convertShader(fullPathAndFileName, importPath);
    }
}

/**
 * Converts a single GLSL file into a block for use in the build system.
 * @param fullPathAndFileName - The full path and file name of the .glsl file to convert.
 * @param importPath - The path to import the ShaderProgram type from.
 */
export function convertShader(fullPathAndFileName: string, importPath: string): void {
    console.log(`\nProcessing fragment shader: ${fullPathAndFileName}`);

    const hardcodedBlockDefinitionFileName = fullPathAndFileName.replace(".fragment.glsl", ".ts");
    if (fs.existsSync(hardcodedBlockDefinitionFileName)) {
        console.log(
            "Found corresponding .ts file - generating another .ts file that it can load the shader code from."
        );
        convertShaderGlslIntoShaderProgram(fullPathAndFileName, importPath);
    } else {
        console.log("No corresponding .ts file found - generating a .ts file that can be used as a hardcoded block.");
        convertShaderIntoCustomBlockFile(fullPathAndFileName);
    }
}
