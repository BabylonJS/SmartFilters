// import { importCustomBlockDefinition } from "../../serialization/importCustomBlockDefinition.js";
import * as fs from "fs";
import { extractShaderProgramFromGlsl } from "./convertGlslIntoShaderProgram.js";
import { ConnectionPointType } from "../../connection/connectionPointType.js";

const SHADER_PROGRAM = "@SHADER_PROGRAM@";
const BLOCK_NAME = "@BLOCK_NAME@";
const NAMESPACE = "@NAMESPACE@";
const SHADER_BINDING_PRIVATE_VARIABLES = "@SHADER_BINDING_PRIVATE_VARIABLES@";
const CAMEL_CASE_UNIFORM = "@CAMEL_CASE_UNIFORM@";
const CONNECTION_POINT_TYPE = "@CONNECTION_POINT_TYPE@";
const SHADER_BINDING_CTOR_DOCSTRING_PARAMS = "@SHADER_BINDING_CTOR_DOCSTRING_PARAMS@";
const SHADER_BINDING_CTOR_PARAMS = "@SHADER_CTOR_PARAMS@";
const SHADER_BINDING_CTOR = "@SHADER_BINDING_CTOR@";
const SHADER_BINDING_BIND = "@SHADER_BINDING_BIND@";
const BLOCK_INPUT_PROPERTIES = "@BLOCK_INPUT_PROPERTIES@";
const BLOCK_GET_SHADER_BINDING_VARS = "@BLOCK_SHADER_BINDING_BIND_VARS@";
const BLOCK_GET_SHADER_PARAM_LIST = "@BLOCK_GET_SHADER_PARAM_LIST@";
const EFFECT_SETTER = "@EFFECT_SETTER@";

const ShaderBindingPrivateVariablesTemplate = `    private readonly _${CAMEL_CASE_UNIFORM}: RuntimeData<ConnectionPointType.${CONNECTION_POINT_TYPE}>;`;
const ShaderBindingCtorDocstringParams = `     * @param ${CAMEL_CASE_UNIFORM} - The ${CAMEL_CASE_UNIFORM} runtime value`;
const ShaderBindingCtorParams = `        ${CAMEL_CASE_UNIFORM}: RuntimeData<ConnectionPointType.${CONNECTION_POINT_TYPE}>`;
const ShaderBindingCtor = `        this._${CAMEL_CASE_UNIFORM} = ${CAMEL_CASE_UNIFORM};`;
const ShaderBindingBind = `        effect.${EFFECT_SETTER}(this.getRemappedName(uniforms.${CAMEL_CASE_UNIFORM}), this._${CAMEL_CASE_UNIFORM}.value);`;

const BlockInputProperties = `    /**
     * The ${CAMEL_CASE_UNIFORM} connection point.
     */
    public readonly ${CAMEL_CASE_UNIFORM} = this._registerInput(uniforms.${CAMEL_CASE_UNIFORM}, ConnectionPointType.${CONNECTION_POINT_TYPE});
`;
const BlockGetShaderBindingVars = `        const ${CAMEL_CASE_UNIFORM} = this._confirmRuntimeDataSupplied(this.${CAMEL_CASE_UNIFORM});`;

