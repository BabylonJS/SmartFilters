import type { ConnectionPoint } from "../connection/connectionPoint";
import type { ConnectionPointType } from "../connection/connectionPointType";

import { BaseBlock } from "../blocks/baseBlock.js";

/**
 * The aggregate block class is the base class for all blocks that be created from other blocks.
 *
 * It is responsible for managing a hidden chain of smart filter blocks in order and expose them through
 * its own connection points.
 *
 * The internal state is basically a filter itself.
 */
export abstract class AggregateBlock extends BaseBlock {
    /**
     * The class name of the block.
     */
    public static override ClassName = "AggregateBlock";

    /**
     * The list of relationships between the internal graph output and the outside ones.
     */
    private readonly _aggregatedOutputs: [ConnectionPoint, ConnectionPoint][] = [];

    /**
     * The list of relationships between the internal graph inputs and the outside ones.
     */
    private readonly _aggregatedInputs: [ConnectionPoint, ConnectionPoint][] = [];

    /**
     * @internal
     * Merges the internal graph into the SmartFilter
     */
    public _mergeIntoSmartFilter(mergedAggregateBlocks: AggregateBlock[]): void {
        // Rewire output connections
        for (const [internalConnectionPoint, externalConnectionPoint] of this._aggregatedOutputs) {
            const endpointsToConnectTo = externalConnectionPoint.endpoints.slice();
            externalConnectionPoint.disconnectAllEndpoints();
            for (const endpoint of endpointsToConnectTo) {
                internalConnectionPoint.connectTo(endpoint);
            }
        }

        // Rewire input connections
        for (const [internalConnectionPoint, externalConnectionPoint] of this._aggregatedInputs) {
            const connectedToExternalConnectionPoint = externalConnectionPoint.connectedTo;
            if (connectedToExternalConnectionPoint) {
                connectedToExternalConnectionPoint.disconnectFrom(externalConnectionPoint);
                connectedToExternalConnectionPoint.connectTo(internalConnectionPoint);
            }
        }

        // Tell any internal aggregate blocks to merge
        // Must be done after the inputs and outputs were merged at our level, or the internal aggregate block may not be wired up to anything
        for (const aggregateOutput of this._aggregatedOutputs) {
            const internalConnectionPoint = aggregateOutput[0];
            internalConnectionPoint.ownerBlock.visit({}, (block: BaseBlock, _extraData: Object) => {
                if (block instanceof AggregateBlock) {
                    block._mergeIntoSmartFilter(mergedAggregateBlocks);
                }
            });
        }

        // Add ourselves to the list of merged aggregate blocks
        mergedAggregateBlocks.push(this);
    }

    /**
     * @internal
     * Undoes a previous mergeIntoSmartFilter call.
     */
    public _unmergeFromSmartFilter(): void {
        for (const [internalConnectionPoint, externalConnectionPoint] of this._aggregatedOutputs) {
            const endpointsToConnectTo = internalConnectionPoint.endpoints.slice();
            internalConnectionPoint.disconnectAllEndpoints();
            for (const endpoint of endpointsToConnectTo) {
                externalConnectionPoint.connectTo(endpoint);
            }
        }

        for (const [internalConnectionPoint, externalConnectionPoint] of this._aggregatedInputs) {
            const connectedToInternalConnectionPoint = internalConnectionPoint.connectedTo;
            if (connectedToInternalConnectionPoint) {
                connectedToInternalConnectionPoint.disconnectFrom(internalConnectionPoint);
                connectedToInternalConnectionPoint.connectTo(externalConnectionPoint);
            }
        }
    }

    /**
     * Registers an input connection from the internal graph as an input of the aggregated graph.
     * @param name - The name of the exposed input connection point
     * @param internalConnectionPoint - The input connection point in the inner graph to expose as an input on the aggregate block
     * @returns the connection point referencing the input block
     */
    protected _registerSubfilterInput<U extends ConnectionPointType>(
        name: string,
        internalConnectionPoint: ConnectionPoint<U>
    ): ConnectionPoint<U> {
        const externalInputConnectionPoint = this._registerInput(name, internalConnectionPoint.type);

        this._aggregatedInputs.push([internalConnectionPoint, externalInputConnectionPoint]);
        return externalInputConnectionPoint;
    }

    /**
     * Registers an output connection point from the internal graph as an output of the aggregated graph.
     * @param name - The name of the exposed output connection point
     * @param internalConnectionPoint - The output connection point in the inner graph to expose as an output on the aggregate block
     * @returns the connection point referencing the output connection point
     */
    protected _registerSubfilterOutput<U extends ConnectionPointType>(
        name: string,
        internalConnectionPoint: ConnectionPoint<U>
    ): ConnectionPoint<U> {
        const externalOutputConnectionPoint = this._registerOutput(name, internalConnectionPoint.type);

        this._aggregatedOutputs.push([internalConnectionPoint, externalOutputConnectionPoint]);
        return externalOutputConnectionPoint;
    }
}
