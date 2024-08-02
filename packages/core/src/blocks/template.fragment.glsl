// Rules for Smart Filter compatible shaders:
// 1. It must contain a // [Smart Filter Shader Version] = 1 comment (the version may be different)
// 2. There must be a sampler2D uniform designed as the main input texture (the one to be passed along)
//    if this block is disabled.  It must be preceeced by a line starting with // main
// 3. There must be a single main function which takes in a vec2 named vUV and returns a vec4, and 
//    it must be proceeded by a line starting with // main
// 4. Any uniforms which should have the same value across all instances of the same block should be 
//    proceeded by a line starting with // single

// main
uniform sampler2D input;
// single
uniform float intensity;
const float alpha = 0.9;

// main
vec4 makeRed(vec2 vUV) {
    return vec4(texture(input * intensity, vUV).r, 0., 0., alpha);
}
