uniform sampler2D input; // main
uniform float intensity;
uniform vec3 tintColor;

vec4 tint(vec2 vUV) { // main
    
    vec4 input = texture2D(_input_, vUV);
    vec3 tintedRGB = vec3(0,1,0); //mix(input.rgb, tintColor, intensity);
    return vec4(tintedRGB, input.a);
}