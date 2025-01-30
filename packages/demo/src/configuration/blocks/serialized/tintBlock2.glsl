import type { ShaderProgram } from "@babylonjs/smart-filters";

/**
 * The shader program for the block.
 */
export const shaderProgram: ShaderProgram = {
    vertex: `// SmartFilterGlslParserVersion: 1
// BlockType: Tint3

uniform sampler2D _input_; // main 
uniform vec3 _tint_;
uniform float _amount_;

vec4 _mainImage_(vec2 vUV) { // main
    vec4 color = texture2D(_input_, vUV);
    vec3 tinted = mix(color.rgb, _tint_, _amount_);
    return vec4(tinted, color.a);
}`,
    fragment: {
        uniform: `
            uniform sampler2D __input__; // main 
            uniform vec3 __tint__;
            uniform float __amount__;`,
        mainInputTexture: "__input__",
        mainFunctionName: "__mainImage__",
        functions: [
            {
                name: "__mainImage__",
                code: `
                    vec4 __mainImage__(vec2 vUV) { 
                        vec4 color = texture2D(__input__, vUV);
                        vec3 tinted = mix(color.rgb, __tint__, __amount__);
                        return vec4(tinted, color.a);
                    }
                    
                    `,
            },
        ],
    },
};

/**
 * The uniform names for this shader, to be used in the shader binding so
 * that the names are always in sync.
 */
export const uniforms = {
    _input_: "_input_",
    _tint_: "_tint_",
    _amount_: "_amount_",
};