const FileTemplate = `/* eslint-disable prettier/prettier */
// ************************************************************
// Note: this file is auto-generated, do not modify it directly
// ************************************************************

// It was generated by convertGlslIntoBlock() from
// an annotated .glsl file. Modify the .glsl file to make changes
// to the block. This file will get overwritten when the build
// is run or during a watch when the .glsl file is updated.

import type { Effect } from "@babylonjs/core/Materials/effect";

import {
    ShaderBinding,
    type RuntimeData,
    ConnectionPointType,
    type SmartFilter,
    ShaderBlock,
    type ShaderProgram,
} from "@babylonjs/smart-filters";${SHADER_PROGRAM}
/**
 * The shader binding for the ${BLOCK_NAME}, used by the runtime
 */
class ${BLOCK_NAME}ShaderBinding extends ShaderBinding {
${SHADER_BINDING_PRIVATE_VARIABLES}

    /**
     * Creates a new shader binding instance for the block.
${SHADER_BINDING_CTOR_DOCSTRING_PARAMS}
     */
    constructor(
${SHADER_BINDING_CTOR_PARAMS}
    ) {
        super();
${SHADER_BINDING_CTOR}
    }

    /**
     * Binds all the required data to the shader when rendering.
     * @param effect - defines the effect to bind the data to
     */
    public override bind(effect: Effect): void {
${SHADER_BINDING_BIND}
    }
}

/**
 * The implementation of the ${BLOCK_NAME}
 */
export class ${BLOCK_NAME} extends ShaderBlock {
    /**
     * The class name of the block.
     */
    public static override ClassName = "${BLOCK_NAME}";

    /**
     * The namespace of the block.
     */
    public static override Namespace = "${NAMESPACE}";

${BLOCK_INPUT_PROPERTIES}
    /**
     * The shader program (vertex and fragment code) to use to render the block
     */
    public static override ShaderCode = shaderProgram;

    /**
     * Instantiates a new ${BLOCK_NAME}.
     * @param smartFilter - The smart filter this block belongs to
     * @param name - The friendly name of the block
     */
    constructor(smartFilter: SmartFilter, name: string) {
        super(smartFilter, name);
    }

    /**
     * Get the class instance that binds all the required data to the shader (effect) when rendering.
     * @returns The class instance that binds the data to the effect
     */
    public getShaderBinding(): ShaderBinding {
${BLOCK_GET_SHADER_BINDING_VARS}

        return new ${BLOCK_NAME}ShaderBinding(${BLOCK_GET_SHADER_PARAM_LIST});
    }
}

`;

// TODO: change terminology - don't call these custom blocks

/**
 * Converts a single shader to a .ts file which exports a Smart Filter block
 * @param fragmentShaderPath - The path to the fragment file for the shader
 * @param importPath - The path to import the ShaderProgram type from
 */
export function convertGlslIntoBlock(fragmentShaderPath: string, importPath: string): void {
    const { shaderProgramCode, fragmentShaderInfo } = extractShaderProgramFromGlsl(
        fragmentShaderPath,
        importPath,
        false,
        false
    );

    // Validation
    if (!fragmentShaderInfo.blockType) {
        throw new Error("The glsl file must contain a header comment with a smartFilterBlockType value");
    }

    // Generate shader binding private variables
    const shaderBindingPrivateVariables = fragmentShaderInfo.uniforms.map((uniform) => {
        return ShaderBindingPrivateVariablesTemplate.replace(CAMEL_CASE_UNIFORM, uniform.name).replace(
            CONNECTION_POINT_TYPE,
            getConnectionPointTypeString(uniform.type)
        );
    });

    // Generate the shader binding constructor docstring params
    const shaderBindingCtorDocstringParams = fragmentShaderInfo.uniforms.map((uniform) => {
        return ShaderBindingCtorDocstringParams.replace(new RegExp(CAMEL_CASE_UNIFORM, "g"), uniform.name);
    });

    // Generate the shader binding constructor params
    const shaderBindingCtorParams = fragmentShaderInfo.uniforms.map((uniform) => {
        return ShaderBindingCtorParams.replace(CAMEL_CASE_UNIFORM, uniform.name).replace(
            CONNECTION_POINT_TYPE,
            getConnectionPointTypeString(uniform.type)
        );
    });

    // Generate the shader binding constructor
    const shaderBindingCtor = fragmentShaderInfo.uniforms.map((uniform) => {
        return ShaderBindingCtor.replace(new RegExp(CAMEL_CASE_UNIFORM, "g"), uniform.name);
    });

    // Generate the shader binding bind
    const shaderBindingBind = fragmentShaderInfo.uniforms.map((uniform) => {
        return ShaderBindingBind.replace(new RegExp(CAMEL_CASE_UNIFORM, "g"), uniform.name).replace(
            EFFECT_SETTER,
            getEffectSetter(uniform.type)
        );
    });

    // Generate the block input properties
    const blockInputProperties = fragmentShaderInfo.uniforms.map((uniform) => {
        return BlockInputProperties.replace(new RegExp(CAMEL_CASE_UNIFORM, "g"), uniform.name).replace(
            CONNECTION_POINT_TYPE,
            getConnectionPointTypeString(uniform.type)
        );
    });

    // Generate the block get shader binding vars
    const blockGetShaderBindingVars = fragmentShaderInfo.uniforms.map((uniform) => {
        return BlockGetShaderBindingVars.replace(new RegExp(CAMEL_CASE_UNIFORM, "g"), uniform.name);
    });

    // Generate the block get shader param list
    const blockGetShaderParamList = fragmentShaderInfo.uniforms.map((uniform) => {
        return uniform.name;
    });

    // Generate final contents
    const finalContents = FileTemplate.replace(SHADER_PROGRAM, shaderProgramCode)
        .replace(new RegExp(BLOCK_NAME, "g"), fragmentShaderInfo.blockType)
        .replace(NAMESPACE, fragmentShaderInfo.namespace || "Other")
        .replace(SHADER_BINDING_PRIVATE_VARIABLES, shaderBindingPrivateVariables.join("\n"))
        .replace(SHADER_BINDING_CTOR_DOCSTRING_PARAMS, shaderBindingCtorDocstringParams.join("\n"))
        .replace(SHADER_BINDING_CTOR_PARAMS, shaderBindingCtorParams.join(",\n"))
        .replace(SHADER_BINDING_CTOR, shaderBindingCtor.join("\n"))
        .replace(SHADER_BINDING_BIND, shaderBindingBind.join("\n"))
        .replace(BLOCK_INPUT_PROPERTIES, blockInputProperties.join("\n"))
        .replace(BLOCK_GET_SHADER_BINDING_VARS, blockGetShaderBindingVars.join("\n"))
        .replace(BLOCK_GET_SHADER_PARAM_LIST, blockGetShaderParamList.join(","));

    // Write the block TS file
    const outputFullPathAndFileName = fragmentShaderPath.replace(".fragment.glsl", ".autogen.block.ts");
    fs.writeFileSync(outputFullPathAndFileName, finalContents);
}

