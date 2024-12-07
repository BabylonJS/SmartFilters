import type { ThinTexture } from "@babylonjs/core/Materials/Textures/thinTexture";
import type { Nullable } from "@babylonjs/core/types";
import { ThinRenderTargetTexture } from "@babylonjs/core/Materials/Textures/thinRenderTargetTexture.js";
import type { RenderTargetCreationOptions } from "@babylonjs/core/Materials/Textures/textureCreationOptions";

import type { BaseBlock } from "../blocks/baseBlock";
import type { InitializationData, SmartFilter } from "../smartFilter";
import type { InternalSmartFilterRuntime } from "./smartFilterRuntime";
import { ShaderBlock } from "../blocks/shaderBlock.js";
import { createStrongRef } from "./strongRef.js";
import { ConnectionPointType } from "../connection/connectionPointType.js";
import type { OutputTextureOptions } from "../blocks/textureOptions";

/**
 * @internal
 */
interface RefCountedTexture {
    /**
     * The texture.
     */
    texture: ThinTexture;

    /**
     * The reference count.
     */
    refCount: number;
}

/**
 * The render target generator is responsible for creating and assigning render targets to ShaderBlocks.
 */
export class RenderTargetGenerator {
    private _optimize: boolean;
    private _renderTargetPool: Map<string, Set<RefCountedTexture>>;
    private _numTargetsCreated;

    /**
     * Creates a new render target generator.
     * @param optimize - If true, the render target generator will try to reuse render targets as much as possible.
     */
    constructor(optimize = true) {
        this._optimize = optimize;
        this._renderTargetPool = new Map();
        this._numTargetsCreated = 0;
    }

    /**
     * Returns the number of render targets created by the process
     */
    public get numTargetsCreated() {
        return this._numTargetsCreated;
    }

    /**
     * Sets the output textures for the ShaderBlocks of the smart filter.
     * @param smartFilter - The smart filter to generate the render targets for.
     * @param initializationData - The initialization data to use.
     */
    public setOutputTextures(smartFilter: SmartFilter, initializationData: InitializationData) {
        smartFilter.output.ownerBlock.visit(
            initializationData,
            (block: BaseBlock, initializationData: InitializationData) => {
                if (!(block instanceof ShaderBlock)) {
                    return;
                }

                let refCountedTexture: Nullable<RefCountedTexture> = null;
                const textureOptionsHash = JSON.stringify(block.outputTextureOptions);

                // We assign a texture to the output of the block only if this is not the last block in the chain,
                // i.e. not the block connected to the smart output block (in which case the output of the block is to the canvas and not a texture).
                if (!block.output.endpoints.some((cp) => cp.ownerBlock === smartFilter.output.ownerBlock)) {
                    refCountedTexture = this._getTexture(
                        initializationData.runtime,
                        block.outputTextureOptions,
                        textureOptionsHash,
                        smartFilter
                    );

                    if (!block.output.runtimeData) {
                        const runtimeOutput = createStrongRef(refCountedTexture.texture);
                        block.output.runtimeData = runtimeOutput;
                    } else {
                        block.output.runtimeData.value = refCountedTexture.texture;
                    }
                }

                if (this._optimize) {
                    if (refCountedTexture !== null) {
                        for (const output of block.outputs) {
                            output.endpoints.forEach((endpoint) => {
                                if (endpoint.connectedTo) {
                                    refCountedTexture!.refCount++;
                                }
                            });
                        }
                    }

                    for (const input of block.inputs) {
                        if (!input.connectedTo || input.connectedTo.type !== ConnectionPointType.Texture) {
                            continue;
                        }
                        const connectedBlock = input.connectedTo.ownerBlock;
                        if (
                            connectedBlock instanceof ShaderBlock &&
                            connectedBlock.output.runtimeData &&
                            connectedBlock.output.runtimeData.value
                        ) {
                            this._releaseTexture(connectedBlock.output.runtimeData.value, textureOptionsHash);
                        }
                    }
                }
            }
        );
        this._renderTargetPool.clear();
    }

