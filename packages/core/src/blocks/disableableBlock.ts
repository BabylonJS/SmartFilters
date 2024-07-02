import type { SmartFilter } from "../smartFilter";
import type { ConnectionPoint } from "../connection/connectionPoint";

import { BaseBlock } from "../blocks/baseBlock";
import { ConnectionPointType } from "../connection/connectionPointType";
import { createStrongRef } from "../runtime/strongRef";

/**
 * The interface that describes the disableable block.
 */
export interface IDisableableBlock {
    /**
     * The disabled connection point of the block.
     */
    disabled: ConnectionPoint<ConnectionPointType.Boolean>;
}

/**
 * A block that can be disabled.
 */
export class DisableableBlock extends BaseBlock implements IDisableableBlock {
    /**
     * The disabled connection point of the block.
     */
    public readonly disabled = this._registerOptionalInput(
        "disabled",
        ConnectionPointType.Boolean,
        createStrongRef(false)
    );

    /**
     * Instantiates a new block.
     * @param smartFilter - Defines the smart filter the block belongs to
     * @param name - Defines the name of the block
     * @param disableOptimization - Defines if the block should not be optimized (default: false)
     */
    constructor(
        smartFilter: SmartFilter,
        name: string,
        disableOptimization = false
    ) {
        super(smartFilter, name, disableOptimization);
    }
}
