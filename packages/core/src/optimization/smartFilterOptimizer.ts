import type { Nullable } from "@babylonjs/core/types";

import type { ConnectionPoint } from "../connection/connectionPoint";
import type { Binding } from "../runtime/shaderRuntime";
import type { InputBlock } from "../blocks/inputBlock";
import type { BaseBlock } from "../blocks/baseBlock";
import { SmartFilter } from "../smartFilter.js";
import { ConnectionPointType } from "../connection/connectionPointType.js";
import { ShaderBlock } from "../blocks/shaderBlock.js";
import { isTextureInputBlock } from "../blocks/inputBlock.js";
import { OptimizedShaderBlock } from "./optimizedShaderBlock.js";
import { decorateChar, decorateSymbol, getShaderFragmentCode, undecorateSymbol } from "../utils/shaderCodeUtils.js";
import { DependencyGraph } from "./dependencyGraph.js";
import { DisableableBlock } from "../blocks/disableableBlock.js";

const showDebugData = false;

/**
 * @internal
 */
type RemappedSymbol = {
    /**
     * The type of the symbol.
     */
    type: "uniform" | "const" | "sampler" | "function";

    /**
     * The name of the symbol.
     */
    name: string;

    /**
     * The name of the symbol after it has been remapped.
     */
    remappedName: string;

    /**
     * The declaration of the symbol. For "function" it is the function code.
     */
    declaration: string;

    /**
     * The ShaderBlock(s) that owns the symbol.
     */
    owners: ShaderBlock[];

    /**
     * The InputBlock that owns the texture. Only used for type="sampler".
     */
    inputBlock: InputBlock<ConnectionPointType.Texture> | undefined;
};

/**
 * @internal
 */
export type StackItem = {
    /**
     * The connection points to which to connect the output of the optimized block, once the optimized block has been created.
     */
    inputsToConnectTo: ConnectionPoint[];

    /**
     * The connection point to process.
     */
    outputConnectionPoint: ConnectionPoint;
};

/**
 * Options for the smart filter optimizer.
 */
export interface ISmartFilterOptimizerOptions {
    /**
     * The maximum number of samplers allowed in the fragment shader. Default: 8
     */
    maxSamplersInFragmentShader?: number;

    /**
     * If true, the optimizer will remove the disabled blocks from the optimized smart filter. Default: false
     * It allows more aggressive optimizations, but removed blocks will no longer be available in the optimized smart filter.
     */
    removeDisabledBlocks?: boolean;
}

/**
 * Optimizes a smart filter by aggregating blocks whenever possible, to reduce the number of draw calls.
 */
export class SmartFilterOptimizer {
    private _sourceSmartFilter: SmartFilter;
    private _options: ISmartFilterOptimizerOptions;
    private _blockStack: StackItem[] = [];
    private _blockToStackItem: Map<BaseBlock, StackItem> = new Map();
    private _savedBlockStack: StackItem[] = [];
    private _savedBlockToStackItem: Map<BaseBlock, StackItem> = new Map();

    private _symbolOccurrences: { [name: string]: number } = {};
    private _remappedSymbols: Array<RemappedSymbol> = [];
    private _blockToMainFunctionName: Map<BaseBlock, string> = new Map();
    private _mainFunctionNameToCode: Map<string, string> = new Map();
    private _dependencyGraph: DependencyGraph<string> = new DependencyGraph<string>();
    private _vertexShaderCode: string | undefined;
    private _textureRatio: number | undefined;
    private _forceUnoptimized: boolean = false;

    /**
     * Creates a new smart filter optimizer
     * @param smartFilter - The smart filter to optimize
     * @param options - Options for the optimizer
     */
    constructor(smartFilter: SmartFilter, options?: ISmartFilterOptimizerOptions) {
        this._sourceSmartFilter = smartFilter;
        this._options = {
            maxSamplersInFragmentShader: 8,
            ...options,
        };
    }

