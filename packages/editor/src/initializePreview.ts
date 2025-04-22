import { ThinEngine } from "@babylonjs/core/Engines/thinEngine.js";

export function initializePreview(canvas: HTMLCanvasElement): ThinEngine {
    const antialias = false;
    const engine = new ThinEngine(
        canvas,
        antialias,
        {
            stencil: false,
            depth: false,
            antialias,
            audioEngine: false,
            // Important to allow skip frame and tiled optimizations
            preserveDrawingBuffer: false,
            // Useful during debug to simulate WebGL1 devices (Safari)
            // disableWebGL2Support: true,
            premultipliedAlpha: false,
        },
        false
    );
    engine.getCaps().parallelShaderCompile = undefined;
    return engine;
}
