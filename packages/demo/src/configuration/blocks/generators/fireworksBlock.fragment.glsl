// Source: https://www.shadertoy.com/view/Ws3SRS
// Author: piyushslayer - 2019
// License Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported License.
// Modified from original
// For demo and non-commerical use only

uniform sampler2D input; // main
uniform float time;
uniform float aspectRatio;
uniform float fireworks;
uniform float fireworkSparks;

const float PI = 3.141592653589793;
const float EXPLOSION_DURATION = 20.;
const float EXPLOSION_SPEED = 5.;
const float EXPLOSION_RADIUS_THESHOLD = .06;

// Hash function by Dave_Hoskins.
const vec3 MOD3 = vec3(.1031,.11369,.13787);
vec3 hash31(float p) {
   vec3 p3 = fract(vec3(p) * MOD3);
   p3 += dot(p3, p3.yzx + 19.19);
   return fract(vec3((p3.x + p3.y) * p3.z, (p3.x + p3.z) * p3.y, (p3.y + p3.z) * p3.x));
}

vec4 mainImage(vec2 vUV) { // main
    float t = mod(time + 10., 7200.);
	vec4 col = texture2D(input, vUV); 
    vec2 origin = vec2(0.);
	vUV.x *= aspectRatio;
    
    for (float j = 0.; j < fireworks; ++j)
    {
        vec3 oh = hash31((j + 800.) * 641.6974);
        origin = vec2(oh.x, oh.y) * .6 + .2; // .2 - .8 to avoid boundaries
        origin.x *= aspectRatio;
        // Change t value to randomize the spawning of explosions
        t += (j + 1.) * 9.6491 * oh.z;
        for (float i = 0.; i < fireworkSparks; ++i)
    	{
            vec3 h = hash31(j * 963.31 + i + 497.8943);
            // random angle (0 - 2*PI)
            float a = h.x * PI * 2.;
            // random radius scale for spawning points anywhere in a circle
            float rScale = h.y * EXPLOSION_RADIUS_THESHOLD;
            // explosion loop based on time
            if (mod(t * EXPLOSION_SPEED, EXPLOSION_DURATION) > 2.)
            {
                // random radius 
                float r = mod(t * EXPLOSION_SPEED, EXPLOSION_DURATION) * rScale;
                // explosion spark polar coords 
                vec2 sparkPos = vec2(r * cos(a), r * sin(a));
                // fake-ish gravity
                float foo = 0.04;
                float bar = (length(sparkPos) - (rScale - foo)) / foo;
                sparkPos.y -= pow(bar, 3.0) * 6e-5;
                // shiny spark particles
                float dist = length(vUV - sparkPos - origin);
                float spark = .00015 / pow(dist, 1.65);
                // Make the explosion spark shimmer/sparkle
                float sd = 2. * length(origin-sparkPos);
                float shimmer = max(0., sqrt(sd) * (sin((t + h.y * 2. * PI) * 20.)));
                float shimmerThreshold = EXPLOSION_DURATION * .32;
                // fade the particles towards the end of explosion
                float fade = max(0., (EXPLOSION_DURATION - 5.) * rScale - r);
                // mix it all together
                vec3 sparkColor = spark * mix(1., shimmer, smoothstep(shimmerThreshold * rScale,
					(shimmerThreshold + 1.) * rScale , r)) * fade * oh;
				col.rgb = 1.0 - (1.0 - col.rgb) * (1.0 - sparkColor); // Screen blending for better result
            }
    	}
    }
    return col;
} 