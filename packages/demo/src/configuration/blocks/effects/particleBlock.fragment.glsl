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
    float translationY = 1. - delta; // Move particle upwards over time

    vec2 particleUV = vUV * (1. / size) + vec2(oscillationX, translationY);

    // Check for out of bounds
    if (clamp(particleUV, 0.0, 1.0) != particleUV) {
        return backgroundColor;
    }

    vec4 particleColor = texture2D(particle, particleUV);

    return mix(backgroundColor, particleColor, particleColor.a);
}