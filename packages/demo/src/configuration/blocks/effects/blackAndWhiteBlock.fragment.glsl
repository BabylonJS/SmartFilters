uniform sampler2D input; // main

vec4 blackAndWhite(vec2 vUV) { // main
    vec3 color = texture2D(input, vUV).rgb;

    float luminance = dot(color, vec3(0.3, 0.59, 0.11));
    vec3 bg = vec3(luminance, luminance, luminance);

    return vec4(bg, 1.0);
}
