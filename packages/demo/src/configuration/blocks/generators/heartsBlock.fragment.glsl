uniform sampler2D input; // main
uniform float time;
uniform vec2 resolution;

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

vec3 hearts(vec2 polar, float time, float fft) {
    float l = clamp(polar.y, 0., 1.);
    float tiling = 1./3.14159 * 14.;
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
    float a = smoothstep(.0, .25, n.x*n.x);
    float heartGlow = smoothstep(0., -.05, heartDist) * .5 * a + smoothstep(0.3, -.4, heartDist) * .75;
    vec3 heartCol = vec3(smoothstep(0., -.05, heartDist), 0., 0.) * a + heartGlow * vec3(.9, .5, .7);
    vec3 bgCol = vec3(0.15 + l / 2., .0, 0.);
    return bgCol * (.5 + fft) + heartCol * step(0.45, noise(polarID + .4).x);
}

vec4 mainImage(vec2 vUV) { // main
    vec2 polar = vec2(atan(uv.y, uv.x), log(length(uv)));
    float speed = .666;
    float fft = texelFetch(iChannel0, ivec2(1., 0.), 0).x;
    vec3 h = max(max(hearts(polar, iTime * speed, fft), 
                     hearts(polar, iTime * speed * 0.3 + 3., fft)), 
                 hearts(polar, iTime * speed * .2 + 5., fft));
    fragColor = vec4(h, 1.);
}
