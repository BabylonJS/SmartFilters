// [Smart Filter Shader Version] = 1
// [Block Type] = "TintBlock3"

uniform sampler2D _input_; // main 
uniform vec3 _tint_;
uniform float _amount_;

vec4 _mainImage_(vec2 vUV) { // main
    vec4 color = texture2D(_input_, vUV);
    vec3 tinted = mix(color.rgb, _tint_, _amount_);
    return vec4(tinted, color.a);
}