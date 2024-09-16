import type { Effect } from "@babylonjs/core/Materials/effect";
import type { SmartFilter, IDisableableBlock, RuntimeData } from "@babylonjs/smart-filters";
import { ShaderBlock, ConnectionPointType, ShaderBinding, createStrongRef } from "@babylonjs/smart-filters";
import { BlockNames } from "../blockNames";
import { uniforms, shaderProgram } from "./particleBlock.shader";

/**
 * The shader bindings for the Particle block.
 */
export class ParticleShaderBinding extends ShaderBinding {
    private readonly _particleTexture: RuntimeData<ConnectionPointType.Texture>;
    private readonly _time: RuntimeData<ConnectionPointType.Float>;
    private readonly _delay: RuntimeData<ConnectionPointType.Float>;
    private readonly _width: RuntimeData<ConnectionPointType.Float>;
    private readonly _height: RuntimeData<ConnectionPointType.Float>;
    private readonly _amplitude: RuntimeData<ConnectionPointType.Float>;
    private readonly _frequency: RuntimeData<ConnectionPointType.Float>;

    /**
     * Creates a new shader binding instance for the Particle block.
     * @param parentBlock - The parent block
     * @param particleTexture - the Particle texture
     * @param time - the time
     * @param delay - the delay
     * @param width - the width of the particle
     * @param height - the height of the particle
     * @param amplitude - the amplitude of the oscillation on the X axis
     * @param frequency - the frequency of the oscillation on the X axis
     */
    constructor(
        parentBlock: IDisableableBlock,
        particleTexture: RuntimeData<ConnectionPointType.Texture>,
        time: RuntimeData<ConnectionPointType.Float>,
        delay: RuntimeData<ConnectionPointType.Float>,
        width: RuntimeData<ConnectionPointType.Float>,
        height: RuntimeData<ConnectionPointType.Float>,
        amplitude: RuntimeData<ConnectionPointType.Float>,
        frequency: RuntimeData<ConnectionPointType.Float>
    ) {
        super(parentBlock);
        this._particleTexture = particleTexture;
        this._time = time;
        this._delay = delay;
        this._width = width;
        this._height = height;
        this._amplitude = amplitude;
        this._frequency = frequency;
    }

    /**
     * Binds all the required data to the shader when rendering.
     * @param effect - defines the effect to bind the data to
     */
    public override bind(effect: Effect): void {
        super.bind(effect);
        effect.setTexture(this.getRemappedName(uniforms.particle), this._particleTexture.value);
        effect.setFloat(this.getRemappedName(uniforms.time), this._time.value);
        effect.setFloat(this.getRemappedName(uniforms.delay), this._delay.value);
        effect.setFloat2(this.getRemappedName(uniforms.size), this._width.value, this._height.value);
        effect.setFloat(this.getRemappedName(uniforms.amplitude), this._amplitude.value);
        effect.setFloat(this.getRemappedName(uniforms.frequency), this._frequency.value);
    }
}

/**
 * A simple procedural block to render one particle.
 */
export class ParticleBlock extends ShaderBlock {
    /**
     * The class name of the block.
     */
    public static override ClassName = BlockNames.particle;

    /**
     * The particle texture connection point.
     */
    public readonly particle = this._registerInput("particle", ConnectionPointType.Texture);

    /**
     * The time connection point.
     */
    public readonly time = this._registerInput("time", ConnectionPointType.Float, createStrongRef(0.0));

    /**
     * The delay connection point.
     */
    public readonly delay = this._registerOptionalInput("delay", ConnectionPointType.Float, createStrongRef(0.0));

    /**
     * The relative width of the particle, as a connection point.
     */
    public readonly width = this._registerOptionalInput("width", ConnectionPointType.Float, createStrongRef(1.0));

    /**
     * The relative height of the particle, as a connection point.
     */
    public readonly height = this._registerOptionalInput("height", ConnectionPointType.Float, createStrongRef(1.0));

    /**
     * The amplitude of the sinusoidal oscillation on the X axis, as a connection point.
     */
    public readonly amplitude = this._registerOptionalInput(
        "amplitude",
        ConnectionPointType.Float,
        createStrongRef(0.0)
    );

    /**
     * The frequency of the sinusoidal oscillation on the X axis, as a connection point.
     */
    public readonly frequency = this._registerOptionalInput(
        "frequency",
        ConnectionPointType.Float,
        createStrongRef(0.0)
    );

    /**
     * The shader program (vertex and fragment code) to use to render the block
     */
    public static override ShaderCode = shaderProgram;

    /**
     * Instantiates a new Block.
     * @param smartFilter - The smart filter this block belongs to
     * @param name - The friendly name of the block
     */
    constructor(smartFilter: SmartFilter, name: string) {
        super(smartFilter, name);
    }

    /**
     * Get the class instance that binds all the required data to the shader (effect) when rendering.
     * @returns The class instance that binds the data to the effect
     */
    public getShaderBinding(): ShaderBinding {
        const particle = this._confirmRuntimeDataSupplied(this.particle);
        const time = this._confirmRuntimeDataSupplied(this.time);
        const delay = this.delay.runtimeData;
        const width = this.width.runtimeData;
        const height = this.height.runtimeData;
        const amplitude = this.amplitude.runtimeData;
        const frequency = this.frequency.runtimeData;

        return new ParticleShaderBinding(this, particle, time, delay, width, height, amplitude, frequency);
    }
}
