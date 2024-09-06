// Source: https://www.shadertoy.com/view/4dBGRw
// Author: Qqwy - 2013
// License Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported License.
// Modified from original
// For demo and non-commerical use only

uniform sampler2D input; // main
uniform float time;
uniform vec2 resolution;

const float eps = 0.1;
const mat2 rr = mat2(cos(1.0), -sin(1.0), sin(1.0), cos(1.0));

//Creates a diagonal red-and-white striped pattern.
vec3 barberpole(vec2 pos, vec2 rocketpos) {
	float d = (pos.x-rocketpos.x)+(pos.y-rocketpos.y);
	vec3 col=vec3(1.0);	

	d = mod(d*20.,2.0);
	if(d>1.0){
		col=vec3(1.0,0.0,0.0);
	}

	return col;	
}


vec3 rocket(vec2 pos, vec2 rocketpos){
	vec3 col = vec3(0.0);
	float f = 0.;
	float absx= abs(rocketpos.x - pos.x);
	float absy = abs(rocketpos.y-pos.y);
	//wooden stick
	if(absx<0.01&&absy<0.22){
		col=vec3(1.0,0.5,0.5);	
	}
	
	//Barberpole
	
	if(absx<0.05&&absy<0.15){
		col=barberpole(pos, rocketpos);	
	}
	//Rocket Point
	float pointw=(rocketpos.y-pos.y-0.25)*-0.7;
	if((rocketpos.y-pos.y)>0.1){
		f=smoothstep(pointw-0.001,pointw+0.001,absx);
		
		col=mix(vec3(1.0,0.0,0.0),col, f);	
	}
	//Shadow
	
	f =-.5 + smoothstep(-0.05, 0.05, (rocketpos.x-pos.x));
	col*= 0.7+f;
	
	return col;
}



float rand(float val, float seed){
	return cos(val*sin(val*seed)*seed);	
}

float distance2( in vec2 a, in vec2 b ) { return dot(a-b,a-b); }

vec3 drawParticles(vec2 pos, vec3 particolor, float time, vec2 cpos, float gravity, float seed, float timelength){
    vec3 col= vec3(0.0);
    vec2 pp = vec2(1.0,0.0);
    for(float i=1.0;i<=128.0;i++){
        float d=rand(i, seed);
        float fade=(i/128.0)*time;
        vec2 particpos = cpos + time*pp*d;
        pp = rr*pp;
        col = mix(particolor/fade, col, smoothstep(0.0, 0.0001, distance2(particpos, pos)));
    }
    col*=smoothstep(0.0,1.0,(timelength-time)/timelength);
	
    return col;
}

vec4 drawFireworks(float time, vec2 uv, vec3 particolor, float seed){
	
	float timeoffset = 2.0;
	vec3 col=vec3(0.0);
	if(time<=0.){
		return vec4(col, 0.0);	
	}
	if(mod(time, 6.0)>timeoffset){
	    col= drawParticles(uv, particolor, mod(time, 6.0)-timeoffset, vec2(rand(ceil(time/6.0),seed),-0.5), 0.5, ceil(time/6.0), seed);
	}else{
		
		col= rocket(uv*3., vec2(3.*rand(ceil(time/6.0),seed),3.*(-0.5+(timeoffset-mod(time, 6.0)))));	
	}

    if (col.x <= eps && col.y<= eps && col.z <= eps) {
        return vec4(0.0, 0.0, 0.0, 0.0);
    }

	return vec4(col, 1.0);	
}

vec4 mainImage (vec2 vUV) { // main
	vec4 col = texture(input, vUV);
	
	vUV = 1.0 -  2.0 * vUV;
	vUV.x *= resolution.x/resolution.y;
	
	col += drawFireworks(time    , vUV,vec3(1.0,0.1,0.1), 1.);
	col += drawFireworks(time-2.0, vUV,vec3(0.0,1.0,0.5), 2.);
	col += drawFireworks(time-4.0, vUV,vec3(1.0,1.0,0.1), 3.);
	
    return col;
}