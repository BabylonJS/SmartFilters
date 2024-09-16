uniform sampler2D particle; // main
uniform float time;
uniform float delay;
uniform vec2 size;
uniform float amplitude;
uniform float frequency;

const float PI = 3.14159265;

vec4 mainImage(vec2 vUV) { // main
    vec4 backgroundColor = vec4(0., 0., 0., 0.);

    float delta = time - delay;
    float oscillationX = amplitude * sin(frequency * (delta) * PI); 
    float translationY = -delta; // Move particle upwards over time

    vec2 invertedSize = 1. / size;
    vUV = ((vUV - 0.5) * invertedSize) + 0.5; // Scale UV from center to avoid clipping on edges when oscillating

    vUV = vUV + vec2(oscillationX, translationY); // Apply transformations

    // Check for out of bounds
    if (clamp(vUV, 0.0, 1.0) != vUV) {
        return backgroundColor;
    }

    vec4 particleColor = texture2D(particle, vUV);

    return mix(backgroundColor, particleColor, particleColor.a);
}