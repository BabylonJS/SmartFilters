//TODO: Move this into a string and use it in an example filter, with an explanation that it could have been loaded from an storage.
// { "smartFilterBlockType": "SerializedTintBlock" }

uniform sampler2D input; // main
// { "default": { "r": 1, "g": 0, "b": 0 } }
uniform vec3 tint;
// { "default": 0.25 }
uniform float amount;

vec4 mainImage(vec2 vUV) { // main
    vec4 color = texture2D(input, vUV);
    vec3 tinted = mix(color.rgb, tint, amount);
    return vec4(tinted, color.a);
}