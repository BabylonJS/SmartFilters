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
            uniform vec2 _tileCount_;
        `,

        const: `
            const float _TILE_FADE_LENGTH_ = 0.5;
        `,

        mainFunctionName: "_tile_",

        mainInputTexture: "_textureB_",

        functions: [
            {
                name: "_tile_",
                code: `
                vec4 _tile_(vec2 vUV) {
                    vec2 tileIndex = floor(vUV * _tileCount_);
                    float tileOffset = _random_(tileIndex);
                
                    // With offset=0, mask should be 0 at time=0 and 1 at time=FADE_LENGTH
                    // With offset=1, mask should be 0 at time=(1-FADE_LENGTH) and 1 at time=1
                    float tileMask = clamp((_mix_ - tileOffset * (1. - _TILE_FADE_LENGTH_)) / _TILE_FADE_LENGTH_, 0., 1.);
                
                    vec4 colorA = texture2D(_textureA_, vUV);
                    vec4 colorB = texture2D(_textureB_, vUV);
                    return mix(colorA, colorB, tileMask);
                }
            `,
            },
            {
                name: "_random_",
                code: `
                float _random_(vec2 pos) {
                    return fract(sin(dot(pos.xy, vec2(12.9898, 78.233))) * 43758.5453123);
                }
            `,
            },
        ],
    },
});

/**
 * The shader bindings for the Tile block.
 */
export class TileShaderBinding extends ShaderBinding {
    private readonly _textureA: StrongRef<ThinTexture>;
    private readonly _textureB: StrongRef<ThinTexture>;
    private readonly _mix: StrongRef<number>;
    private readonly _tileCount: number;

    /**
     * Creates a new shader binding instance for the Tile block.
     * @param parentBlock - The parent block
     * @param textureA - the first texture to transition from
     * @param textureB - the second texture to transition to
     * @param mix - the transition value between 0 (textureA) and 1 (textureB)
     * @param tileCount - the number of tiles to use for the transition
     */
    constructor(
        parentBlock: IDisableableBlock,
        textureA: StrongRef<ThinTexture>,
        textureB: StrongRef<ThinTexture>,
        mix: StrongRef<number>,
        tileCount: number
    ) {
        super(parentBlock);
        this._textureA = textureA;
        this._textureB = textureB;
        this._mix = mix;
        this._tileCount = tileCount;
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
        effect.setFloat2(this.getRemappedName("tileCount"), this._tileCount, this._tileCount);
    }
}

/**
 * A block simulating a tile effect to transition between two textures according to the mix value.
 */
export class TileBlock extends ShaderBlock {
    /**
     * The class name of the block.
     */
    public static override ClassName = "TileBlock";

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
     * Defines the number of tiles to use for the transition.
     */
    public tileCount = 10;

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

        return new TileShaderBinding(this, textureA, textureB, mix, this.tileCount);
    }
}
