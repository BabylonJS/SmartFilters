// Source: https://www.shadertoy.com/view/4ssGR8
// Author: gtoledo3 - 2013
// Modified from original
// This work is licensed under a Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported License.
// For demo and non-commerical use only

uniform sampler2D input; // main
uniform vec2 resolution;
uniform float threshold;

const float Soft = 0.001;

vec4 mainImage(vec2 vUV) { // main
	float f = Soft/2.0;
	float a = threshold - f;
	float b = threshold + f;
	
	vec4 tx = texture(input, vUV);
	float l = (tx.x + tx.y + tx.z) / 3.0;
	
	float v = smoothstep(a, b, l);
	
	return vec4(v);
}