    /**
     * Optimizes the smart filter by aggregating blocks whenever possible, to lower the number of rendering passes
     * @returns The optimized smart filter, or null if the optimization failed
     */
    public optimize(): Nullable<SmartFilter> {
        this._blockStack = [];
        this._blockToStackItem = new Map();

        let newSmartFilter: Nullable<SmartFilter> = null;

        this._sourceSmartFilter._workWithAggregateFreeGraph(() => {
            if (
                this._sourceSmartFilter.output.connectedTo &&
                !isTextureInputBlock(this._sourceSmartFilter.output.connectedTo.ownerBlock)
            ) {
                const connectionsToReconnect: [ConnectionPoint, ConnectionPoint][] = [];

                if (this._options.removeDisabledBlocks) {
                    const alreadyVisitedBlocks = new Set<BaseBlock>();
                    this._disconnectDisabledBlocks(
                        this._sourceSmartFilter.output.connectedTo.ownerBlock,
                        alreadyVisitedBlocks,
                        connectionsToReconnect
                    );
                }

                newSmartFilter = new SmartFilter(this._sourceSmartFilter.name + " - optimized");

                // We must recheck isTextureInputBlock because all shader blocks may have been disconnected by the previous code
                if (!isTextureInputBlock(this._sourceSmartFilter.output.connectedTo.ownerBlock)) {
                    // Make sure all the connections in the graph have a runtimeData associated to them
                    // Note that the value of the runtimeData may not be set yet, we just need the objects to be created and propagated correctly
                    this._sourceSmartFilter.output.ownerBlock.prepareForRuntime();
                    this._sourceSmartFilter.output.ownerBlock.propagateRuntimeData();

                    const item: StackItem = {
                        inputsToConnectTo: [newSmartFilter.output],
                        outputConnectionPoint: this._sourceSmartFilter.output.connectedTo,
                    };

                    this._blockStack.push(item);
                    this._blockToStackItem.set(item.outputConnectionPoint.ownerBlock, item);

                    while (this._blockStack.length > 0) {
                        const { inputsToConnectTo, outputConnectionPoint } = this._blockStack.pop()!;

                        const newBlock = this._processBlock(newSmartFilter, outputConnectionPoint);

                        if (newBlock) {
                            for (const inputToConnectTo of inputsToConnectTo) {
                                inputToConnectTo.connectTo(newBlock.output);
                            }
                        }
                    }
                } else {
                    newSmartFilter.output.connectTo(this._sourceSmartFilter.output.connectedTo);
                }

                if (this._options.removeDisabledBlocks) {
                    // We must reconnect the connections that were reconnected differently by the disconnect process, so that the original graph is left unmodified
                    for (const [input, connectedTo] of connectionsToReconnect) {
                        input.connectTo(connectedTo);
                    }
                }
            }
        });

        return newSmartFilter;
    }

    private _disconnectDisabledBlocks(
        block: BaseBlock,
        alreadyVisitedBlocks: Set<BaseBlock>,
        inputsToReconnect: [ConnectionPoint, ConnectionPoint][]
    ) {
        if (alreadyVisitedBlocks.has(block)) {
            return;
        }

        alreadyVisitedBlocks.add(block);

        for (const input of block.inputs) {
            if (!input.connectedTo || input.type !== ConnectionPointType.Texture) {
                continue;
            }

            this._disconnectDisabledBlocks(input.connectedTo.ownerBlock, alreadyVisitedBlocks, inputsToReconnect);
        }

        if (block instanceof DisableableBlock && block.disabled.runtimeData.value) {
            block.disconnectFromGraph(inputsToReconnect);
        }
    }

    private _initialize() {
        this._symbolOccurrences = {};
        this._remappedSymbols = [];
        this._blockToMainFunctionName = new Map();
        this._mainFunctionNameToCode = new Map();
        this._dependencyGraph = new DependencyGraph();
        this._vertexShaderCode = undefined;
        this._textureRatio = undefined;
        this._forceUnoptimized = false;
    }

