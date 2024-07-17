import type { Effect } from "@babylonjs/core/Materials/effect";

import type { ShaderProgram } from "../utils/shaderCodeUtils";
import type { SmartFilter } from "../smartFilter";
import { ConnectionPointType } from "../connection/connectionPointType.js";
import { ShaderBlock } from "./shaderBlock.js";
import { ShaderBinding } from "../runtime/shaderRuntime.js";
import type { RuntimeData } from "../connection/connectionPoint";

const shaderProgram: ShaderProgram = {
    fragment: {
        uniform: `
            uniform sampler2D _input_;
        `,

        mainFunctionName: "_copy_",

        functions: [
            {
                name: "_copy_",
                code: `
                    vec4 _copy_(vec2 vUV) {
                        return texture2D(_input_, vUV);
                    }
                `,
            },
        ],
    },
};

/**
 * The shader bindings for the Copy block.
 */
export class CopyShaderBinding extends ShaderBinding {
    private readonly _inputTexture: RuntimeData<ConnectionPointType.Texture>;

    /**
     * Creates a new shader binding instance for the copy block.
     * @param parentBlock - The parent block
     * @param inputTexture - defines the input texture to copy
     */
    constructor(parentBlock: CopyBlock, inputTexture: RuntimeData<ConnectionPointType.Texture>) {
        super(parentBlock);
        this._inputTexture = inputTexture;
    }

    /**
     * Binds all the required data to the shader when rendering.
     * @param effect - defines the effect to bind the data to
     * @internal
     */
    public override bind(effect: Effect): void {
        effect.setTexture(this.getRemappedName("input"), this._inputTexture.value);
    }
}

/**
 * A block responsible for copying a texture to the output.
 *
 * This might be helpful to duplicate a texture if necessary.
 *
 * It simply takes a texture as input and outputs it to another texture or the main canvas.
 */
export class CopyBlock extends ShaderBlock {
    /**
     * The class name of the block.
     */
    public static override ClassName = "CopyBlock";

    /**
     * The input connection point of the block.
     */
    public readonly input = this._registerInput("input", ConnectionPointType.Texture);

    /**
     * The shader program (vertex and fragment code) to use to render the block
     */
    public static override ShaderCode = shaderProgram;

    /**
     * Create a new copy block.
     * @param smartFilter - The smart filter this block belongs to.
     * @param name -The friendly name of the block.
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

        return new CopyShaderBinding(this, input);
    }
}
