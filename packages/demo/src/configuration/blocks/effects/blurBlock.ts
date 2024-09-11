import type { ConnectionPoint, ConnectionPointType } from "@babylonjs/smart-filters";
import { AggregateBlock, SmartFilter } from "@babylonjs/smart-filters";

import { DirectionalBlurBlock } from "./directionalBlurBlock";
import { BlockNames } from "../blockNames";

const defaultBlurTextureRatioPerPass = 0.5;
const defaultBlurSize = 2;

/**
 * A block performing a blur on the input texture.
 *
 * It performs the blur in 4 consecutive passes, 2 verticals and 2 horizontals downsizing the texture as we go.
 */
export class BlurBlock extends AggregateBlock {
    /**
     * The class name of the block.
     */
    public static override ClassName = BlockNames.blur;

    /**
     * The input texture connection point.
     */
    public readonly input: ConnectionPoint<ConnectionPointType.Texture>;

    /**
     * The output blurred texture connection point.
     */
    public readonly output: ConnectionPoint<ConnectionPointType.Texture>;

    /**
     * Defines how smaller we should make the texture between the 2 consecutive bi lateral passes.
     */
    public blurTextureRatioPerPass = defaultBlurTextureRatioPerPass;

    /**
     * Defines how far the kernel might fetch the data from.
     */
    public blurSize = defaultBlurSize;

    private readonly _intermediateBlurV: DirectionalBlurBlock;
    private readonly _intermediateBlurH: DirectionalBlurBlock;
    private readonly _finalBlurV: DirectionalBlurBlock;
    private readonly _finalBlurH: DirectionalBlurBlock;

    /**
     * Instantiates a new Block.
     * @param smartFilter - The smart filter this block belongs to
     * @param name - The friendly name of the block
     */
    constructor(smartFilter: SmartFilter, name: string) {
        super(smartFilter, name);

        const internalFilter = new SmartFilter(name + "_BlurBlock_Aggregated");
        this._intermediateBlurV = new DirectionalBlurBlock(internalFilter, name + "IV");
        this._intermediateBlurH = new DirectionalBlurBlock(internalFilter, name + "IH");
        this._finalBlurV = new DirectionalBlurBlock(internalFilter, name + "V");
        this._finalBlurH = new DirectionalBlurBlock(internalFilter, name + "H");

        this._intermediateBlurV.output.connectTo(this._intermediateBlurH.input);
        this._intermediateBlurH.output.connectTo(this._finalBlurV.input);
        this._finalBlurV.output.connectTo(this._finalBlurH.input);

        this.input = this._registerSubfilterInput("input", this._intermediateBlurV.input);
        this.output = this._registerSubfilterOutput("output", this._finalBlurH.output);

        this._intermediateBlurV.blurTextureRatio = this.blurTextureRatioPerPass;
        this._intermediateBlurV.blurHorizontalWidth = this.blurSize;
        this._intermediateBlurV.blurVerticalWidth = 0;

        this._intermediateBlurH.blurTextureRatio = this.blurTextureRatioPerPass;
        this._intermediateBlurH.blurHorizontalWidth = 0;
        this._intermediateBlurH.blurVerticalWidth = this.blurSize;

        this._finalBlurV.blurTextureRatio = this.blurTextureRatioPerPass * this.blurTextureRatioPerPass;
        this._finalBlurV.blurHorizontalWidth = this.blurSize;
        this._finalBlurV.blurVerticalWidth = 0;

        this._finalBlurH.blurTextureRatio = this.blurTextureRatioPerPass * this.blurTextureRatioPerPass;
        this._finalBlurH.blurHorizontalWidth = 0;
        this._finalBlurH.blurVerticalWidth = this.blurSize;
    }
}