    private _makeSymbolUnique(symbolName: string): string {
        let newVarName = symbolName;
        if (!this._symbolOccurrences[symbolName]) {
            this._symbolOccurrences[symbolName] = 1;
        } else {
            this._symbolOccurrences[symbolName]++;
            newVarName += "_" + this._symbolOccurrences[symbolName];
        }

        return newVarName;
    }

    private _processHelperFunctions(block: ShaderBlock, code: string): string {
        const functions = block.getShaderProgram().fragment.functions;

        if (functions.length === 1) {
            // There's only the main function, so we don't need to do anything
            return code;
        }

        const replaceFuncNames: Array<[RegExp, string]> = [];

        for (const func of functions) {
            let funcName = func.name;

            if (funcName === block.getShaderProgram().fragment.mainFunctionName) {
                continue;
            }

            funcName = undecorateSymbol(funcName);

            const regexFindCurName = new RegExp(decorateSymbol(funcName), "g");

            const existingRemapped = this._remappedSymbols.find(
                (s) =>
                    s.type === "function" &&
                    s.name === funcName &&
                    s.owners[0] &&
                    s.owners[0].getClassName() === block.getClassName()
            );

            const newVarName = existingRemapped?.remappedName ?? decorateSymbol(this._makeSymbolUnique(funcName));

            if (!existingRemapped) {
                replaceFuncNames.push([regexFindCurName, newVarName]);

                let funcCode = func.code;
                for (const [regex, replacement] of replaceFuncNames) {
                    funcCode = funcCode.replace(regex, replacement);
                }

                this._remappedSymbols.push({
                    type: "function",
                    name: funcName,
                    remappedName: newVarName,
                    declaration: funcCode,
                    owners: [block],
                    inputBlock: undefined,
                });
            }

            code = code.replace(regexFindCurName, newVarName);
        }

        return code;
    }

    private _processVariables(
        block: ShaderBlock,
        code: string,
        varDecl: "const" | "uniform",
        declarations?: string,
        hasValue = false,
        forceSingleInstance = false
    ): [string, Array<string>] {
        if (!declarations) {
            return [code, []];
        }

        let rex = `${varDecl}\\s+(\\S+)\\s+${decorateChar}(\\w+)${decorateChar}\\s*`;
        if (hasValue) {
            rex += "=\\s*(.+);";
        } else {
            rex += ";";
        }

        const samplerList = [];
        const rx = new RegExp(rex, "g");

        let match = rx.exec(declarations);
        while (match !== null) {
            const singleInstance = forceSingleInstance || varDecl === "const";
            const varType = match[1]!;
            const varName = match[2]!;
            const varValue = hasValue ? match[3]! : null;

            let newVarName: Nullable<string> = null;

            if (varType === "sampler2D") {
                samplerList.push(decorateSymbol(varName));
            } else {
                const existingRemapped = this._remappedSymbols.find(
                    (s) =>
                        s.type === varDecl &&
                        s.name === varName &&
                        s.owners[0] &&
                        s.owners[0].getClassName() === block.getClassName()
                );
                if (existingRemapped && singleInstance) {
                    newVarName = existingRemapped.remappedName;
                    if (varDecl === "uniform") {
                        existingRemapped.owners.push(block);
                    }
                } else {
                    newVarName = decorateSymbol(this._makeSymbolUnique(varName));

                    this._remappedSymbols.push({
                        type: varDecl,
                        name: varName,
                        remappedName: newVarName,
                        declaration: `${varDecl} ${varType} ${newVarName}${hasValue ? " = " + varValue : ""};`,
                        owners: [block],
                        inputBlock: undefined,
                    });
                }
            }

            if (newVarName) {
                code = code.replace(new RegExp(decorateSymbol(varName), "g"), newVarName);
            }

            match = rx.exec(declarations);
        }

        return [code, samplerList];
    }

