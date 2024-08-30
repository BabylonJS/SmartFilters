// Source: https://www.shadertoy.com/view/XtVGD1
// created by florian berger (flockaroo) - 2016
// Modified from original
// License Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported License.
// For demo and non-commerical use only

// trying to resemle some hand drawing style

uniform sampler2D input; // main
uniform vec2 resolution;

const int AngleNum = 3;
const int SampNum = 16;
const float PI2 = 6.28318530717959;
const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);

vec3 mod289(vec3 x) {
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec2 mod289(vec2 x) {
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec3 permute(vec3 x) {
  return mod289(((x*34.0)+1.0)*x);
}

// Simplex noise from https://github.com/ashima/webgl-noise/blob/master/src/noise2D.glsl
float snoise(vec2 v) {
  // First corner
  vec2 i  = floor(v + dot(v, C.yy) );
  vec2 x0 = v -   i + dot(i, C.xx);

  // Other corners
  vec2 i1;
  //i1.x = step( x0.y, x0.x ); // x0.x > x0.y ? 1.0 : 0.0
  //i1.y = 1.0 - i1.x;
  i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  // x0 = x0 - 0.0 + 0.0 * C.xx ;
  // x1 = x0 - i1 + 1.0 * C.xx ;
  // x2 = x0 - 1.0 + 2.0 * C.xx ;
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;

  // Permutations
  i = mod289(i); // Avoid truncation effects in permutation
  vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
    + i.x + vec3(0.0, i1.x, 1.0 ));

  vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
  m = m*m ;
  m = m*m ;

  // Gradients: 41 points uniformly over a line, mapped onto a diamond.
  // The ring size 17*17 = 289 is close to a multiple of 41 (41*7 = 287)

  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;

  // Normalise gradients implicitly by scaling m
  // Approximation of: m *= inversesqrt( a0*a0 + h*h );
  m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );

  // Compute final noise value at P
  vec3 g;
  g.x  = a0.x  * x0.x  + h.x  * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

vec4 getCol(vec2 pos) {
    // take aspect ratio into account
    vec2 uv=((pos-resolution.xy*.5)/resolution.y*resolution.y)/resolution.xy+.5;
    vec4 c1=texture(input,uv);
    vec4 e=smoothstep(vec4(-0.05),vec4(-0.0),vec4(uv,vec2(1)-uv));
    c1=mix(vec4(1,1,1,0),c1,e.x*e.y*e.z*e.w);
    float d=clamp(dot(c1.xyz,vec3(-.5,1.,-.5)),0.0,1.0);
    vec4 c2=vec4(.7);
    return min(mix(c1,c2,1.8*d),.7);
}

vec4 getColHT(vec2 pos) {
 	return smoothstep(.95,1.05,getCol(pos)*.8+.2+snoise(pos*.7));
}

float getVal(vec2 pos) {
    vec4 c=getCol(pos);
 	return pow(dot(c.xyz,vec3(.333)),1.)*1.;
}

vec2 getGrad(vec2 pos, float eps) {
   	vec2 d=vec2(eps,0);
    return vec2(
        getVal(pos+d.xy)-getVal(pos-d.xy),
        getVal(pos+d.yx)-getVal(pos-d.yx)
    )/eps/2.;
}

vec4 mainImage(vec2 vUV) { // main
    vec2 fragCoord = vUV * resolution;
    vec4 fragColor = vec4(0);

    vec2 pos = fragCoord+4.0*sin(vec2(1,1.7))*resolution.y/400.;
    vec3 col = vec3(0);
    vec3 col2 = vec3(0);
    float sum=0.;
    for(int i=0;i<AngleNum;i++)
    {
        float ang=PI2/float(AngleNum)*(float(i)+.8);
        vec2 v=vec2(cos(ang),sin(ang));
        for(int j=0;j<SampNum;j++)
        {
            vec2 dpos  = v.yx*vec2(1,-1)*float(j)*resolution.y/400.;
            vec2 dpos2 = v.xy*float(j*j)/float(SampNum)*.5*resolution.y/400.;
	        vec2 g;
            float fact;
            float fact2;

            for(float s=-1.;s<=1.;s+=2.)
            {
                vec2 pos2=pos+s*dpos+dpos2;
                vec2 pos3=pos+(s*dpos+dpos2).yx*vec2(1,-1)*2.;
            	g=getGrad(pos2,.4);
            	fact=dot(g,v)-.5*abs(dot(g,v.yx*vec2(1,-1)))/**(1.-getVal(pos2))*/;
            	fact2=dot(normalize(g+vec2(.0001)),v.yx*vec2(1,-1));
                
                fact=clamp(fact,0.,.05);
                fact2=abs(fact2);
                
                fact*=1.-float(j)/float(SampNum);
            	col += fact;
            	col2 += fact2*getColHT(pos3).xyz;
            	sum+=fact2;
            }
        }
    }
    col/=float(SampNum*AngleNum)*.75/sqrt(resolution.y);
    col2/=sum;
    col.x*=(.6+.8*snoise(pos*.7));
    col.x=1.-col.x;
    col.x*=col.x*col.x;

    float r=length(pos-resolution.xy*.5)/resolution.x;
    float vign=1.-r*r*r;
	fragColor = vec4(vec3(col.x*col2*vign),1);

    return fragColor;
}
