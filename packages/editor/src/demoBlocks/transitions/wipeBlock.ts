import type { Effect } from "@babylonjs/core/Materials/effect";
import type { ThinTexture } from "@babylonjs/core/Materials/Textures/thinTexture";

import type { SmartFilter, StrongRef, IDisableableBlock } from "@babylonjs/smart-filters";
import { ShaderBlock, ConnectionPointType, ShaderBinding, injectDisableUniform } from "@babylonjs/smart-filters";

const shaderProgram = injectDisableUniform({
    fragment: {
        uniform: `
            uniform sampler2D _textureA_;
            uniform sampler2D _textureB_;
            uniform float _mix_;
            uniform float _angle_;
            uniform float _size_;
            `,

        mainFunctionName: "_wipe_",

        mainInputTexture: "_textureB_",

        functions: [
            {
                name: "_wipe_",
                code: `
                vec4 _wipe_(vec2 vUV)
                {
                    vec4 colorA = texture2D(_textureA_, vUV);
                    vec4 colorB = texture2D(_textureB_, vUV);
                
                    // rotate around the center to get a remapped point
                    vec2 centerPos = vec2(0.5);
                    vec2 deltaP = vUV - centerPos;
                    vec2 rotatedP = vec2(
                        centerPos.x + deltaP.x * cos(_angle_) - deltaP.y * sin(_angle_),
                        centerPos.y + deltaP.x * sin(_angle_) + deltaP.y * cos(_angle_)
                    );
                
                    return mix(colorA, colorB, clamp((rotatedP.y - _mix_) / (_size_ + 0.001) + 0.5, 0., 1.));
                }
            `,
            },
        ],
    },
});

/**
 * The shader bindings for the Wipe block.
 */
export class WipeShaderBinding extends ShaderBinding {
    private readonly _textureA: StrongRef<ThinTexture>;
    private readonly _textureB: StrongRef<ThinTexture>;
    private readonly _mix: StrongRef<number>;
    private readonly _angle: number;
    private readonly _size: number;

    /**
     * Creates a new shader binding instance for the Wipe block.
     * @param parentBlock - The parent block
     * @param textureA - The first texture
     * @param textureB - The second texture
     * @param mix - The mix value between the two textures
     * @param angle - The angle of the wipe
     * @param size - The size of the wipe
     */
    constructor(
        parentBlock: IDisableableBlock,
        textureA: StrongRef<ThinTexture>,
        textureB: StrongRef<ThinTexture>,
        mix: StrongRef<number>,
        angle: number,
        size: number
    ) {
        super(parentBlock);
        this._textureA = textureA;
        this._textureB = textureB;
        this._mix = mix;
        this._angle = angle;
        this._size = size;
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
        effect.setFloat(this.getRemappedName("angle"), this._angle);
        effect.setFloat(this.getRemappedName("size"), this._size);
    }
}

/**
 * A block simulating a wipe effect to transition between two textures according to the mix value.
 */
export class WipeBlock extends ShaderBlock {
    /**
     * The class name of the block.
     */
    public static override ClassName = "WipeBlock";

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
     * Defines the angle of the wipe effect.
     */
    public angle = Math.PI;

    /**
     * Defines the size of the wipe effect.
     */
    public size = 10;

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
        const textureA = this._confirmRuntimeDataSupplied(this.textureA);
        const textureB = this._confirmRuntimeDataSupplied(this.textureB);
        const mix = this._confirmRuntimeDataSupplied(this.mix);

        return new WipeShaderBinding(this, textureA, textureB, mix, this.angle, this.size);
    }
}
