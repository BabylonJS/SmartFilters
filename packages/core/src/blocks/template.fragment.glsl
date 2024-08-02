// Rules for Smart Filter compatible shaders:
// 1. There must be a sampler2D uniform designed as the main input texture (the one to be passed along)
//    if this block is disabled.  It must have a comment on its line like this // main
// 2. There must be a single main function which takes in a vec2 named vUV and returns a vec4, and 
//    it must have a comment on its line like this // main
// 3. Any uniforms which should have the same value across all instances of the same block should 
//    have a comment on its line like this // single
// 4. Functions must be declared with the open { on the same line as the function name

uniform sampler2D input; // main

uniform float intensity; // single

const float alpha = 0.9;

vec4 makeRed(vec2 vUV) { // main
    return vec4(texture(input * intensity, vUV).r, 0., 0., alpha);
}
