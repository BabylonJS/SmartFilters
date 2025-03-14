/*  
{ 
    "smartFilterBlockType": "PixelateBlock", 
    "namespace": "Babylon.Demo.Effects", 
    "blockDisableStrategy": "Manual"
}
*/

uniform sampler2D input; // main
// { "default": "0.3" }
uniform float intensity;
// { "default": false }
uniform bool disabled;

const float videoPixelatePower = 6.0;
const float videoPixelateMin = 10.0;
const float videoPixelateMax = 1920.0;
            
const float aspect = 1.72;

vec4 pixelate(vec2 vUV) { // main
    if (!disabled) {
        float pixelateStrength = mix(videoPixelateMin, videoPixelateMax, pow(1. - intensity, videoPixelatePower));
        vec2 pixelate = vec2(pixelateStrength * aspect, pixelateStrength);
        vUV = floor(pixelate * vUV) / pixelate;
    }
    return texture2D(input, vUV);
}
