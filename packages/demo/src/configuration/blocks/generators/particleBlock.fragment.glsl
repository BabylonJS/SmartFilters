uniform sampler2D input; // main
uniform sampler2D particle;
uniform float time;
uniform float delay;
uniform vec2 position;
uniform vec2 size;
uniform float amplitude;
uniform float frequency;

const float PI = 3.14159265;

vec4 mainImage(vec2 vUV) { // main
    vec4 backgroundColor = texture2D(input, vUV);

    float delta = time - delay;
    float oscillationX = position.x + amplitude * sin(frequency * (delta) * PI); 
    float translationY = position.y - delta; // Move particle upwards over time

    vUV = vUV * size + vec2(oscillationX, translationY); // Apply transformations

    // Check for out of bounds
    if (clamp(vUV, 0.0, 1.0) != vUV) {
        return backgroundColor;
    }

    vec4 particleColor = texture2D(particle, vUV);

    return mix(backgroundColor, particleColor, particleColor.a);
}