import type { ThinEngine } from "@babylonjs/core/Engines/thinEngine";
import type { Nullable } from "@babylonjs/core/types";
import type { SmartFilterRuntime } from "./runtime/smartFilterRuntime";
import type { BaseBlock } from "./blocks/baseBlock";
import type { ConnectionPointType } from "./connection/connectionPointType";
import type { ConnectionPoint } from "./connection/connectionPoint";
import { OutputBlock } from "./blocks/outputBlock.js";
import { InternalSmartFilterRuntime } from "./runtime/smartFilterRuntime.js";
import { RenderTargetGenerator } from "./runtime/renderTargetGenerator.js";
import { AggregateBlock } from "./blocks/aggregateBlock.js";
import type { IEditorData } from "@babylonjs/shared-ui-components/nodeGraphSystem/interfaces/nodeLocationInfo";

/**
 * How long to wait for shader compilation and texture loading to complete before erroring out.
 */
const InitializationTimeout = 10000;

/**
 * Data passed to the initialize function of the blocks.
 */
export type InitializationData = {
    /**
     * The current smart filter runtime the block is being initialized for.
     */
    readonly runtime: InternalSmartFilterRuntime;
    /**
     * The output block of the smart filter.
     * This is used to determine if a block is linked to the output block so that we can prevent an
     * extra render pass.
     */
    readonly outputBlock: OutputBlock;
    /**
     * The list of promises to wait for during the initialization step.
     */
    readonly initializationPromises: Promise<void>[];
};

/**
 * The smart filter class is the main class of the smart filter module.
 *
 * It is responsible for managing a graph of smart filter blocks.
 *
 * It is also responsible for creating the runtime associated to the current state of the filter.
 */
export class SmartFilter {
    /**
     * The friendly name of the smart filter.
     */
    public readonly name: string;

    /**
     * The smart filter output (input connection point of the output block...).
     *
     * This is where the smart filter final block should be connected to in order to be visible on screen.
     */
    public readonly output: ConnectionPoint<ConnectionPointType.Texture>;

    /**
     * User defined comments to describe the current smart filter.
     */
    public comments: Nullable<string> = null;

    /**
     * Data used by the smart filter editor.
     */
    public editorData: Nullable<IEditorData> = null;

    private readonly _attachedBlocks: Array<BaseBlock>;
    private readonly _outputBlock: OutputBlock;

    /**
     * Creates a new instance of a @see SmartFilter.
     * @param name - The friendly name of the smart filter
     */
    constructor(name: string) {
        this.name = name;

        this._attachedBlocks = new Array<BaseBlock>();
        this._outputBlock = new OutputBlock(this);
        this.output = this._outputBlock.input;
    }

    /**
     * @returns the list of blocks attached to the smart filter.
     */
    public get attachedBlocks(): ReadonlyArray<BaseBlock> {
        return this._attachedBlocks;
    }

    /**
     * @returns The current class name of the smart filter.
     */
    public getClassName(): string {
        return "SmartFilter";
    }

    /**
     * Registers a block to be part of this smart filter.
     * @param block - The block to register on the smart filter
     * @throws if the block is already registered on another smart filter
     * @remarks This function will not register the block if it is already registered on the smart filter.
     */
    public registerBlock(block: BaseBlock): void {
        // It is impossible to attach a block from another filter
        if (block.smartFilter !== this) {
            throw new Error("Block is not part of this smart filter");
        }

        // No need to attach a block several times
        if (this._attachedBlocks.indexOf(block) !== -1) {
            return;
        }

        // Add the block to the list of attached blocks
        this._attachedBlocks.push(block);
    }

    /**
     * Removes the block from the smart filter.
     * @param block - The block to remove from the smart filter
     * @remarks This function will disconnect the block on removal.
     * This Output block cannot be removed.
     */
    public removeBlock(block: BaseBlock): void {
        const attachedBlockIndex = this._attachedBlocks.indexOf(block);

        // The block can only be removed if it is not the output block
        // and if it is attached to the smart filter
        if (attachedBlockIndex > -1 && !block.isOutput) {
            // Disconnects all the connections of the block
            block.disconnect();

            // Removes the block from the list of attached blocks
            this._attachedBlocks.splice(attachedBlockIndex, 1);
        }
    }

    private _generateCommandsAndGatherInitPromises(initializationData: InitializationData): void {
        const outputBlock = this._outputBlock;

        outputBlock.visit(initializationData, (block: BaseBlock, initializationData: InitializationData) => {
            // If the block is the output block,
            if (block === outputBlock) {
                // We only need to do something if the connected block is an input block.
                // Indeed, any other block linked to the output block would directly render to the canvas
                // as an optimization.
                // In case the output block is not linked to an input block, we do not need extra commands
                // or resources to create a render pass.
                if (outputBlock.input.connectedTo?.ownerBlock.isInput) {
                    block.generateCommandsAndGatherInitPromises(initializationData, true);
                }
                return;
            }

            block.generateCommandsAndGatherInitPromises(
                initializationData,
                outputBlock.input.connectedTo?.ownerBlock === block
            );
        });
    }

    /**
     * Create a new runtime for the current state of the smart filter.
     * @param engine - The Babylon.js engine to use for the runtime
     * @param renderTargetGenerator - The render target generator to use to generate the RTTs for the shader blocks. If not provided, a default one will be created.
     * @returns the runtime that can be used to render the smart filter
     */
    public async createRuntimeAsync(
        engine: ThinEngine,
        renderTargetGenerator?: RenderTargetGenerator
    ): Promise<SmartFilterRuntime> {
        const runtime = new InternalSmartFilterRuntime(engine);

        const initializationData: InitializationData = {
            runtime,
            outputBlock: this._outputBlock,
            initializationPromises: [],
        };

        this._workWithAggregateFreeGraph(() => {
            this._outputBlock.prepareForRuntime();

            renderTargetGenerator = renderTargetGenerator ?? new RenderTargetGenerator(false);
            renderTargetGenerator.setOutputTextures(this, initializationData);

            this._outputBlock.propagateRuntimeData();

            this._generateCommandsAndGatherInitPromises(initializationData);
        });

        // Wait for all the blocks to be initialized
        if (initializationData.initializationPromises.length > 0) {
            const timeoutPromise = new Promise((resolve) => setTimeout(resolve, InitializationTimeout, true));
            const initializationPromises = Promise.all(initializationData.initializationPromises).then(() => false);
            const timedOut = await Promise.race([initializationPromises, timeoutPromise]);
            if (timedOut) {
                throw new Error("Initialization promises timed out");
            }
        }

        return runtime;
    }

    /**
     * @internal
     * Merges all aggregate blocks into the smart filter graph, executes the passed-in work, then restores the aggregate blocks.
     * @param work - The work to execute with the aggregate blocks merged
     */
    public _workWithAggregateFreeGraph(work: () => void): void {
        const mergedAggregateBlocks: AggregateBlock[] = [];

        // Merge all aggregate blocks
        this._outputBlock.visit({}, (block: BaseBlock, _extraData: Object) => {
            if (block instanceof AggregateBlock) {
                block._mergeIntoSmartFilter(mergedAggregateBlocks);
            }
        });

        // Do the passed in work
        work();

        // Restore all aggregate blocks
        for (const block of mergedAggregateBlocks) {
            block._unmergeFromSmartFilter();
        }
    }
}
