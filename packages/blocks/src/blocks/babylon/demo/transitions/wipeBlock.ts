// TODO: turn this into a template that convertShaderIntoCustomBlockFile.ts generates

import type { Effect } from "@babylonjs/core/Materials/effect";

import {
    ShaderBinding,
    type RuntimeData,
    ConnectionPointType,
    type SmartFilter,
    ShaderBlock,
    type ShaderProgram,
} from "@babylonjs/smart-filters";

/**
 * The shader program for the block.
 */
const shaderProgram: ShaderProgram = {
    vertex: undefined,
    fragment: {
        uniform: `
            uniform sampler2D _textureA_;
            uniform sampler2D _textureB_; // main
            uniform float _progress_;`,
        mainInputTexture: "_textureB_",
        mainFunctionName: "_wipe_",
        functions: [
            {
                name: "_wipe_",
                code: `
                    vec4 _wipe_(vec2 vUV) { 
                        vec4 colorA = texture2D(_textureA_, vUV);
                        vec4 colorB = texture2D(_textureB_, vUV);
                        return mix(colorB, colorA, step(_progress_, vUV.y));
                    }
                    
                    `,
            },
        ],
    },
};

/**
 * The uniform names for this shader, to be used in the shader binding so
 * that the names are always in sync.
 */
const uniforms = {
    textureA: "textureA",
    textureB: "textureB",
    progress: "progress",
};

/**
 * The shader binding for the block, used by the runtime
 */
class WipeShaderBinding extends ShaderBinding {
    private readonly _textureA: RuntimeData<ConnectionPointType.Texture>;
    private readonly _textureB: RuntimeData<ConnectionPointType.Texture>;
    private readonly _progress: RuntimeData<ConnectionPointType.Float>;

    /**
     * Creates a new shader binding instance for the block.
     * @param textureA - The textureA runtime value
     * @param textureB - The textureB runtime value
     * @param progress - The progress runtime value
     */
    constructor(
        textureA: RuntimeData<ConnectionPointType.Texture>,
        textureB: RuntimeData<ConnectionPointType.Texture>,
        progress: RuntimeData<ConnectionPointType.Float>
    ) {
        super();
        this._textureA = textureA;
        this._textureB = textureB;
        this._progress = progress;
    }

    /**
     * Binds all the required data to the shader when rendering.
     * @param effect - defines the effect to bind the data to
     */
    public override bind(effect: Effect): void {
        effect.setTexture(this.getRemappedName(uniforms.textureA), this._textureA.value);
        effect.setTexture(this.getRemappedName(uniforms.textureB), this._textureB.value);
        effect.setFloat(this.getRemappedName(uniforms.progress), this._progress.value);
    }
}

/**
 * The implementation of the WipeBlock
 */
export class WipeBlock extends ShaderBlock {
    /**
     * The class name of the block.
     */
    public static override ClassName = "WipeBlock";

    /**
     * The namespace of the block.
     */
    public static override Namespace = "Babylon.Demo.Transitions";

    /**
     * The textureA connection point.
     */
    public readonly textureA = this._registerInput(uniforms.textureA, ConnectionPointType.Texture);

    /**
     * The textureB connection point.
     */
    public readonly textureB = this._registerInput(uniforms.textureB, ConnectionPointType.Texture);

    /**
     * The progress connection point.
     */
    public readonly progress = this._registerInput(uniforms.progress, ConnectionPointType.Float);

    /**
     * The shader program (vertex and fragment code) to use to render the block
     */
    public static override ShaderCode = shaderProgram;

    /**
     * Instantiates a new WipeBlock.
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
        const textureA = this._confirmRuntimeDataSupplied(this.textureA);
        const textureB = this._confirmRuntimeDataSupplied(this.textureB);
        const progress = this._confirmRuntimeDataSupplied(this.progress);

        return new WipeShaderBinding(textureA, textureB, progress);
    }
}
