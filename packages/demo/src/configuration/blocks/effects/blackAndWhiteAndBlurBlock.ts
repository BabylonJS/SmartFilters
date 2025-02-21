import type { ConnectionPoint, ConnectionPointType } from "@babylonjs/smart-filters";
import { AggregateBlock, SmartFilter } from "@babylonjs/smart-filters";

import { BlackAndWhiteBlock } from "./blackAndWhiteBlock";
import { BlurBlock } from "./blurBlock";
import { BlockNames, BlockNamespaces } from "../blockNames";

/**
 * An example of an aggregate block that contains another aggregate block.
 */
export class BlackAndWhiteAndBlurBlock extends AggregateBlock {
    /**
     * The class name of the block.
     */
    public static override ClassName = BlockNames.blackAndWhiteAndBlur;

    /**
     * The namespace of the block.
     */
    public static override Namespace = BlockNamespaces.babylonDemoEffects;

    /**
     * The input texture connection point.
     */
    public readonly input: ConnectionPoint<ConnectionPointType.Texture>;

    /**
     * The output texture connection point.
     */
    public readonly output: ConnectionPoint<ConnectionPointType.Texture>;

    private readonly _blackAndWhiteBlock: BlackAndWhiteBlock;
    private readonly _blurBlock: BlurBlock;

    /**
     * Instantiates a new Block.
     * @param smartFilter - The smart filter this block belongs to
     * @param name - The friendly name of the block
     */
    constructor(smartFilter: SmartFilter, name: string) {
        super(smartFilter, name);

        const internalFilter = new SmartFilter(name + "_Nested_Aggregated");

        this._blackAndWhiteBlock = new BlackAndWhiteBlock(internalFilter, name + "_BW");
        this._blurBlock = new BlurBlock(internalFilter, name + "_Blur");

        this._blackAndWhiteBlock.output.connectTo(this._blurBlock.input);

        this.input = this._registerSubfilterInput("input", [this._blackAndWhiteBlock.input]);
        this.output = this._registerSubfilterOutput("output", this._blurBlock.output);
    }
}