    private _processSampleTexture(
        block: ShaderBlock,
        code: string,
        sampler: string,
        samplers: string[],
        inputTextureBlock?: InputBlock<ConnectionPointType.Texture>
    ): string {
        const rx = new RegExp(`sampleTexture\\s*\\(\\s*${decorateChar}${sampler}${decorateChar}\\s*,\\s*(.*?)\\s*\\)`);

        let newSamplerName = sampler;

        const existingRemapped = this._remappedSymbols.find(
            (s) => s.type === "sampler" && s.inputBlock && s.inputBlock === inputTextureBlock
        );
        if (existingRemapped) {
            // The texture is shared by multiple blocks. We must reuse the same sampler name
            newSamplerName = existingRemapped.remappedName;
        } else {
            newSamplerName = decorateSymbol(this._makeSymbolUnique(newSamplerName));

            this._remappedSymbols.push({
                type: "sampler",
                name: sampler,
                remappedName: newSamplerName,
                declaration: `uniform sampler2D ${newSamplerName};`,
                owners: [block],
                inputBlock: inputTextureBlock,
            });
        }

        if (samplers.indexOf(newSamplerName) === -1) {
            samplers.push(newSamplerName);
        }

        let match = rx.exec(code);
        while (match !== null) {
            const uv = match[1]!;

            code =
                code.substring(0, match.index) +
                `texture2D(${newSamplerName}, ${uv})` +
                code.substring(match.index + match[0]!.length);

            match = rx.exec(code);
        }

        return code;
    }

    private _canBeOptimized(block: BaseBlock): boolean {
        if (block.disableOptimization) {
            return false;
        }

        if (block instanceof ShaderBlock) {
            if (block.getShaderProgram().vertex !== this._vertexShaderCode) {
                return false;
            }

            if (block.textureRatio !== this._textureRatio) {
                return false;
            }
        }

        return true;
    }