    private _findAvailableTexture(textureOptionsHash: string): Nullable<RefCountedTexture> {
        const refCountedTextures = this._renderTargetPool.get(textureOptionsHash);
        if (!refCountedTextures) {
            return null;
        }

        for (const refCountedTexture of refCountedTextures) {
            if (refCountedTexture.refCount === 0) {
                return refCountedTexture;
            }
        }

        return null;
    }

    private _getTexture(
        runtime: InternalSmartFilterRuntime,
        textureOptions: OutputTextureOptions,
        textureOptionsHash: string,
        smartFilter: SmartFilter
    ): RefCountedTexture {
        if (!this._optimize) {
            this._numTargetsCreated++;
            return {
                texture: this._createTexture(runtime, smartFilter, textureOptions),
                refCount: 0,
            };
        }

        let refCountedTextures = this._renderTargetPool.get(textureOptionsHash);
        if (!refCountedTextures) {
            refCountedTextures = new Set();
            this._renderTargetPool.set(textureOptionsHash, refCountedTextures);
        }

        let refCountedTexture = this._findAvailableTexture(textureOptionsHash);
        if (!refCountedTexture) {
            refCountedTexture = {
                texture: this._createTexture(runtime, smartFilter, textureOptions),
                refCount: 0,
            };
            refCountedTextures.add(refCountedTexture);
            this._numTargetsCreated++;
        }

        return refCountedTexture;
    }

    private _releaseTexture(texture: ThinTexture, textureOptionsHash: string) {
        if (!this._optimize) {
            return;
        }

        const refCountedTextures = this._renderTargetPool.get(textureOptionsHash);
        if (!refCountedTextures) {
            throw new Error(`_releaseTexture: Trying to add a texture to a non existing pool ${textureOptionsHash}!`);
        }

        for (const refCountedTexture of refCountedTextures) {
            if (refCountedTexture.texture === texture) {
                refCountedTexture.refCount--;
                return;
            }
        }

        throw new Error(`_releaseTexture: Can't find the texture in the pool ${textureOptionsHash}!`);
    }

    /**
     * Creates an offscreen texture to hold on the result of the block rendering.
     * @param runtime - The current runtime we create the texture for
     * @param smartFilter - The smart filter the texture is created for
     * @param textureOptions - The options to use to create the texture
     * @returns The render target texture
     */
    private _createTexture(
        runtime: InternalSmartFilterRuntime,
        smartFilter: SmartFilter,
        textureOptions: OutputTextureOptions
    ): ThinRenderTargetTexture {
        const engine = runtime.engine;

        // We are only rendering full screen post process without depth or stencil information
        const setup: RenderTargetCreationOptions = {
            generateDepthBuffer: false,
            generateStencilBuffer: false,
            generateMipMaps: false,
            samplingMode: 2, // Babylon Constants.TEXTURE_LINEAR_LINEAR,
            format: textureOptions.format !== undefined ? textureOptions.format : 0, // Babylon Constants.TEXTUREFORMAT_RGBA,
            type: textureOptions.type !== undefined ? textureOptions.type : 0, // Babylon Constants.TEXTURETYPE_UNSIGNED_BYTE,
        };

        // Get the smartFilter output size - either from the output block's renderTargetTexture or the engine's render size
        let outputWidth: number;
        let outputHeight: number;
        if (smartFilter.outputBlock.renderTargetWrapper) {
            outputWidth = smartFilter.outputBlock.renderTargetWrapper.width;
            outputHeight = smartFilter.outputBlock.renderTargetWrapper.height;
        } else {
            outputWidth = engine.getRenderWidth(true);
            outputHeight = engine.getRenderHeight(true);
        }
        const size = {
            width: Math.floor(outputWidth * textureOptions.ratio),
            height: Math.floor(outputHeight * textureOptions.ratio),
        };

        // Creates frame buffers for effects
        const finalRenderTarget = new ThinRenderTargetTexture(engine, size, setup);
        runtime.registerResource(finalRenderTarget);

        // Babylon Constants.TEXTURE_CLAMP_ADDRESSMODE; NPOT Friendly
        finalRenderTarget.wrapU = 0;
        finalRenderTarget.wrapV = 0;

        finalRenderTarget.anisotropicFilteringLevel = 1;

        return finalRenderTarget;
    }
}
