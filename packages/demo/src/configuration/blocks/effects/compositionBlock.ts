import type { Effect } from "@babylonjs/core/Materials/effect";

import type { SmartFilter, IDisableableBlock, RuntimeData } from "@babylonjs/smart-filters";
import {
    ShaderBlock,
    ConnectionPointType,
    ShaderBinding,
    injectDisableUniform,
    createStrongRef,
} from "@babylonjs/smart-filters";
import { BlockNames } from "../blockNames";

/** Defines that alpha blending is disabled */
export const ALPHA_DISABLE = 0;
/** Defines that alpha blending is SRC ALPHA * SRC + DEST */
export const ALPHA_ADD = 1;
/** Defines that alpha blending is SRC ALPHA * SRC + (1 - SRC ALPHA) * DEST */
export const ALPHA_COMBINE = 2;
/** Defines that alpha blending is DEST - SRC * DEST */
export const ALPHA_SUBTRACT = 3;
/** Defines that alpha blending is SRC * DEST */
export const ALPHA_MULTIPLY = 4;

const shaderProgram = injectDisableUniform({
    fragment: {
        uniform: `
            uniform sampler2D _background_;
            uniform sampler2D _foreground_;
            
            uniform vec2 _scaleUV_;
            uniform vec2 _translateUV_;
            uniform int _alphaMode_;
            uniform float _foregroundAlphaScale_;
            `,

        mainFunctionName: "_composition_",

        mainInputTexture: "_foreground_",

        functions: [
            {
                name: "_composition_",
                code: `
                vec4 _composition_(vec2 vUV) {
                    vec4 result = texture2D(_background_, vUV);

                    vec2 transformedUV = vUV * (1.0 / _scaleUV_) + _translateUV_;
                    if (transformedUV.x < 0.0 || transformedUV.x > 1.0 || transformedUV.y < 0.0 || transformedUV.y > 1.0) {
                        return result;
                    }
                
                    vec4 foreground = texture2D(_foreground_, transformedUV);
                    foreground.a *= _foregroundAlphaScale_;
                
                    if (_alphaMode_ == 0) {
                        result = foreground;
                    }
                    else if (_alphaMode_ == 1) {
                        result = result.a * result;
                        result += foreground;
                    }
                    else if (_alphaMode_ == 2) {
                        result = mix(result, foreground, foreground.a);
                    }
                    else if (_alphaMode_ == 3) {
                        float srcAlpha = result.a;
                        result = srcAlpha * result - (1. - srcAlpha) * foreground;
                    }
                    else if (_alphaMode_ == 4) {
                        result *= foreground;
                    }
                
                    return result;
                }
            `,
            },
        ],
    },
});

/**
 * The shader bindings for the Composition block.
 */
export class CompositionShaderBinding extends ShaderBinding {
    private readonly _backgroundTexture: RuntimeData<ConnectionPointType.Texture>;
    private readonly _foregroundTexture: RuntimeData<ConnectionPointType.Texture>;
    private readonly _foregroundTop: RuntimeData<ConnectionPointType.Float>;
    private readonly _foregroundLeft: RuntimeData<ConnectionPointType.Float>;
    private readonly _foregroundWidth: RuntimeData<ConnectionPointType.Float>;
    private readonly _foregroundHeight: RuntimeData<ConnectionPointType.Float>;
    private readonly _foregroundAlphaScale: RuntimeData<ConnectionPointType.Float>;
    private readonly _alphaMode: number;

    /**
     * Creates a new shader binding instance for the Composition block.
     * @param parentBlock - The parent block
     * @param backgroundTexture - the background texture
     * @param foregroundTexture - the foreground texture
     * @param foregroundTop - the top position of the foreground texture
     * @param foregroundLeft - the left position of the foreground texture
     * @param foregroundWidth - the width of the foreground texture
     * @param foregroundHeight - the height of the foreground texture
     * @param foregroundAlphaScale - the alpha scale of the foreground texture
     * @param alphaMode - the alpha mode to use
     */
    constructor(
        parentBlock: IDisableableBlock,
        backgroundTexture: RuntimeData<ConnectionPointType.Texture>,
        foregroundTexture: RuntimeData<ConnectionPointType.Texture>,
        foregroundTop: RuntimeData<ConnectionPointType.Float>,
        foregroundLeft: RuntimeData<ConnectionPointType.Float>,
        foregroundWidth: RuntimeData<ConnectionPointType.Float>,
        foregroundHeight: RuntimeData<ConnectionPointType.Float>,
        foregroundAlphaScale: RuntimeData<ConnectionPointType.Float>,
        alphaMode: number
    ) {
        super(parentBlock);
        this._backgroundTexture = backgroundTexture;
        this._foregroundTexture = foregroundTexture;
        this._foregroundTop = foregroundTop;
        this._foregroundLeft = foregroundLeft;
        this._foregroundWidth = foregroundWidth;
        this._foregroundHeight = foregroundHeight;
        this._foregroundAlphaScale = foregroundAlphaScale;
        this._alphaMode = alphaMode;
    }

