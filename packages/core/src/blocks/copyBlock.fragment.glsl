uniform sampler2D input; // main

vec4 copy(vec2 vUV) { // main
    return texture2D(input, vUV);
}