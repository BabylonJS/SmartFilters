import type { Effect } from "@babylonjs/core/Materials/effect";

import type { SmartFilter, IDisableableBlock, RuntimeData, ShaderProgram } from "@babylonjs/smart-filters";
import { ConnectionPointType, DisableableShaderBlock, DisableableShaderBinding } from "@babylonjs/smart-filters";
import { BlockNames } from "../blockNames.js";
import { babylonDemoEffectsNamespace } from "../blockNamespaces.js";

const shaderProgram: ShaderProgram = {
    fragment: {
        uniform: `
            uniform sampler2D _background_;
            uniform sampler2D _frame_;
            uniform sampler2D _foreground_;
            uniform sampler2D _overlay_;
            `,

        mainFunctionName: "_frameBlock_",

        mainInputTexture: "_foreground_",

        functions: [
            {
                name: "_frameBlock_",
                code: `
                vec4 _frameBlock_(vec2 vUV)
                {
                    vec4 background = texture2D(_background_, vUV);
                    vec4 frame = texture2D(_frame_, vUV);
                    vec4 foreground = texture2D(_foreground_, vUV);
                    vec4 overlay = texture2D(_overlay_, vUV);
                
                    vec3 finalColor = background.rgb * (1.0 - frame.a);
                
                    if (frame.rgb == vec3(1., 0., 1.)) {
                        finalColor = foreground.rgb * frame.a;
                    }
                    else {
                        finalColor += frame.rgb * frame.a;
                    }
                
                    finalColor = finalColor * (1.0 - overlay.a) + overlay.rgb * overlay.a;
                
                    return vec4(finalColor, 1.);
                }
            `,
            },
        ],
    },
};

/**
 * The shader bindings for the Frame block.
 */
export class FrameShaderBinding extends DisableableShaderBinding {
    private readonly _backgroundTexture: RuntimeData<ConnectionPointType.Texture>;
    private readonly _frameTexture: RuntimeData<ConnectionPointType.Texture>;
    private readonly _foregroundTexture: RuntimeData<ConnectionPointType.Texture>;
    private readonly _overlayTexture: RuntimeData<ConnectionPointType.Texture>;

    /**
     * Creates a new shader binding instance for the Frame block.
     * @param parentBlock - The parent block
     * @param backgroundTexture - the background texture
     * @param frameTexture - the frame texture
     * @param foregroundTexture - the foreground texture
     * @param overlayTexture - the overlay texture
     */
    constructor(
        parentBlock: IDisableableBlock,
        backgroundTexture: RuntimeData<ConnectionPointType.Texture>,
        frameTexture: RuntimeData<ConnectionPointType.Texture>,
        foregroundTexture: RuntimeData<ConnectionPointType.Texture>,
        overlayTexture: RuntimeData<ConnectionPointType.Texture>
    ) {
        super(parentBlock);
        this._backgroundTexture = backgroundTexture;
        this._frameTexture = frameTexture;
        this._foregroundTexture = foregroundTexture;
        this._overlayTexture = overlayTexture;
    }

    /**
     * Binds all the required data to the shader when rendering.
     * @param effect - defines the effect to bind the data to
     */
    public override bind(effect: Effect): void {
        super.bind(effect);
        effect.setTexture(this.getRemappedName("background"), this._backgroundTexture.value);
        effect.setTexture(this.getRemappedName("frame"), this._frameTexture.value);
        effect.setTexture(this.getRemappedName("foreground"), this._foregroundTexture.value);
        effect.setTexture(this.getRemappedName("overlay"), this._overlayTexture.value);
    }
}

/**
 * A block performing a the incrustation of two textures around a frame.
 *
 * The frame texture is used to define the incrustation area where alpha 0 is replaced by the background
 * and magenta by the foreground.
 *
 * It also supports an overlay texture that is applied on top of the result.
 */
export class FrameBlock extends DisableableShaderBlock {
    /**
     * The class name of the block.
     */
    public static override ClassName = BlockNames.frame;

    /**
     * The namespace of the block.
     */
    public static override Namespace = babylonDemoEffectsNamespace;

    /**
     * The background texture connection point.
     */
    public readonly background = this._registerInput("background", ConnectionPointType.Texture);

    /**
     * The frame texture connection point. (alpha 0 is replaced by the background and magenta by the foreground)
     */
    public readonly frame = this._registerInput("frame", ConnectionPointType.Texture);

    /**
     * The foreground texture connection point.
     */
    public readonly foreground = this._registerInput("foreground", ConnectionPointType.Texture);

    /**
     * The overlay texture connection point. Extra layer blended on top of the entire frame
     */
    public readonly overlay = this._registerInput("overlay", ConnectionPointType.Texture);

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
        const background = this._confirmRuntimeDataSupplied(this.background);
        const frame = this._confirmRuntimeDataSupplied(this.frame);
        const foreground = this._confirmRuntimeDataSupplied(this.foreground);
        const overlay = this._confirmRuntimeDataSupplied(this.overlay);

        return new FrameShaderBinding(this, background, frame, foreground, overlay);
    }
}