    // Processes a block given one of its output connection point
    // Returns the name of the main function in the shader code
    private _optimizeBlock(
        optimizedBlock: OptimizedShaderBlock,
        outputConnectionPoint: ConnectionPoint,
        samplers: string[]
    ): string {
        const block = outputConnectionPoint.ownerBlock;

        if (block instanceof ShaderBlock) {
            if (this._textureRatio === undefined) {
                this._textureRatio = block.textureRatio;
            }

            const shaderProgram = block.getShaderProgram();

            if (!shaderProgram) {
                throw new Error(`Shader program not found for block "${block.name}"!`);
            }

            // We get the shader code of the main function only
            let code = getShaderFragmentCode(shaderProgram, true);

            this._vertexShaderCode = this._vertexShaderCode ?? shaderProgram.vertex;

            // Generates a unique name for the fragment main function (if not already generated)
            const shaderFuncName = shaderProgram.fragment.mainFunctionName;

            let newShaderFuncName = this._blockToMainFunctionName.get(block);

            if (!newShaderFuncName) {
                newShaderFuncName = undecorateSymbol(shaderFuncName);
                newShaderFuncName = decorateSymbol(this._makeSymbolUnique(newShaderFuncName));

                this._blockToMainFunctionName.set(block, newShaderFuncName);
                this._dependencyGraph.addElement(newShaderFuncName);
            }

            // Replaces the main function name by the new one
            code = code.replace(shaderFuncName, newShaderFuncName);

            // Removes the vUV declaration if it exists
            code = code.replace(/varying\s+vec2\s+vUV\s*;/g, "");

            // Replaces the texture2D calls by sampleTexture for easier processing
            code = code.replace(/texture2D/g, "sampleTexture");

            // Processes the functions other than the main function
            code = this._processHelperFunctions(block, code);

            // Processes the constants to make them unique
            code = this._processVariables(block, code, "const", shaderProgram.fragment.const, true)[0];

            // Processes the uniform inputs to make them unique. Also extract the list of samplers
            let samplerList: string[] = [];
            [code, samplerList] = this._processVariables(block, code, "uniform", shaderProgram.fragment.uniform, false);

            let additionalSamplers = [];
            [code, additionalSamplers] = this._processVariables(
                block,
                code,
                "uniform",
                shaderProgram.fragment.uniformSingle,
                false,
                true
            );

            samplerList.push(...additionalSamplers);

            // Processes the texture inputs
            for (const sampler of samplerList) {
                const samplerName = undecorateSymbol(sampler);

                const input = block.findInput(samplerName);
                if (!input) {
                    // No connection point found corresponding to this texture: it must be a texture used internally by the filter (here we are assuming that the shader code is not bugged!)
                    code = this._processSampleTexture(block, code, samplerName, samplers);
                    continue;
                }

                // input found. Is it connected?
                if (!input.connectedTo) {
                    throw `The connection point corresponding to the input named "${samplerName}" in block named "${block.name}" is not connected!`;
                }

                const parentBlock = input.connectedTo.ownerBlock;

                if (isTextureInputBlock(parentBlock)) {
                    // input is connected to an InputBlock of type "Texture": we must directly sample a texture
                    code = this._processSampleTexture(block, code, samplerName, samplers, parentBlock);
                } else if (this._forceUnoptimized || !this._canBeOptimized(parentBlock)) {
                    // the block connected to this input cannot be optimized: we must directly sample its output texture
                    code = this._processSampleTexture(block, code, samplerName, samplers);
                    let stackItem = this._blockToStackItem.get(parentBlock);
                    if (!stackItem) {
                        stackItem = {
                            inputsToConnectTo: [],
                            outputConnectionPoint: input.connectedTo,
                        };
                        this._blockStack.push(stackItem);
                        this._blockToStackItem.set(parentBlock, stackItem);
                    }
                    // creates a new input connection point for the texture in the optimized block
                    const connectionPoint = optimizedBlock._registerInput(samplerName, ConnectionPointType.Texture);
                    stackItem.inputsToConnectTo.push(connectionPoint);
                } else {
                    let parentFuncName: string;

                    if (this._blockToMainFunctionName.has(parentBlock)) {
                        // The parent block has already been processed. We can directly use the main function name
                        parentFuncName = this._blockToMainFunctionName.get(parentBlock)!;
                    } else {
                        // Recursively processes the block connected to this input to get the main function name of the parent block
                        parentFuncName = this._optimizeBlock(optimizedBlock, input.connectedTo, samplers);
                        this._dependencyGraph.addDependency(newShaderFuncName, parentFuncName);
                    }

                    // The texture samplerName is not used anymore by the block, as it is replaced by a call to the main function of the parent block
                    // We remap it to an non existent sampler name, because the code that binds the texture still exists in the ShaderBinding.bind function.
                    // We don't want this code to have any effect, as it could overwrite (and remove) the texture binding of another block using this same sampler name!
                    this._remappedSymbols.push({
                        type: "sampler",
                        name: samplerName,
                        remappedName: "L(° O °L)",
                        declaration: ``,
                        owners: [block],
                        inputBlock: undefined,
                    });

                    // We have to replace the call(s) to sampleTexture by a call to the main function of the parent block
                    const rx = new RegExp(`sampleTexture\\s*\\(\\s*${sampler}\\s*,\\s*(.*?)\\s*\\)`);

                    let match = rx.exec(code);
                    while (match !== null) {
                        const uv = match[1];

                        code =
                            code.substring(0, match.index) +
                            `${parentFuncName}(${uv})` +
                            code.substring(match.index + match[0]!.length);
                        match = rx.exec(code);
                    }
                }
            }

            this._mainFunctionNameToCode.set(newShaderFuncName, code);

            return newShaderFuncName;
        }

        throw `Unhandled block type! className=${block.getClassName()}`;
    }

