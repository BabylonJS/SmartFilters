import type { Effect } from "@babylonjs/core/Materials/effect";
import type { ThinTexture } from "@babylonjs/core/Materials/Textures/thinTexture";

import type { SmartFilter, StrongRef, IDisableableBlock } from "@babylonjs/smart-filters";
import { ShaderBlock, ConnectionPointType, ShaderBinding, injectDisableUniform } from "@babylonjs/smart-filters";

const shaderProgram = injectDisableUniform({
    vertex: `
        // Attributes
        attribute vec2 position;
        
        // Output
        varying vec2 vUV;
        
        void main(void) {
            vUV = position;
            gl_Position = vec4(position, 0.0, 1.0);
        }
    `,

    fragment: {
        uniform: `
            uniform sampler2D _input_;
            uniform float _time_;
            `,

        const: `
            const float _width_ = 200.;
            const float _height_ = 300.;
            const vec2 _imageRatio_ =  vec2(700. / _width_, 1024. / _height_);
            const vec2 _imageRelativeSize_ = 1. / _imageRatio_;
            const float _halfDiag_ = sqrt(_imageRelativeSize_.x * _imageRelativeSize_.x + _imageRelativeSize_.y * _imageRelativeSize_.y) * 0.5;
            
            const float _radius_ = 0.9;
            const float _radius2_ = 0.4;
            
            const float _segments_ = 6.;
            const float _segmentArc_ = (2. * 3.1415926535897932384626433832795 / _segments_);
            `,

        mainFunctionName: "_kaleidoscope_",

        mainInputTexture: "_input_",

        functions: [
            {
                name: "_kaleidoscope_",
                code: `
                vec4 _kaleidoscope_(vec2 vUV) {
                    float distanceToCircle = abs(length(vUV) - _radius_);
                    vec4 result = vec4(0., 0., 0., 1.);
                
                    if (distanceToCircle < _halfDiag_ * 10000.) {
                        float pointTheta = atan(vUV.y, vUV.x);
                        pointTheta += _time_;
                        for (float i = -1.; i < 2.; i += 1.) {
                            float chunck = floor(pointTheta / _segmentArc_) + i;
                            float chunckStart = -_time_ + chunck * _segmentArc_ + _segmentArc_ * 0.5;
                            vec2 chunckStartCenter = vec2(cos(chunckStart), sin(chunckStart)) * _radius_;
                            vec2 chunckStartPoint = vUV - chunckStartCenter;
                            chunckStartPoint *= _imageRatio_;
                            chunckStartPoint *= vec2(0.5, 0.5);
                            chunckStartPoint += vec2(0.5, 0.5);
                
                            if (chunckStartPoint.x > 0. && chunckStartPoint.x < 1. && chunckStartPoint.y > 0. && chunckStartPoint.y < 1.) {
                                result = texture2D(_input_, chunckStartPoint);
                            }
                        }
                
                        for (float i = -1.; i < 2.; i += 1.) {
                            float chunck = floor(pointTheta / _segmentArc_) + i;
                            float chunckStart = -_time_ + chunck * _segmentArc_ + _segmentArc_ * 0.5;
                            vec2 chunckStartCenter = vec2(cos(chunckStart), sin(chunckStart)) * _radius2_;
                            vec2 chunckStartPoint = vUV - chunckStartCenter;
                            chunckStartPoint *= _imageRatio_;
                            chunckStartPoint *= vec2(0.5, 0.5);
                            chunckStartPoint += vec2(0.5, 0.5);
                
                            if (chunckStartPoint.x > 0. && chunckStartPoint.x < 1. && chunckStartPoint.y > 0. && chunckStartPoint.y < 1.) {
                                result = texture2D(_input_, chunckStartPoint);
                            }
                        }
                    }
                
                    return result;
                }
            `,
            },
        ],
    },
});

/**
 * The shader bindings for the Kaleidoscope block.
 */
export class KaleidoscopeShaderBinding extends ShaderBinding {
    private readonly _inputTexture: StrongRef<ThinTexture>;
    private readonly _time: StrongRef<number>;

    /**
     * Creates a new shader binding instance for the Kaleidoscope block.
     * @param parentBlock - The parent block
     * @param inputTexture - the input texture
     * @param time - the time
     */
    constructor(parentBlock: IDisableableBlock, inputTexture: StrongRef<ThinTexture>, time: StrongRef<number>) {
        super(parentBlock);
        this._inputTexture = inputTexture;
        this._time = time;
    }

    /**
     * Binds all the required data to the shader when rendering.
     * @param effect - defines the effect to bind the data to
     */
    public override bind(effect: Effect): void {
        super.bind(effect);
        effect.setTexture(this.getRemappedName("input"), this._inputTexture.value);
        effect.setFloat(this.getRemappedName("time"), this._time.value);
    }
}

/**
 * A block performing a Kaleidoscope looking like effect.
 */
export class KaleidoscopeBlock extends ShaderBlock {
    /**
     * The class name of the block.
     */
    public static override ClassName = "KaleidoscopeBlock";

    /**
     * The input texture connection point.
     */
    public readonly input = this._registerInput("input", ConnectionPointType.Texture);

    /**
     * The time connection point.
     */
    public readonly time = this._registerInput("time", ConnectionPointType.Float);

    /**
     * The shader program (vertex and fragment code) to use to render the block
     */
    public static override ShaderCode = shaderProgram;

    /**
     * Instantiates a new Block.
     * @param smartFilter - The video filter this block belongs to
     * @param name - The friendly name of the block
     */
    constructor(smartFilter: SmartFilter, name: string) {
        super(smartFilter, name);
    }

    /**
     * Get the class instance that binds all the required data to the shader (effect) when rendering.
     * @returns The class instance that binds the data to the effect
     */
    public getShaderBinding(): ShaderBinding {
        const input = this._confirmRuntimeDataSupplied(this.input);
        const time = this._confirmRuntimeDataSupplied(this.time);

        return new KaleidoscopeShaderBinding(this, input, time);
    }
}
