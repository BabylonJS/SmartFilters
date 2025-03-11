import type { ShaderProgram } from "@babylonjs/smart-filters";

/**
 * The shader program for the block.
 */
export const shaderProgram: ShaderProgram = {
    vertex: `// { "smartFilterBlockType": "WipeBlock", "namespace": "Babylon.Demo.Transitions" }

uniform sampler2D textureA;
uniform sampler2D textureB; // main
uniform float progress;

vec4 wipe(vec2 vUV) { // main
    vec4 colorA = texture2D(textureA, vUV);
    vec4 colorB = texture2D(textureB, vUV);
    return mix(colorB, colorA, step(progress, vUV.y));
}
`,
    fragment: {
        uniform: `
            uniform sampler2D _textureA_;
            uniform sampler2D _textureB_; // main
            uniform float _progress_;`,
        mainInputTexture: "_textureB_",
        mainFunctionName: "_wipe_",
        functions: [
            {
                name: "_wipe_",
                code: `
                    vec4 _wipe_(vec2 vUV) { 
                        vec4 colorA = texture2D(_textureA_, vUV);
                        vec4 colorB = texture2D(_textureB_, vUV);
                        return mix(colorB, colorA, step(_progress_, vUV.y));
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
    textureA: "textureA",
    textureB: "textureB",
    progress: "progress",
};
