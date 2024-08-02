uniform sampler2D input; // main
uniform float amount;

vec4 copy(vec2 vUV) { // main
    return texture2D(input, vUV);
}

// [Smart Filter Shader Version] = 1
