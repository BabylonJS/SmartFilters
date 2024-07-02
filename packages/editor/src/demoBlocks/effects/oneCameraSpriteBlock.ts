import type { Effect } from "@babylonjs/core/Materials/effect";
import type { ThinTexture } from "@babylonjs/core/Materials/Textures/thinTexture";
import { Vector2 } from "@babylonjs/core/Maths/math.vector.js";

import type { SmartFilter, StrongRef, IDisableableBlock } from "@babylonjs/smart-filters";
import {
    ShaderBlock,
    ConnectionPointType,
    ShaderBinding,
    injectDisableUniform,
    createStrongRef,
} from "@babylonjs/smart-filters";

const shaderProgram = injectDisableUniform({
    fragment: {
        uniform: `
            uniform sampler2D _background_;
            uniform sampler2D _spriteAtlas_;
            uniform float _opacity_;
            uniform vec2 _spriteScale_;
            uniform vec2 _spriteTranslation_;
            `,

        mainFunctionName: "_oneCameraSprite_",

        mainInputTexture: "_background_",

        functions: [
            {
                name: "_oneCameraSprite_",
                code: `
                vec4 _oneCameraSprite_(vec2 vUV) {
                    vec4 result = texture2D(_background_, vUV);
                    
                    vec2 spriteUV = vUV * _spriteScale_ + _spriteTranslation_;
                    vec4 sprite = texture2D(_spriteAtlas_, spriteUV);

                    return vec4(_blendScreen_(result.rgb, sprite.rgb, _opacity_), 1.0);
                }
            `,
            },
            {
                name: "_blendScreen_",
                code: `
                float _blendScreen_(float base, float blend) {
                    return 1.0-((1.0-base)*(1.0-blend));
                }             
                `,
            },
            {
                name: "_blendScreen_",
                code: `
                vec3 _blendScreen_(vec3 base, vec3 blend) {
                    return vec3(_blendScreen_(base.r,blend.r),_blendScreen_(base.g,blend.g),_blendScreen_(base.b,blend.b));
                }
                                    `,
            },
            {
                name: "_blendScreen_",
                code: `
                vec3 _blendScreen_(vec3 base, vec3 blend, float opacity) {
                    return (_blendScreen_(base, blend) * opacity + base * (1.0 - opacity));
                }                
                `,
            },
        ],
    },
});

/**
 * The shader bindings for the Composition block.
 */
export class OneCameraSpriteShaderBinding extends ShaderBinding {
    private readonly _backgroundTexture: StrongRef<ThinTexture>;
    private readonly _spriteAtlasTexture: StrongRef<ThinTexture>;
    private readonly _spriteIndex: StrongRef<number>;
    private readonly _opacity: StrongRef<number>;
    private readonly _spriteScale: Vector2;
    private readonly _rows: number;
    private readonly _columns: number;
    private readonly _spriteTranslation = new Vector2(0, 0);

    /**
     * Creates a new shader binding instance for the Composition block.
     * @param parentBlock - The parent block
     * @param backgroundTexture - the background texture
     * @param spriteAtlasTexture - the sprite atlas texture
     * @param spriteIndex - the sprite index
     * @param opacity - the opacity of the sprite
     * @param rows - the number of rows in the sprite atlas
     * @param columns - the number of columns in the sprite atlas
     */
    constructor(
        parentBlock: IDisableableBlock,
        backgroundTexture: StrongRef<ThinTexture>,
        spriteAtlasTexture: StrongRef<ThinTexture>,
        spriteIndex: StrongRef<number>,
        opacity: StrongRef<number>,
        rows: number,
        columns: number
    ) {
        super(parentBlock);
        this._backgroundTexture = backgroundTexture;
        this._spriteAtlasTexture = spriteAtlasTexture;
        this._spriteIndex = spriteIndex;
        this._opacity = opacity;
        this._rows = rows;
        this._columns = columns;

        this._spriteScale = new Vector2(1 / columns, 1 / rows);
    }

    /**
     * Binds all the required data to the shader when rendering.
     * @param effect - defines the effect to bind the data to
     * @param width - defines the width of the output
     * @param height - defines the height of the output
     */
    public override bind(effect: Effect, width: number, height: number): void {
        super.bind(effect, width, height);

        // const fgSize = spriteAtlas.getSize();

        this._spriteTranslation.x = (this._spriteIndex.value % this._columns) * this._spriteScale.x;
        this._spriteTranslation.y =
            1.0 - this._spriteScale.y * (1 + Math.floor(this._spriteIndex.value / this._columns));

        console.log(this._spriteIndex.value, this._rows, this._columns);

        effect.setTexture(this.getRemappedName("background"), this._backgroundTexture.value);
        effect.setTexture(this.getRemappedName("spriteAtlas"), this._spriteAtlasTexture.value);
        effect.setFloat(this.getRemappedName("opacity"), this._opacity.value);
        effect.setFloat2(this.getRemappedName("spriteScale"), this._spriteScale.x, this._spriteScale.y);
        effect.setFloat2(
            this.getRemappedName("spriteTranslation"),
            this._spriteTranslation.x,
            this._spriteTranslation.y
        );
    }
}

/**
 * A block to handle sprites for OneCamera.
 */
export class OneCameraSpriteBlock extends ShaderBlock {
    private readonly _rows: number;
    private readonly _columns: number;

    /**
     * The class name of the block.
     */
    public static override ClassName = "OneCameraSpriteBlock";

    /**
     * The background texture to composite on to.
     */
    public readonly background = this._registerInput("background", ConnectionPointType.Texture);

    /**
     * The sprite atlas texture.
     */
    public readonly spriteAtlas = this._registerInput("foreground", ConnectionPointType.Texture);

    /**
     * Defines which sprite index to use.
     */
    public readonly spriteIndex = this._registerInput("foregroundTop", ConnectionPointType.Float);

    /**
     * Opacity of the sprite.
     */
    public readonly opacity = this._registerOptionalInput("opacity", ConnectionPointType.Float, createStrongRef(1.0));

    /**
     * The shader program (vertex and fragment code) to use to render the block
     */
    public static override ShaderCode = shaderProgram;

    /**
     * Instantiates a new Block.
     * @param smartFilter - The video filter this block belongs to
     * @param name - The friendly name of the block
     * @param rows - The number of rows in the sprite atlas
     * @param columns - The number of columns in the sprite atlas
     */
    constructor(smartFilter: SmartFilter, name: string, rows: number, columns: number) {
        super(smartFilter, name);
        this._rows = rows;
        this._columns = columns;
    }

    /**
     * Get the class instance that binds all the required data to the shader (effect) when rendering.
     * @returns The class instance that binds the data to the effect
     */
    public getShaderBinding(): ShaderBinding {
        const background = this._confirmRuntimeDataSupplied(this.background);
        const spriteAtlas = this._confirmRuntimeDataSupplied(this.spriteAtlas);
        const spriteIndex = this._confirmRuntimeDataSupplied(this.spriteIndex);

        return new OneCameraSpriteShaderBinding(
            this,
            background,
            spriteAtlas,
            spriteIndex,
            this.opacity.runtimeData,
            this._rows,
            this._columns
        );
    }
}
