// Source: https://www.shadertoy.com/view/4st3WX
// Author: s23b - 2016
// Modified from original
// This work is licensed under a Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported License.

uniform sampler2D input; // main
uniform float time;
uniform vec2 resolution;

vec4 tunnel(vec2 vUV) { // main 
    // Center the effect
    vUV = vUV / 0.5 - 1.;

    // Adjust aspect ratio
    vUV.x *= resolution.x / resolution.y;

    // make a tube
    float f = 1.0 / length(vUV);
    
    // add the angle
    f += atan(vUV.x, vUV.y) / acos(0.);
    
    // let's roll
    f -= time;
    
    // make it black and white
    // old version without AA: 
    // f = floor(fract(f) * 2.);
    // new version based on Shane's suggestion:	
    f = 1. - clamp(sin(f * 3.14159265359 * 2.) * dot(vUV, vUV) * resolution.y / 15. + .5, 0., 1.);

    // add the darkness to the end of the tunnel
    f *= sin(length(vUV) - .1);
	
    return vec4(f, f, f, 1.0);
}