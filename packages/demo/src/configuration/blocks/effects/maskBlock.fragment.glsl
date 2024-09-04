uniform sampler2D input; // main
uniform sampler2D maskTexture;

vec4 maskBlock(vec2 vUV) { // main
    vec3 color = texture2D(input, vUV).rgb;
    vec3 maskColor = texture2D(maskTexture, vUV).rgb;
    float luminance = dot(maskColor, vec3(0.3, 0.59, 0.11));

    return vec4(color * luminance, luminance);
}
