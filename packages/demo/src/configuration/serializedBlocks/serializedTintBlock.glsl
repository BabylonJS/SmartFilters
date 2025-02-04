/*
{
    "smartFilterBlockType": "SerializedTintBlock"
}
*/

uniform sampler2D input; // main 
uniform vec3 tint; // default: { "r": 1, "g": 0, "b": 0 }
uniform float amount; // default: 0.25

vec4 mainImage(vec2 vUV) { // main
    vec4 color = texture2D(input, vUV);
    vec3 tinted = mix(color.rgb, tint, amount);
    return vec4(tinted, color.a);
}