import type { Effect } from "@babylonjs/core/Materials/effect";

import { type RuntimeData } from "../../connection/connectionPoint.js";
import { ConnectionPointType } from "../../connection/connectionPointType.js";
import { type IDisableableBlock, DisableableShaderBlock } from "../../blockFoundation/disableableShaderBlock.js";
import { DisableableShaderBinding } from "../../runtime/shaderRuntime.js";
import type { ShaderProgram } from "../../utils/shaderCodeUtils.js";
import type { SmartFilter } from "../../smartFilter.js";

import { BlockNames } from "../blockNames.js";
import { babylonDemoTransitions } from "../blockNamespaces.js";

//TODO: delete http://localhost:8080/#IC0BS7

const shaderProgram: ShaderProgram = {
    fragment: {
        const: `
            const float HALF_PI = 1.57079632679;
            const float LARGE = 10000.0;
            `,
        uniform: `
            uniform sampler2D _textureA_;
            uniform sampler2D _textureB_;
            uniform float _mix_;
            uniform float _angle_;
            `,

        mainFunctionName: "_wipe_",

        mainInputTexture: "_textureB_",

        functions: [
            {
                name: "_wipe_",
                code: `
                vec4 _wipe_(vec2 vUV)
                {
                    float radians = radians(_angle_);
                    vec4 colorA = texture2D(_textureA_, vUV);
                    vec4 colorB = texture2D(_textureB_, vUV);

                    // float isAboveLine = step(1.0 - _mix_, vUV.y);// step(vUV.x * tan(radians), vUV.y);

                    float tanAngle = tan(radians);
                    float yAtMiddle = 0.5 * tanAngle;
                    float yIntercept = 0.5 - yAtMiddle;
                    float isAboveLine = step(vUV.x * tan(radians), vUV.y);
                    float lineY = (vUV.x * tanAngle) + yIntercept;

                    float blendDistance = 0.01;
                    float distanceFromLine = clamp((vUV.y - lineY) * acos(radians), -1.0 * blendDistance, 1.0) +blendDistance;
                   
                    float mixA = clamp(blendDistance - distanceFromLine, 0.0, blendDistance) / blendDistance;
                    return mix(colorA, colorB, mixA);
                    //return vec4(abs(mix)); 

                    // float blendAmount = 0.01;
                    // float mixA = clamp(0.5 - (blendAmount - distanceFromLine), 0.0, 0.5) + 0.5; // clamp(distanceFromLine, 0.0, 1.0);
                    // return vec4(abs(mixA));

                    // return mix(colorA, colorB, mixA);

                    //return mix(colorA, colorB, isAboveLine);
                    //return vec4(vUV.x * tan(radians));
                


                    // float a = acos(cos(_angle_)); // Bring angle into range of 0-pi for ease
                    // float isHalfPi = step(abs(a - HALF_PI), 0.0);
                    // float isGreaterThanHalfPi = 1. - step(a, HALF_PI);
                    // float isLessThanHalfPi = 1. - step(HALF_PI, a);

                    // // Build a line equation, D = Ax + By + C
                    // // There are 3 possible line equations based on the angle of the wipe
                    // float m = tan(a); // Convert angle into line slope
                    // float A = mix(-m, -LARGE, isHalfPi);
                    // float C = isLessThanHalfPi * -(1. - _mix_ - (_mix_ * m));
                    // C += isGreaterThanHalfPi * -(_mix_ - (_mix_ * m));
                    // C += isHalfPi * (LARGE * _mix_);
                    
                    // // Solve for D using UV coordinates
                    // float D = A * vUV.x + vUV.y + C;
                    
                    // // The color above the line is flipped if the angle is greater than 90 degrees
                    // vec4 colorAbove = mix(colorB, colorA, isGreaterThanHalfPi);
                    // vec4 colorBelow = mix(colorA, colorB, isGreaterThanHalfPi);

                    // // If D>0, our coord is above the line
                    // return mix(colorBelow, colorAbove, step(0.0, D));
                }
            `,
            },
        ],
    },
};

/**
 * The shader bindings for the Wipe block.
 */
export class WipeShaderBinding extends DisableableShaderBinding {
    private readonly _textureA: RuntimeData<ConnectionPointType.Texture>;
    private readonly _textureB: RuntimeData<ConnectionPointType.Texture>;
    private readonly _mix: RuntimeData<ConnectionPointType.Float>;
    private readonly _angle: RuntimeData<ConnectionPointType.Float>;

    /**
     * Creates a new shader binding instance for the Wipe block.
     * @param parentBlock - The parent block
     * @param textureA - The first texture
     * @param textureB - The second texture
     * @param mix - The mix value between the two textures
     * @param angle - The angle of the wipe
     */
    constructor(
        parentBlock: IDisableableBlock,
        textureA: RuntimeData<ConnectionPointType.Texture>,
        textureB: RuntimeData<ConnectionPointType.Texture>,
        mix: RuntimeData<ConnectionPointType.Float>,
        angle: RuntimeData<ConnectionPointType.Float>
    ) {
        super(parentBlock);
        this._textureA = textureA;
        this._textureB = textureB;
        this._mix = mix;
        this._angle = angle;
    }

    /**
     * Binds all the required data to the shader when rendering.
     * @param effect - defines the effect to bind the data to
     */
    public override bind(effect: Effect): void {
        super.bind(effect);
        effect.setTexture(this.getRemappedName("textureA"), this._textureA.value);
        effect.setTexture(this.getRemappedName("textureB"), this._textureB.value);
        effect.setFloat(this.getRemappedName("mix"), this._mix.value);
        effect.setFloat(this.getRemappedName("angle"), this._angle.value);
    }
}

/**
 * A block simulating a wipe effect to transition between two textures according to the mix value.
 */
export class WipeBlock extends DisableableShaderBlock {
    /**
     * The class name of the block.
     */
    public static override ClassName = BlockNames.wipe;

    /**
     * The namespace of the block.
     */
    public static override Namespace = babylonDemoTransitions;

    /**
     * The first texture connection point.
     */
    public readonly textureA = this._registerInput("textureA", ConnectionPointType.Texture);

    /**
     * The second texture connection point.
     */
    public readonly textureB = this._registerInput("textureB", ConnectionPointType.Texture);

    /**
     * The connection point containing the transition value between 0 (textureA) and 1 (textureB).
     */
    public readonly mix = this._registerInput("mix", ConnectionPointType.Float);

    /**
     * The connection point containing the angle of the wipe (in degrees).
     */
    public readonly angle = this._registerInput("angle", ConnectionPointType.Float);

    /**
     * The shader program (vertex and fragment code) to use to render the block
     */
    public static override ShaderCode = shaderProgram;

    /**
     * Instantiates a new Block.
     * @param smartFilter - The smart filter this block belongs to
     * @param name - The friendly name of the block
     */
    constructor(smartFilter: SmartFilter, name: string) {
        super(smartFilter, name);
    }

    /**
     * Get the class instance that binds all the required data to the shader (effect) when rendering.
     * @returns The class instance that binds the data to the effect
     */
    public getShaderBinding(): DisableableShaderBinding {
        const textureA = this._confirmRuntimeDataSupplied(this.textureA);
        const textureB = this._confirmRuntimeDataSupplied(this.textureB);
        const mix = this._confirmRuntimeDataSupplied(this.mix);
        const angle = this._confirmRuntimeDataSupplied(this.angle);

        return new WipeShaderBinding(this, textureA, textureB, mix, angle);
    }
}
