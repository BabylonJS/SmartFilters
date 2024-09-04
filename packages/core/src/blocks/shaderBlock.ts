import type { ThinRenderTargetTexture } from "@babylonjs/core/Materials/Textures/thinRenderTargetTexture";
import "@babylonjs/core/Engines/Extensions/engine.renderTarget.js";

import type { InitializationData, SmartFilter } from "../smartFilter";
import type { ShaderProgram } from "../utils/shaderCodeUtils";
import type { Binding } from "../runtime/shaderRuntime";
import type { ConnectionPoint } from "../connection/connectionPoint";
import { ShaderRuntime } from "../runtime/shaderRuntime.js";
import { ConnectionPointType } from "../connection/connectionPointType.js";
import { createCommand } from "../command/command.js";
import { DisableableBlock } from "./disableableBlock.js";
import { undecorateSymbol } from "../utils/shaderCodeUtils.js";
import { getRenderTarget, registerFinalRenderCommand } from "../utils/renderTargetUtils.js";

/**
 * This is the base class for all shader blocks.
 *
 * It contains the redundant part of wrapping a shader for a full screen pass.
 *
 * The only required function to implement is the bind function.
 */
export abstract class ShaderBlock extends DisableableBlock {
    /**
     * The class name of the block.
     */
    public static override ClassName = "ShaderBlock";

    /**
     * Get the class instance that binds all the required data to the shader (effect) when rendering.
     * It should throw an error if required inputs are missing.
     * @returns The class instance that binds the data to the effect
     */
    public abstract getShaderBinding(): Binding;

    /**
     * The shader program (vertex and fragment code) to use to render the block
     */
    public static ShaderCode: ShaderProgram;

    /**
     * The output connection point of the block.
     */
    public readonly output = this._registerOutput("output", ConnectionPointType.Texture);

    protected _textureRatio: number = 1;

    /**
     * Gets the texture ratio of the output texture.
     */
    public get textureRatio() {
        return this._textureRatio;
    }

    /**
     * Sets the texture ratio of the output texture.
     */
    public set textureRatio(value: number) {
        this._textureRatio = value;
    }

    /**
     * Disconnects the block from the graph.
     * @param disconnectedConnections - Stores the connections that have been broken in the process. You can reconnect them later if needed.
     */
    public override disconnectFromGraph(disconnectedConnections?: [ConnectionPoint, ConnectionPoint][]): void {
        const input = this._getConnectionForMainInputTexture();

        for (const endpoint of this.output.endpoints) {
            disconnectedConnections?.push([endpoint, this.output]);
            input.connectTo(endpoint);
        }
    }

    protected _getConnectionForMainInputTexture(): ConnectionPoint {
        const mainInputTextureName = this.getShaderProgram().fragment.mainInputTexture;
        if (!mainInputTextureName) {
            throw `The block named "${this.name}" does not have a main input texture defined!`;
        }

        const mainInputTexture = this.findInput(undecorateSymbol(mainInputTextureName));
        if (!mainInputTexture || !mainInputTexture.connectedTo) {
            throw `The main input texture "${mainInputTextureName}" of block named "${this.name}" is not connected!`;
        }

        return mainInputTexture.connectedTo;
    }

    /**
     * Instantiates a new block.
     * @param smartFilter - Defines the smart filter the block belongs to
     * @param name - Defines the name of the block
     * @param disableOptimization - Defines if the block should not be optimized (default: false)
     */
    constructor(smartFilter: SmartFilter, name: string, disableOptimization = false) {
        super(smartFilter, name, disableOptimization);
    }

    /**
     * Gets the shader program to use to render the block.
     * @returns The shader program to use to render the block
     */
    public getShaderProgram() {
        return (this.constructor as typeof ShaderBlock).ShaderCode;
    }

    /**
     * Generates the commands needed to execute the block at runtime and gathers promises for initialization work
     * @param initializationData - The initialization data to use
     * @param finalOutput - Defines if the block is the final output of the smart filter
     */
    public override generateCommandsAndGatherInitPromises(
        initializationData: InitializationData,
        finalOutput: boolean
    ): void {
        const runtime = initializationData.runtime;
        const shaderBlockRuntime = new ShaderRuntime(
            runtime.effectRenderer,
            this.getShaderProgram(),
            this.getShaderBinding()
        );
        initializationData.initializationPromises.push(shaderBlockRuntime.onReadyAsync);
        runtime.registerResource(shaderBlockRuntime);

        if (finalOutput) {
            registerFinalRenderCommand(
                initializationData.outputBlock.renderTargetTexture,
                runtime,
                this,
                shaderBlockRuntime
            );
        } else {
            const renderTarget = getRenderTarget(
                this.output.runtimeData?.value as ThinRenderTargetTexture,
                this.getClassName()
            );

            runtime.registerCommand(
                createCommand(`${this.getClassName()}.render`, this, () => {
                    shaderBlockRuntime.renderToTexture(renderTarget);
                })
            );
        }

        super.generateCommandsAndGatherInitPromises(initializationData, finalOutput);
    }
}
