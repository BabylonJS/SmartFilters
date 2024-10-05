import type { SmartFilter } from "../smartFilter.js";
import type { ConnectionPoint } from "../connection/connectionPoint.js";

import { ConnectionPointType } from "../connection/connectionPointType.js";
import { createStrongRef } from "../runtime/strongRef.js";
import { ShaderBlock } from "./shaderBlock.js";
import { injectAutoDisable, injectDisableUniform } from "../utils/shaderCodeUtils.js";

/**
 * The interface that describes the disableable block.
 */
export interface IDisableableBlock {
    /**
     * The disabled connection point of the block.
     */
    disabled: ConnectionPoint<ConnectionPointType.Boolean>;
}

/**
 * The strategy to use for making a block disableable.
 */
export enum DisableStrategy {
    /**
     * The shader code is responsible for consulting the uniform bound to the disabled connection point
     * and no-oping (returning texture2D(input, vUV)) if the value is true.
     */
    Manual = 0,

    /**
     * The Smart Filter system will automatically code to sample the texture and the color immediately if disabled,
     * and use it within the shader code otherwise. If you need to modify UVs before sampling the default input texture,
     * you'll need to set this to "manual" and handle the disabling yourself in the shader code.
     */
    AutoSample = 1,
}

/**
 * A ShaderBlock that can be disabled. The optimizer can optionally remove disabled blocks from the graph,
 * or they can be controlled by the disabled connection point at runtime. If disabled, they pass the
 * mainInputTexture through to the output connection point.
 */
export abstract class DisableableShaderBlock extends ShaderBlock implements IDisableableBlock {
    private static _HasModifiedShaderCode = false;
    /**
     * The disabled connection point of the block.
     */
    public readonly disabled = this._registerOptionalInput(
        "disabled",
        ConnectionPointType.Boolean,
        createStrongRef(false)
    );

    /**
     * The strategy to use for making this block disableable.
     */
    public readonly disableStrategy: DisableStrategy;

    private get _hasModifiedShaderCode() {
        return (this.constructor as typeof DisableableShaderBlock)._HasModifiedShaderCode;
    }

    private set _hasModifiedShaderCode(value: boolean) {
        (this.constructor as typeof DisableableShaderBlock)._HasModifiedShaderCode = value;
    }

    /**
     * Instantiates a new block.
     * @param smartFilter - Defines the smart filter the block belongs to
     * @param name - Defines the name of the block
     * @param optimizable - Defines if the block should be processed by the optimizer (default: true)
     * @param disableStrategy - Defines the strategy to use for making this block disableable (default: DisableStrategy.AutoSample)
     */
    constructor(
        smartFilter: SmartFilter,
        name: string,
        optimizable = true,
        disableStrategy = DisableStrategy.AutoSample
    ) {
        super(smartFilter, name, optimizable);
        this.disableStrategy = disableStrategy;

        // If we haven't already modified the shader code for this block type, do so now
        if (!this._hasModifiedShaderCode) {
            this._hasModifiedShaderCode = true;

            // Apply the disable strategy
            const shaderProgram = this.getShaderProgram();
            switch (this.disableStrategy) {
                case DisableStrategy.AutoSample:
                    injectAutoDisable(shaderProgram);
                    break;
                case DisableStrategy.Manual:
                    injectDisableUniform(shaderProgram.fragment);
                    break;
            }
        }
    }
}