// /**
//  * Converts an object into valid JS that creates that object
//  * @param obj - The object to convert
//  * @param indent - The indent to use for the object
//  * @returns - A string that contains JS that creates the object
//  */
// function objectToJsString(obj: any, indent: string = indentation): string {
//     if (typeof obj !== "object" || obj === null) {
//         return JSON.stringify(obj);
//     }

//     if (Array.isArray(obj)) {
//         const arrayItems = obj.map((item) => objectToJsString(item, indent + indentation));
//         return `[\n${indent}${arrayItems.join(`,\n${indent}`)},\n${indent.slice(indentationSize)}]`;
//     }

//     const entries = Object.entries(obj).map(([key, value]) => {
//         const formattedValue = objectToJsString(value, indent + indentation);
//         return `${indent}${key}: ${formattedValue}`;
//     });
//     return `{\n${entries.join(",\n")},\n${indent.slice(indentationSize)}}`;
// }

// const indentation = "    ";
// const indentationSize = indentation.length;

/**
 * Get the string representation of a connection point type
 * @param type - The connection point type
 * @returns - The string representation of the connection point type
 */
function getConnectionPointTypeString(type: ConnectionPointType): string {
    switch (type) {
        case ConnectionPointType.Float:
            return "Float";
        case ConnectionPointType.Texture:
            return "Texture";
        case ConnectionPointType.Color3:
            return "Color3";
        case ConnectionPointType.Color4:
            return "Color4";
        case ConnectionPointType.Vector2:
            return "Vector2";
        case ConnectionPointType.Boolean:
            return "Boolean";
    }
}

/**
 * Get the effect setter for a connection point type
 * @param type - The connection point type
 * @returns - The effect setter for the connection point type
 */
function getEffectSetter(type: ConnectionPointType): string {
    switch (type) {
        case ConnectionPointType.Float:
            return "setFloat";
        case ConnectionPointType.Texture:
            return "setTexture";
        case ConnectionPointType.Color3:
            return "setColor3";
        case ConnectionPointType.Color4:
            return "setDirectColor4";
        case ConnectionPointType.Vector2:
            return "setVector2";
        case ConnectionPointType.Boolean:
            return "setBool";
    }
}
