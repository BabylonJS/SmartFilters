// Source: https://www.shadertoy.com/view/3ll3zr
// Author: dynamitedjs - 2019
// Modified from original
// This work is licensed under a Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported License.
// For demo and non-commerical use only

uniform sampler2D input; // main
uniform float time;
uniform float aspectRatio;
uniform vec3 tint;

const float eps = 0.001;
const float inversePi = 0.31830988618;

vec2 noise(vec2 p) {
    return fract(1234.1234 * sin(1234.1234 * (fract(1234.1234 * p) + p.yx)));
}

float heart(vec2 p, float s) {
    p /= s;
    vec2 q = p;
    q.x *= 0.5 + .5 * q.y;
    q.y -= abs(p.x) * .63;
    return (length(q) - .7) * s;
}

vec3 hearts(vec2 polar, float time) {
    float l = clamp(polar.y, 0., 1.);
    float tiling = inversePi * 14.;
    polar.y -= time;
    vec2 polarID = (floor(polar * tiling));
    
    polar.x = polar.x + polarID.y * .03;
    polar.x = mod(polar.x + 3.14159 * 2., 3.14159 * 2.);
    polarID = floor(polar * tiling);
    
    polar = fract(polar * tiling);
    
    polar = polar * 2. - 1.;
    vec2 n = noise(polarID + .1) * .75 + .25;
    vec2 n2 = 2. * noise(polarID) - 1.;
    vec2 offset = (1. - n.y) * n2;
    float heartDist = heart(polar + offset, n.y * .6);
    float a = smoothstep(.0, .1, n.x*n.x);
    float heartGlow = (smoothstep(0., -eps, heartDist) * .5 * a) + (smoothstep(0.0, -0.4, heartDist) * .75);
    vec3 finalColor = vec3(smoothstep(0., -.05, heartDist), 0., 0.) * a + heartGlow * tint;
    return finalColor * step(0.45, noise(polarID + .4).x); // Return finalColor or vec3(0.) if no heart
}

vec4 mainImage(vec2 vUV) { // main
    vec4 bgColor = texture2D(input, vUV);
    float dist = length(vUV - vec2(0.5));
    vUV = vUV * 2.0 - 1.0;
    vUV.x *= aspectRatio;
    vec2 polar = vec2(atan(vUV.y, vUV.x), log(length(vUV)));
    vec3 h = max(max(hearts(polar, time), 
                     hearts(polar, time * 0.3 + 3.)), 
                 hearts(polar, time * .2 + 5.)); // Combine three heart shapes
    float blend = step(eps, length(h)); // 1 if h is not vec3(0.), 0 otherwise
    vec4 finalColor = mix(bgColor, vec4(h, 1.), blend);
    finalColor.rgb = mix(finalColor.rgb, tint * 0.6, smoothstep(0.2, 0.8, dist)); // Add vignette
    return finalColor;
}
