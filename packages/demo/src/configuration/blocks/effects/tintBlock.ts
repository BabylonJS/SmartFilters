import type { SerializedBlockDefinition } from "@babylonjs/smart-filters";

/**
 * This is included to show how a serialized block definition can be loaded and used.
 * This object could have been deserialized from a JSON file, for example.
 */
export const deserializedTintBlockDefinition: SerializedBlockDefinition = {
    version: 1,
    blockType: "TintBlock",
    shaderProgram: {
        fragment: {
            uniform: `
                uniform sampler2D _input_; // main 
                uniform vec3 _tint_;
                uniform float _amount_;
                `,
            mainInputTexture: "_input_",
            mainFunctionName: "_mainImage_",
            functions: [
                {
                    name: "_mainImage_",
                    code: `
                        vec4 _mainImage_(vec2 vUV) {
                            vec4 color = texture2D(_input_, vUV);
                            vec3 tinted = mix(color.rgb, _tint_, _amount_);
                            return vec4(tinted, color.a);
                        }`,
                },
            ],
        },
    },
    inputConnectionPoints: [],
    disableOptimization: false,
};
