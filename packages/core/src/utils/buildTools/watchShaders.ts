/**
 * Watches all .glsl files under <shaderPath> and rebuild them when changed.
 * @arg shaderPath The path to the shaders to watch
 * @arg importPath The path to import the converted shaders
 * @example node watchShaders.js <shaderPath> <importPath>
 */

import { convertShader } from "./shaderConverter.js";
import * as chokidar from "chokidar";
import * as path from "path";

const externalArguments = process.argv.slice(2);
if (externalArguments.length >= 2 && externalArguments[0] && externalArguments[1]) {
    const shaderPath = externalArguments[0];
    const importPath = externalArguments[1];

    chokidar.watch(shaderPath).on("change", (file) => {
        if (path.extname(file) === ".glsl") {
            convertShader(file, importPath);
        }
    });
    console.log(`Watching for shader changes in ${shaderPath}`);
}
