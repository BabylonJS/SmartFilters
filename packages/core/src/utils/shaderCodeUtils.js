/**
 * The shader code decorator.
 * Used to decorate the names of uniform, function and const variables for easier parsing.
 */
export const decorateChar = "_";
export const AutoDisableMainInputColorName = "autoMainInputColor";
export const DisableUniform = "disabled";
/**
 * Injects the disable uniform and adds a check for it at the beginning of the main function
 * @param shaderProgram - The shader program to inject the disable feature into
 */
export function injectAutoSampleDisableCode(shaderProgram) {
    const shaderFragment = shaderProgram.fragment;
    // Inject the disable uniform
    shaderFragment.uniform += `\nuniform bool ${decorateSymbol(DisableUniform)};`;
    // Find the main function
    const mainFunction = shaderFragment.functions.find((f) => f.name === shaderFragment.mainFunctionName);
    if (!mainFunction) {
        throw new Error(`Main function not found when trying to inject auto disable into ${shaderFragment.mainFunctionName}`);
    }
    // Ensure the shader has a main input texture
    if (!shaderFragment.mainInputTexture) {
        throw new Error(`Main input texture not found when trying to inject auto disable into ${shaderFragment.mainFunctionName}`);
    }
    // Inject the code
    const autoDisableVariableName = decorateSymbol(AutoDisableMainInputColorName);
    mainFunction.code = mainFunction.code.replace("{", `{\n    vec4 ${autoDisableVariableName} = texture2D(${shaderFragment.mainInputTexture}, vUV);\n
                if (${decorateSymbol(DisableUniform)}) return ${autoDisableVariableName};\n`);
}
/**
 * Gets the shader fragment code.
 * @param shaderProgram - The shader program to extract the code from.
 * @param mainCodeOnly - If true, only the main function code will be returned.
 * @returns The shader fragment code.
 */
export function getShaderFragmentCode(shaderProgram, mainCodeOnly = false) {
    var _a, _b;
    const shaderFragment = shaderProgram.fragment;
    const declarations = ((_a = shaderFragment.const) !== null && _a !== void 0 ? _a : "") +
        "\n" +
        shaderFragment.uniform +
        "\n" +
        ((_b = shaderFragment.uniformSingle) !== null && _b !== void 0 ? _b : "") +
        "\n";
    let mainFunctionCode = "";
    let otherFunctionsCode = "";
    for (let i = 0; i < shaderFragment.functions.length; ++i) {
        const func = shaderFragment.functions[i];
        if (func.name === shaderFragment.mainFunctionName) {
            mainFunctionCode += func.code + "\n";
            if (mainCodeOnly) {
                break;
            }
        }
        else {
            otherFunctionsCode += func.code + "\n";
        }
    }
    return mainCodeOnly ? mainFunctionCode : declarations + otherFunctionsCode + mainFunctionCode;
}
/**
 * Gets the shader creation options from a shader program.
 * @param shaderProgram - The shader program to build the create options from.
 * @returns The shader creation options.
 */
export function getShaderCreateOptions(shaderProgram) {
    var _a;
    const shaderFragment = shaderProgram.fragment;
    let code = getShaderFragmentCode(shaderProgram);
    const uniforms = shaderFragment.uniform + "\n" + ((_a = shaderFragment.uniformSingle) !== null && _a !== void 0 ? _a : "");
    const uniformNames = [];
    const samplerNames = [];
    const rx = new RegExp(`uniform\\s+(\\S+)\\s+(\\w+)\\s*;`, "g");
    let match = rx.exec(uniforms);
    while (match !== null) {
        const varType = match[1];
        const varName = match[2];
        if (varType === "sampler2D" || varType === "sampler3D") {
            samplerNames.push(varName);
        }
        else {
            uniformNames.push(varName);
        }
        match = rx.exec(uniforms);
    }
    code =
        "varying vec2 vUV;\n" +
            code +
            "\nvoid main(void) {\ngl_FragColor = " +
            shaderFragment.mainFunctionName +
            "(vUV);\n}";
    const options = {
        name: shaderFragment.mainFunctionName,
        fragmentShader: code,
        uniformNames: uniformNames,
        samplerNames: samplerNames,
    };
    if (shaderProgram.vertex) {
        options.vertexShader = shaderProgram.vertex;
    }
    return options;
}
/**
 * Decorates a symbol (uniform, function or const) name.
 * @param symbol - The symbol to decorate.
 * @returns The decorated symbol.
 */
export function decorateSymbol(symbol) {
    return decorateChar + symbol + decorateChar;
}
/**
 * Undecorates a symbol (uniform, function or const) name.
 * @param symbol - The symbol to undecorate.
 * @returns The undecorated symbol. Throws an error if the symbol is not decorated.
 */
export function undecorateSymbol(symbol) {
    if (symbol.charAt(0) !== decorateChar || symbol.charAt(symbol.length - 1) !== decorateChar) {
        throw new Error(`undecorateSymbol: Invalid symbol name "${symbol}"`);
    }
    return symbol.substring(1, symbol.length - 1);
}
//# sourceMappingURL=shaderCodeUtils.js.map