// main
uniform sampler2D input;
uniform float foo;
const float contrastIntensity = 0.44;
// main
vec4 makeRed(vec2 vUV) {
    if (foo) {
        asdf;
    }
    return vec4(texture(input * intensity, vUV).r, 0., 0., alpha);
}