    private _saveBlockStackState(): void {
        this._savedBlockStack = this._blockStack.slice();
        this._savedBlockToStackItem = new Map();

        for (const [key, value] of this._blockToStackItem) {
            value.inputsToConnectTo = value.inputsToConnectTo.slice();
            this._savedBlockToStackItem.set(key, value);
        }
    }

    private _restoreBlockStackState(): void {
        this._blockStack.length = 0;
        this._blockStack.push(...this._savedBlockStack);

        this._blockToStackItem.clear();
        for (const [key, value] of this._savedBlockToStackItem) {
            this._blockToStackItem.set(key, value);
        }
    }

    private _processBlock(newSmartFilter: SmartFilter, outputConnectionPoint: ConnectionPoint): Nullable<ShaderBlock> {
        this._saveBlockStackState();
        this._initialize();

        let optimizedBlock = new OptimizedShaderBlock(newSmartFilter, "optimized");

        const samplers: string[] = [];
        let mainFuncName = this._optimizeBlock(optimizedBlock, outputConnectionPoint, samplers);

        if (samplers.length > this._options.maxSamplersInFragmentShader!) {
            // Too many samplers for the optimized block.
            // We must force the unoptimized mode and regenerate the block, which will be unoptimized this time
            newSmartFilter.removeBlock(optimizedBlock);

            this._initialize();

            optimizedBlock = new OptimizedShaderBlock(newSmartFilter, "unoptimized");

            this._forceUnoptimized = true;
            samplers.length = 0;

            this._restoreBlockStackState();

            mainFuncName = this._optimizeBlock(optimizedBlock, outputConnectionPoint, samplers);
        }

        // Collects all the shader code
        let code = "";
        this._dependencyGraph.walk((element: string) => {
            code += this._mainFunctionNameToCode.get(element)! + "\n";
        });

        // Sets the remapping of the shader variables
        const blockOwnerToShaderBinding = new Map<ShaderBlock, Binding>();

        let codeUniforms = "";
        let codeConsts = "";
        let codeFunctions = "";

        for (const s of this._remappedSymbols) {
            switch (s.type) {
                case "const":
                    codeConsts += s.declaration + "\n";
                    break;
                case "uniform":
                case "sampler":
                    codeUniforms += s.declaration + "\n";
                    break;
                case "function":
                    codeFunctions += s.declaration + "\n";
                    break;
            }

            for (const block of s.owners) {
                let shaderBinding = blockOwnerToShaderBinding.get(block);
                if (!shaderBinding) {
                    shaderBinding = block.getShaderBinding();
                    blockOwnerToShaderBinding.set(block, shaderBinding);
                }

                switch (s.type) {
                    case "uniform":
                    case "sampler":
                        shaderBinding.addShaderVariableRemapping(decorateSymbol(s.name), s.remappedName);
                        break;
                }
            }
        }

        // Builds and sets the final shader code
        code = codeFunctions + code;
        if (showDebugData) {
            code = code.replace(/^ {16}/gm, "");
            code = code!.replace(/\r/g, "");
            code = code!.replace(/\n(\n)*/g, "\n");

            console.log(`=================== BLOCK (forceUnoptimized=${this._forceUnoptimized}) ===================`);
            console.log(codeUniforms);
            console.log(codeConsts);
            console.log(code);
            console.log("remappedSymbols=", this._remappedSymbols);
            console.log("samplers=", samplers);
        }

        optimizedBlock.setShaderProgram({
            vertex: this._vertexShaderCode,
            fragment: {
                const: codeConsts,
                uniform: codeUniforms,
                mainFunctionName: mainFuncName,
                functions: [
                    {
                        name: mainFuncName,
                        code,
                    },
                ],
            },
        });

        if (this._textureRatio !== undefined) {
            optimizedBlock.textureRatio = this._textureRatio;
        }

        optimizedBlock.setShaderBindings(Array.from(blockOwnerToShaderBinding.values()));

        return optimizedBlock;
    }
}
