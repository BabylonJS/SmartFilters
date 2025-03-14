/*  
{ 
    "smartFilterBlockType": "KaleidoscopeBlock", 
    "namespace": "Babylon.Demo.Effects", 
    "blockDisableStrategy": "AutoSample"
}
*/

uniform sampler2D input;
uniform float time;

const float width = 200.;
const float height = 300.;
const vec2 imageRatio =  vec2(700. / width, 1024. / height);
const vec2 imageRelativeSize = 1. / imageRatio;
const float halfDiag = sqrt(imageRelativeSize.x * imageRelativeSize.x + imageRelativeSize.y * imageRelativeSize.y) * 0.5;

const float radius = 0.9;
const float radius2 = 0.4;

const float segments = 6.;
const float segmentArc = (2. * 3.1415926535897932384626433832795 / segments);

vec4 kaleidoscope(vec2 vUV) { // main
    if (disabled) return texture2D(input, vUV);
    
    float distanceToCircle = abs(length(vUV) - radius);
    vec4 result = vec4(0., 0., 0., 0.);

    if (distanceToCircle < halfDiag * 10000.) {
        float pointTheta = atan(vUV.y, vUV.x);
        pointTheta += time;
        for (float i = -1.; i < 2.; i += 1.) {
            float chunk = floor(pointTheta / segmentArc) + i;
            float chunkStart = -time + chunk * segmentArc + segmentArc * 0.5;
            vec2 chunkStartCenter = vec2(cos(chunkStart), sin(chunkStart)) * radius;
            vec2 chunkStartPoint = vUV - chunkStartCenter;
            chunkStartPoint *= imageRatio;
            chunkStartPoint *= vec2(0.5, 0.5);
            chunkStartPoint += vec2(0.5, 0.5);

            if (chunkStartPoint.x > 0. && chunkStartPoint.x < 1. && chunkStartPoint.y > 0. && chunkStartPoint.y < 1.) {
                result = texture2D(input, chunkStartPoint);
            }
        }

        for (float i = -1.; i < 2.; i += 1.) {
            float chunk = floor(pointTheta / segmentArc) + i;
            float chunkStart = -time + chunk * segmentArc + segmentArc * 0.5;
            vec2 chunkStartCenter = vec2(cos(chunkStart), sin(chunkStart)) * radius2;
            vec2 chunkStartPoint = vUV - chunkStartCenter;
            chunkStartPoint *= imageRatio;
            chunkStartPoint *= vec2(0.5, 0.5);
            chunkStartPoint += vec2(0.5, 0.5);

            if (chunkStartPoint.x > 0. && chunkStartPoint.x < 1. && chunkStartPoint.y > 0. && chunkStartPoint.y < 1.) {
                vec4 top = texture2D(input, chunkStartPoint);
                result = mix(result, top, (result.a <= 0.) ? 1. : top.a);
            }
        }
    }

    return result;
}