    /**
     * Binds all the required data to the shader when rendering.
     * @param effect - defines the effect to bind the data to
     * @param width - defines the width of the output
     * @param height - defines the height of the output
     */
    public override bind(effect: Effect, width: number, height: number): void {
        super.bind(effect, width, height);

        const background = this._backgroundTexture.value;
        const foreground = this._foregroundTexture.value;
        const foregroundTop = this._foregroundTop.value;
        const foregroundLeft = this._foregroundLeft.value;
        const foregroundWidth = this._foregroundWidth.value;
        const foregroundHeight = this._foregroundHeight.value;
        const foregroundAlphaScale = this._foregroundAlphaScale.value;
        const alphaMode = this._alphaMode;

        effect.setInt(this.getRemappedName("alphaMode"), alphaMode);
        effect.setTexture(this.getRemappedName("background"), background);
        effect.setTexture(this.getRemappedName("foreground"), foreground);

        if (foreground) {
            effect.setFloat2(this.getRemappedName("scaleUV"), foregroundWidth, foregroundHeight);
            effect.setFloat2(this.getRemappedName("translateUV"), -1 * foregroundLeft, foregroundTop);
            effect.setFloat(this.getRemappedName("foregroundAlphaScale"), foregroundAlphaScale);
        }
    }
}

/**
 * A simple compositing Block letting the filter "blend" 2 different layers.
 *
 * The alpha mode of the block can be set to one of the following:
 * - ALPHA_DISABLE: alpha blending is disabled
 * - ALPHA_ADD: alpha blending is SRC ALPHA * SRC + DEST
 * - ALPHA_COMBINE: alpha blending is SRC ALPHA * SRC + (1 - SRC ALPHA) * DEST
 * - ALPHA_SUBTRACT: alpha blending is DEST - SRC * DEST
 * - ALPHA_MULTIPLY: alpha blending is SRC * DEST
 */
export class CompositionBlock extends ShaderBlock {
    /**
     * The class name of the block.
     */
    public static override ClassName = BlockNames.composition;

    /**
     * The background texture to composite on to.
     */
    public readonly background = this._registerInput("background", ConnectionPointType.Texture);

    /**
     * The foreground texture to composite in.
     */
    public readonly foreground = this._registerOptionalInput(
        "foreground",
        ConnectionPointType.Texture,
        createStrongRef(null)
    );

    /**
     * Defines where the top of the texture to composite in should be displayed. (between 0 and 1).
     */
    public readonly foregroundTop = this._registerOptionalInput(
        "foregroundTop",
        ConnectionPointType.Float,
        createStrongRef(0.0)
    );

    /**
     * Defines where the left of the texture to composite in should be displayed. (between 0 and 1).
     */
    public readonly foregroundLeft = this._registerOptionalInput(
        "foregroundLeft",
        ConnectionPointType.Float,
        createStrongRef(0.0)
    );

    /**
     * Defines the width of the texture in the composition.
     */
    public readonly foregroundWidth = this._registerOptionalInput(
        "foregroundWidth",
        ConnectionPointType.Float,
        createStrongRef(1.0)
    );

    /**
     * Defines the height of the texture in the composition.
     */
    public readonly foregroundHeight = this._registerOptionalInput(
        "foregroundHeight",
        ConnectionPointType.Float,
        createStrongRef(1.0)
    );

    /**
     * Defines a multiplier applied to the foreground's alpha channel.
     */
    public readonly foregroundAlphaScale = this._registerOptionalInput(
        "foregroundAlphaScale",
        ConnectionPointType.Float,
        createStrongRef(1.0)
    );

    /**
     * Defines blend mode of the composition.
     */
    public alphaMode: number = ALPHA_COMBINE;

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
    public getShaderBinding(): ShaderBinding {
        const background = this._confirmRuntimeDataSupplied(this.background);
        const foreground = this._confirmRuntimeDataSupplied(this.foreground);
        const foregroundWidth = this.foregroundWidth.runtimeData;
        const foregroundLeft = this.foregroundLeft.runtimeData;
        const foregroundHeight = this.foregroundHeight.runtimeData;
        const foregroundTop = this.foregroundTop.runtimeData;
        const foregroundAlphaScale = this.foregroundAlphaScale.runtimeData;
        const alphaMode = this.alphaMode;

        return new CompositionShaderBinding(
            this,
            background,
            foreground,
            foregroundTop,
            foregroundLeft,
            foregroundWidth,
            foregroundHeight,
            foregroundAlphaScale,
            alphaMode
        );
    }
}
