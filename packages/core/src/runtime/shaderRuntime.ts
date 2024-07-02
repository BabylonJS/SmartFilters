import type { EffectRenderer } from "@babylonjs/core/Materials/effectRenderer";
import type { RenderTargetWrapper } from "@babylonjs/core/Engines/renderTargetWrapper";
import type { AbstractEngine } from "@babylonjs/core/Engines/abstractEngine";
import type { Effect } from "@babylonjs/core/Materials/effect";
import { EffectWrapper } from "@babylonjs/core/Materials/effectRenderer.js";

import type { IDisposable } from "../IDisposable";
import type { ShaderProgram } from "../utils/shaderCodeUtils";
import { createStrongRef, type StrongRef } from "./strongRef.js";
import type { IDisableableBlock } from "../blocks/disableableBlock";
import { decorateSymbol, getShaderCreateOptions } from "../utils/shaderCodeUtils.js";

/**
 * The shader bindings for a ShaderBlock that can't be disabled.
 */
export abstract class Binding {
    /**
     * Binds all the required data to the shader when rendering.
     * @param effect - defines the effect to bind the data to
     * @param width - defines the width of the output
     * @param height - defines the height of the output
     */
    public abstract bind(effect: Effect, width?: number, height?: number): void;

    private _remappedShaderVariables: { [key: string]: string } = {};

    /**
     * Gets the remapped shader variable name.
     * @param variableName - The variable name
     * @returns The remapped variable name
     */
    public getRemappedName(variableName: string) {
        variableName = decorateSymbol(variableName);
        return this._remappedShaderVariables[variableName] ?? variableName;
    }

    /**
     * Sets the remapped shader variables.
     * @param variableName - defines the variable name to remap
     * @param remappedName - defines the remapped name
     */
    public addShaderVariableRemapping(variableName: string, remappedName: string) {
        this._remappedShaderVariables[variableName] = remappedName;
    }
}

/**
 * The shader bindings for a disableable ShaderBlock.
 */
export abstract class ShaderBinding extends Binding {
    private _disabled: StrongRef<boolean>;

    /**
     * Construct a ShaderBinding instance.
     * @param parentBlock - The parent block
     */
    constructor(parentBlock: IDisableableBlock) {
        super();
        this._disabled = parentBlock.disabled?.runtimeData || createStrongRef(false);
    }

    /**
     * Binds all the required data to the shader when rendering.
     * @param effect - defines the effect to bind the data to
     * @param _width - defines the width of the output
     * @param _height - defines the height of the output
     */
    public bind(effect: Effect, _width?: number, _height?: number): void {
        effect.setBool(this.getRemappedName("disabled"), this._disabled.value);
    }
}

/**
 * The shader runtime is the base for any runtime associated with a @see ShaderBlock.
 *
 * It encapsulates the basic needs to render a full screen effect mainly the effect wrapper holding on the shader program.
 *
 * It is able to either render to a texture or directly to the main canvas.
 *
 * It also manages the disposal of the effect wrapper.
 */
export class ShaderRuntime implements IDisposable {
    /**
     * Promise that resolves when the effect is ready to be used.
     */
    public readonly onReadyAsync: Promise<void>;

    private readonly _engine: AbstractEngine;
    private readonly _effectRenderer: EffectRenderer;
    private readonly _effectWrapper: EffectWrapper;
    private readonly _shaderBinding: Binding;

    /**
     * Creates a new @see ShaderRuntime.
     * @param effectRenderer - defines the effect renderer to use to render the full screen effect
     * @param shaderProgram - defines the shader code associated with this runtime
     * @param shaderBinding - defines the shader bindings associated with this runtime
     */
    constructor(effectRenderer: EffectRenderer, shaderProgram: ShaderProgram, shaderBinding: Binding) {
        this._engine = effectRenderer.engine;
        this._effectRenderer = effectRenderer;
        this._shaderBinding = shaderBinding;
        this._effectWrapper = new EffectWrapper({
            engine: this._engine,
            ...getShaderCreateOptions(shaderProgram),
        });

        // Wraps the effect readiness in a promise to expose it as a public property.
        this.onReadyAsync = new Promise<void>((resolve, reject) => {
            this._effectWrapper.effect.executeWhenCompiled(() => {
                resolve();
            });

            this._effectWrapper.effect.onErrorObservable.addOnce((error) => {
                reject(error);
            });
        });
    }

    /**
     * Renders the full screen effect into a texture.
     * @param renderTargetWrapper - The render target wrapper to render into
     */
    public renderToTexture(renderTargetWrapper: RenderTargetWrapper): void {
        this._engine.bindFramebuffer(renderTargetWrapper);
        this._draw(renderTargetWrapper.width, renderTargetWrapper.height);
        this._engine.unBindFramebuffer(renderTargetWrapper);
    }

    /**
     * Renders the full screen effect into the main canvas.
     */
    public renderToCanvas(): void {
        this._effectRenderer.setViewport();
        this._draw(this._engine.getRenderWidth(), this._engine.getRenderHeight());
    }

    /**
     * "Draws" the full screen effect into the currently bound output.
     * @param width - defines the width of the output
     * @param height - defines the height of the output
     */
    private _draw(width: number, height: number): void {
        this._effectRenderer.applyEffectWrapper(this._effectWrapper);
        this._shaderBinding.bind(this._effectWrapper.effect, width, height);
        this._effectRenderer.draw();
    }

    /**
     * Disposes the runtime resources.
     */
    public dispose(): void {
        this._effectWrapper.dispose();
    }
}
