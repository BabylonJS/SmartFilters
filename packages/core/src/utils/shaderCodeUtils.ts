import type { Effect } from "@babylonjs/core/Materials/effect";

/**
 * The shader code decorator.
 * Used to decorate the names of uniform, function and const variables for easier parsing.
 */
export const decorateChar = "_";

/**
 * Describes a shader function.
 */
export type ShaderFunction = {
    /**
     * The name of the function.
     */
    name: string;

    /**
     * The code of the function.
     */
    code: string;
};

/**
 * Describes a shader code.
 */
export type ShaderCode = {
    /**
     * The declaration of the const variables.
     */
    const?: string;

    /**
     * The declaration of the uniform variables.
     */
    uniform?: string;

    /**
     * The declaration of the uniform variables that should be common for all ShaderBlock instances using this shader code.
     */
    uniformSingle?: string;

    /**
     * The name of the main function.
     */
    mainFunctionName: string;

    /**
     * The name of the input texture which is passed through if the block is disabled.
     */
    mainInputTexture?: string;

    /**
     * The list of functions used in the shader.
     */
    functions: ShaderFunction[];
};

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

export const AutoDisableMainInputColorName = "_autoMainInputColor_";
export const DisableUniform = "disabled";

/**
 * Injects the disable uniform and adds a check for it at the beginning of the main function
 * @param shaderProgram - The shader program to inject the disable feature into
 */
export function injectAutoDisable(shaderProgram: ShaderProgram) {
    const shaderFragment = shaderProgram.fragment;

    // Inject the disable uniform
    injectDisableUniform(shaderFragment);

    // Find the main function
    const mainFunction = shaderFragment.functions.find((f) => f.name === shaderFragment.mainFunctionName);
    if (!mainFunction) {
        throw new Error(
            `Main function not found when trying to inject auto disable into ${shaderFragment.mainFunctionName}`
        );
    }

    // Inject the code
    mainFunction.code = mainFunction.code.replace(
        "{",
        `{\n    vec4 ${AutoDisableMainInputColorName} = texture2D(${shaderFragment.mainInputTexture}, vUV);\n
                if (_disabled_) return ${AutoDisableMainInputColorName};\n`
    );
}

/**
 * Injects the disable uniform into the fragment shader.
 * @param shaderFragment - The shader fragment to inject the disable uniform into.
 */
export function injectDisableUniform(shaderFragment: ShaderCode) {
    shaderFragment.uniform += `\nuniform bool ${decorateSymbol(DisableUniform)};`;
}

/**
 * Gets the shader fragment code.
 * @param shaderProgram - The shader program to extract the code from.
 * @param mainCodeOnly - If true, only the main function code will be returned.
 * @returns The shader fragment code.
 */
export function getShaderFragmentCode(shaderProgram: ShaderProgram, mainCodeOnly = false): string {
    const shaderFragment = shaderProgram.fragment;

    const declarations =
        (shaderFragment.const ?? "") +
        "\n" +
        shaderFragment.uniform +
        "\n" +
        (shaderFragment.uniformSingle ?? "") +
        "\n";

    let mainFunctionCode = "";
    let otherFunctionsCode = "";
    for (let i = 0; i < shaderFragment.functions.length; ++i) {
        const func = shaderFragment.functions[i]!;
        if (func.name === shaderFragment.mainFunctionName) {
            mainFunctionCode += func.code + "\n";
            if (mainCodeOnly) {
                break;
            }
        } else {
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
export function getShaderCreateOptions(shaderProgram: ShaderProgram): ShaderCreationOptions {
    const shaderFragment = shaderProgram.fragment;

    let code = getShaderFragmentCode(shaderProgram);

    const uniforms = shaderFragment.uniform + "\n" + (shaderFragment.uniformSingle ?? "");
    const uniformNames = [];
    const samplerNames = [];

    const rx = new RegExp(`uniform\\s+(\\S+)\\s+(\\w+)\\s*;`, "g");

    let match = rx.exec(uniforms);
    while (match !== null) {
        const varType = match[1]!;
        const varName = match[2]!;

        if (varType === "sampler2D" || varType === "sampler3D") {
            samplerNames.push(varName);
        } else {
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

    const options: ShaderCreationOptions = {
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
export function decorateSymbol(symbol: string): string {
    return decorateChar + symbol + decorateChar;
}

/**
 * Undecorates a symbol (uniform, function or const) name.
 * @param symbol - The symbol to undecorate.
 * @returns The undecorated symbol. Throws an error if the symbol is not decorated.
 */
export function undecorateSymbol(symbol: string): string {
    if (symbol.charAt(0) !== decorateChar || symbol.charAt(symbol.length - 1) !== decorateChar) {
        throw new Error(`undecorateSymbol: Invalid symbol name "${symbol}"`);
    }

    return symbol.substring(1, symbol.length - 1);
}
