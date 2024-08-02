import type { ShaderProgram } from "../utils/shaderCodeUtils";
export const shaderProgram: ShaderProgram = {
    vertex: undefined,
    fragment: {
        uniform: `
uniform sampler2D _input_;
uniform float _foo_;`,
        mainFunctionName: `main`,
        functions: [
            
        ],
    },
};
