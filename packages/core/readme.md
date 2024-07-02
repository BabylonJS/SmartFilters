# Babylon.js Smart Filters

## Core

A Smart Filter is a node based description of effects to apply on various inputs in order to create a visual output on a canvas element.

The main usage is for video processing and composition but it could be easily reused for picture edition or procedural creation.

## How to install

This can be installed with `npm install @babylonjs/smart-filters`.

It requires the following peer dependencies:

-   @babylonjs/core

## How to use

The overall usage would look like:

```typescript
// Create a filter
const smartFilter = new SmartFilter("Simplest");
const titleInput = new InputBlock(smartFilter, "logo", ConnectionPointType.Texture, logoTexture);
titleInput.output.connectTo(smartFilter.output);

// Create a runtime to display the filter
const engine = new ThinEngine(canvas, true);
const runtime = await filter.createRuntimeAsync(engine);

// Render one frame
runtime.render();
```

The package has been marked as `sideEffects: false` so you can freely import from the index and know that tree shaking will remove any code you don't end up using.

## How it works

The entire system has been split in two parts the filter and the runtime.

### SmartFilter

The notion of a `SmartFilter` is a graph of blocks (all inheriting from `BaseBlock`) linked to each other through `ConnectionPoint`s.

During the initialization phase, the `SmartFilter` examines the graph and builds a list of commands to execute during each frame and stores them in a `CommandBuffer`:

-   This keeps each frame render very fast by ensuring the work is branchless.
-   Basically, every `BaseBlock` during its `initialize` step will register in the `CommandBuffer` only the work it has to execute according to its options.
-   In the end the render loop it only needs to run and execute each command in the list.
-   This also allows for easy injection of debug tools or logging in between each command without growing the minimum required code to run a filter.
-   As discussed, the `Blocks` are responsible for "injecting" their command in the filter `CommandBuffer`.
-   For example: the `ShaderBlock` highlights how convenient it can be to only switch once at init time between rendering to the main frame buffer (if linked to the output) or to an intermediate texture if in the middle of the chain.

Each block is responsible for exposing their inputs and outputs through `registerInput` and `registerOutput`:

-   This creates and stores the related `ConnectionPoint`.
-   All property values of a block must be updated only before `initialize` is called as the runtime won't reference it at render time.
-   All values that need to be dynamically updated after `initialize` must be defined as connection points or 'StrongRef'.

The `ConnectionPoints` are:

-   Strongly typed, allowing more type safety while creating `SmartFilter` by code, yet keeping enough flexibility to be understood efficiently at runtime.
-   They are also responsible for their compatibility when linked to each other.

The Smart Filter is fully abstracted away from the runtime notion and does not even require a Babylon Engine to work with. It is only responsible to hold the "graph" of the filter or the "map" of all its blocks. A Filter only needs a name to be created:

```typescript
const smartFilter = new SmartFilter("Simplest");
```

Once a filter exist, one can add to it as many Blocks as necessary

```typescript
const blur = new BlurBlock(smartFilter, "blur");
```

Then, the various blocks can be linked together:

```typescript
videoInput.output.connectTo(blur.input);
blur.output.connectTo(blackAndWhite.input);
```

Finally the last block should be linked into the video filter output:

```typescript
titleInput.output.connectTo(smartFilter.output);
```

### Optimizations

You can activate two optimizations once you've created your graph and have an instance of `SmartFilter` ready.

The first is a graph optimizer which attempts to "merge" the "compatible" shader blocks to create an optimized version of the graph, thus reducing the final number of draw calls (as there are as many draw calls as there are shader blocks in the graph). This optimization pass will create a new instance of `SmartFilter`, which you can use in place of the initial instance. Here's how to do it:

```typescript
const forceMaxSamplersInFragmentShader = 0;
const vfo = new SmartFilterOptimizer(smartFilter, {
    // filters is an (unoptimized) instance of SmartFilter
    maxSamplersInFragmentShader: forceMaxSamplersInFragmentShader || engine.getCaps().maxTexturesImageUnits,
});
const smartFilterOptimized = vfo.optimize()!; // filters is now an optimized instance of SmartFilter
```

One caveat is that a fragment shader has a limited number of samplers it can use, so we shouldn't merge blocks (even if they're compatible) once we've reached this limit. You should normally use the current GPU limit, so keep `forceMaxSamplersInFragmentShader` at 0 in the code above, to use the correct value for the GPU.

The second optimization is a texture analyzer that traverses the graph and recycles textures between blocks (where possible), in order to limit the total number of textures used by the graph. You can activate it as follows:

```typescript
const rtg = new RenderTargetGenerator(true); // true to minimize the number of textures created
const runtime = await filter.createRuntimeAsync(this.engine, rtg);
```

See the next section for details of how to create a runtime.

### Runtime

To keep a nice separation between edition time, resource management and render time, the filter itself cannot be rendered directly. In order to do so, a runtime needs to be created from the filter:

```typescript
const runtime = await smartFilter.createRuntimeAsync(engine);
```

_Note_ the same filter can be used across different runtimes.

The runtime contains the list of resources required to render the filter like (intermediate textures, shaders and buffers). It is also owning a Command buffer containing the list of all the actions required to display the filter.

For instance the content of the command buffer for the simplest filter would be:

```
----- Command buffer commands -----
    Owner: OutputBlock (output) - Command: OutputBlock.render
-----------------------------------
```

Whereas the one of a complex one could look like:

```
----- Command buffer commands -----
    Owner: DirectionalBlurBlock (blurIV) - Command: DirectionalBlurBlock.render
    Owner: DirectionalBlurBlock (blurIH) - Command: DirectionalBlurBlock.render
    Owner: DirectionalBlurBlock (blurV) - Command: DirectionalBlurBlock.render
    Owner: DirectionalBlurBlock (blurH) - Command: DirectionalBlurBlock.render
    Owner: BlackAndWhiteBlock (blackAndWhite) - Command: BlackAndWhiteBlock.render
    Owner: FrameBlock (frame) - Command: FrameBlock.renderToCanvas
-----------------------------------
```

The command buffer is accessible through the runtime for debugging and logging purpose. The list of command could therefore be extended with custom ones if necessary of be parsed for introspection purpose as we do in our [logger](./src/command/commandBufferDebugger.ts).

Rendering the current runtime is as simple as `runtime.render();`.

_Note_ The runtime should be disposed once it is not used anymore to free the GPU memory and prevent leaks.

## A few core Principles

The overall system is trying at best to follow 3 simple rules:

-   Be CPU efficient: for instance, we are trying to be branchless in most of our commands and we try to keep the number of commands as low as possible.
-   Be memory efficient: no commands should allocate memory as it could trigger some garbage collection at the expense of frame loss.
-   Be GPU efficient: the graph and texture optimizers minimize the number of "passes" required to render an image and the GPU resources used by the graph.
