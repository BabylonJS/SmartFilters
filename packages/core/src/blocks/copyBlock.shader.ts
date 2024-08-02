import type { ShaderProgram } from "../utils/shaderCodeUtils";

/**
 * The shader program for the block.
 */
export const shaderProgram: ShaderProgram = {
    vertex: undefined,
    fragment: {
        uniform: `
            uniform sampler2D _input_; // main
            uniform float _amount_;`,
        mainInputTexture: "_input_",
        mainFunctionName: "_copy_",
        functions: [
            {
                name: "_copy_",
                code: `
                    vec4 _copy_(vec2 vUV) { // main
                        return texture2D(input, vUV);
                    }
                    
                    `,
            },
        ],
    },
};
