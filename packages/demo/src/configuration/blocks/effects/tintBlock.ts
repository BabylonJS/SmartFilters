import type { Effect } from "@babylonjs/core/Materials/effect";

import type { SmartFilter, IDisableableBlock, RuntimeData } from "@babylonjs/smart-filters";
import { ShaderBlock, ConnectionPointType, ShaderBinding, createStrongRef } from "@babylonjs/smart-filters";
import { BlockNames } from "../blockNames";
import { shaderProgram, uniforms } from "./tintBlock.shader";

export class TintShaderBinding extends ShaderBinding {
    private readonly _inputTexture: RuntimeData<ConnectionPointType.Texture>;
    private readonly _intensity: RuntimeData<ConnectionPointType.Float>;
    private readonly _tintColor: RuntimeData<ConnectionPointType.Color3>;

    /**
     * Creates a new shader binding instance for the Tint block.
     * @param parentBlock - The parent block
     * @param inputTexture - The input texture
     * @param intensity - The intensity of the effect
     * @param tintColor - The color to tint with
     */
    constructor(
        parentBlock: IDisableableBlock,
        inputTexture: RuntimeData<ConnectionPointType.Texture>,
        intensity: RuntimeData<ConnectionPointType.Float>,
        tintColor: RuntimeData<ConnectionPointType.Color3>
    ) {
        super(parentBlock);
        this._inputTexture = inputTexture;
        this._intensity = intensity;
        this._tintColor = tintColor;
    }


    public override bind(effect: Effect): void {
        super.bind(effect);
        effect.setTexture(this.getRemappedName(uniforms.input), this._inputTexture.value);
        effect.setFloat(this.getRemappedName(uniforms.intensity), this._intensity.value);
        effect.setColor3(this.getRemappedName(uniforms.tintColor), this._tintColor.value);
    }
}

export class TintBlock extends ShaderBlock {
    public static override ClassName = BlockNames.tint;

    public readonly input = this._registerInput("input", ConnectionPointType.Texture);
    public readonly intensity = this._registerOptionalInput(
        "intensity",
        ConnectionPointType.Float,
        createStrongRef(0.3)
    );
    public readonly tintColor = this._registerOptionalInput(
        "tintColor",
        ConnectionPointType.Color3,
        createStrongRef({r:1, g:0, b:0}), //red by default
    );

    public static override ShaderCode = shaderProgram;

    constructor(smartFilter: SmartFilter, name: string) {
        super(smartFilter, name);
    }

    public getShaderBinding(): ShaderBinding {
        const input = this._confirmRuntimeDataSupplied(this.input);
        const intensity = this.intensity.runtimeData;
        const tintColor = this.tintColor.runtimeData;

        return new TintShaderBinding(this, input, intensity, tintColor);
    }
}