import { ThinEngine } from "@babylonjs/core/Engines/thinEngine";
import { Constants } from "@babylonjs/core/Engines/constants";
import "@babylonjs/core/Engines/Extensions/engine.alpha.js";

export function createThinEngine(canvas: HTMLCanvasElement) {
    const antialias = true;
    const engine = new ThinEngine(
        canvas,
        antialias,
        {
            alpha: false,
            stencil: false,
            depth: false,
            antialias,
            audioEngine: false,
            // Important to allow skip frame and tiled optimizations
            preserveDrawingBuffer: false,
            // Useful during debug to simulate WebGL1 devices (Safari)
            // disableWebGL2Support: true,
        },
        false
    );
    engine.setAlphaMode(Constants.ALPHA_COMBINE); // ThinEngine default isn't ALPHA_COMBINE
    return engine;
}
