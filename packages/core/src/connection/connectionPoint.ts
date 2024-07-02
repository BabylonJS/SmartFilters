import type { Nullable } from "@babylonjs/core/types";
import {
    ConnectionPointCompatibilityState,
    getCompatibilityIssueMessage,
} from "./connectionPointCompatibilityState.js";
import { ConnectionPointDirection } from "./connectionPointDirection.js";
import type { BaseBlock } from "../blocks/baseBlock";
import type { ConnectionPointType, ConnectionPointValue } from "./connectionPointType";
import type { StrongRef } from "../runtime/strongRef";

/**
 * This represents a strong reference to the data being passed through a connection point.
 */
export type RuntimeData<U extends ConnectionPointType> = StrongRef<ConnectionPointValue<U>>;

/**
 * This defines a connection point.
 *
 * A connection point is any input/output of a block.
 * It can be linked to another connection point following some rules:
 *  - The type of the connection point must be compatible with the other one.
 *  - The direction of the connection point must be different from the other one.
 *  - The connection cannot create a cycle in the list of blocks.
 * The relationship is always 1:N for input:output
 */
export class ConnectionPoint<U extends ConnectionPointType = ConnectionPointType> {
    /**
     * The name of the connection point.
     * This is used to identify the connection point inside a block.
     */
    public readonly name: string;

    /**
     * The type of the connection point (float, texture, etc.)
     */
    public readonly type: U;

    /**
     * The direction of the connection point (input or output)
     */
    public readonly direction: ConnectionPointDirection;

    /**
     * The smart filter block the connection point belongs to.
     */
    public readonly ownerBlock: BaseBlock;

    /**
     * User provided name for the connection point.
     */
    public displayName: Nullable<string> = null;

    /**
     * The @see RunTimeData used during the init phase to reference the result of the previous block.
     * Those are only used for input connection points.
     * The previous block are "pushing" this in during the init stage.
     */
    public runtimeData: Nullable<RuntimeData<U>> = null;

    /**
     * The default runtimeData used when no connection is made to the connection point.
     */
    public readonly defaultRuntimeData: Nullable<RuntimeData<U>> = null;

    private _connectedTo: Nullable<ConnectionPoint<U>> = null;
    private _endpoints: Array<ConnectionPoint<U>> = [];

    /**
     * Create a new connection point.
     * @param name - The name the connection point has in the block
     * @param ownerBlock - The block the connection point belongs to
     * @param type - The type of the connection point
     * @param direction - The direction of the connection point
     * @param defaultRuntimeData - The default runtime data to use when no connection is made to the connection point
     */
    constructor(
        name: string,
        ownerBlock: BaseBlock,
        type: U,
        direction: ConnectionPointDirection,
        defaultRuntimeData: Nullable<RuntimeData<U>> = null
    ) {
        this.name = name;
        this.ownerBlock = ownerBlock;
        this.type = type;
        this.direction = direction;
        this.defaultRuntimeData = defaultRuntimeData;
        this.runtimeData = defaultRuntimeData;
    }

    /**
     * @returns the connection point this connection point is connected to.
     * (the one on the other side of the connection)
     * Only input connection points have a connected point which they received their value from.
     * (Relation is always 1:N for input:output)
     */
    public get connectedTo(): Nullable<ConnectionPoint<U>> {
        return this._connectedTo;
    }

    /**
     * @returns the connection point this connection point is to.
     * (the one on the other side of the connection)
     * Only output connection points have a list of endpoints which they provide their value to.
     * (Relation is always 1:N for input:output)
     */
    public get endpoints(): ReadonlyArray<ConnectionPoint<U>> {
        return this._endpoints;
    }

    /**
     * Gets a state indicating if the current point can be connected to another point
     * @param other - defines the other connection point
     * @returns the compatibility state
     */
    public checkCompatibilityState(other: ConnectionPoint<U>): ConnectionPointCompatibilityState {
        // Only connects output to input
        if (this.direction === ConnectionPointDirection.Input) {
            return other.checkCompatibilityState(this);
        }

        // Check types
        if (this.type !== other.type) {
            return ConnectionPointCompatibilityState.TypeIncompatible;
        }

        // Check directions
        if (this.direction === other.direction) {
            return ConnectionPointCompatibilityState.DirectionIncompatible;
        }

        // Check hierarchy
        if (other.ownerBlock.isAnAncestorOf(this.ownerBlock)) {
            return ConnectionPointCompatibilityState.HierarchyIssue;
        }

        return ConnectionPointCompatibilityState.Compatible;
    }

    /**
     * Checks if the connection point can be connected to another one.
     * @param connectionPoint - The other connection point to check compatibility with
     * @returns true if the connection point can be connected to the other one
     */
    public canConnectTo(connectionPoint: ConnectionPoint<U>) {
        return this.checkCompatibilityState(connectionPoint) === ConnectionPointCompatibilityState.Compatible;
    }

    /**
     * Connect this connection point to another one.
     * @param other - The other connection point to connect to
     * @throws if the connection point cannot be connected to the other one
     */
    public connectTo(other: ConnectionPoint<U>): void {
        // Only connects output to input
        if (this.direction === ConnectionPointDirection.Input) {
            other.connectTo(this);
            return;
        }

        // Check compatibility
        const compatibility = this.checkCompatibilityState(other);
        if (compatibility !== ConnectionPointCompatibilityState.Compatible) {
            throw getCompatibilityIssueMessage(compatibility);
        }

        // Adds the connection point to the list of endpoints
        this._endpoints.push(other);
        // Fill at the same time the connectedTo property of the other connection point
        other._connectedTo = this;
    }

    /**
     * Disconnects this point from one of his endpoint
     * @param endpoint - defines the other connection point
     */
    public disconnectFrom(endpoint: ConnectionPoint<U>): void {
        const index = this._endpoints.indexOf(endpoint);
        if (index === -1) {
            return;
        }

        // Remove the connection point from the list of endpoints
        this._endpoints.splice(index, 1);
        // Empty at the same time the connectedTo property of the other connection point
        endpoint._connectedTo = null;
    }

    /**
     * Disconnects this point from all its endpoints.
     */
    public disconnectAllEndpoints(): void {
        // Detach outputs
        let endpoint: ConnectionPoint<U> | undefined;
        while ((endpoint = this._endpoints[0])) {
            this.disconnectFrom(endpoint);
        }
    }

    /**
     * Propagates the current runtime data to all endpoints.
     */
    public propagateRuntimeData(): void {
        if (!this.runtimeData) {
            this.runtimeData = {} as RuntimeData<U>;
        }

        for (const endpoint of this.endpoints) {
            endpoint.runtimeData = this.runtimeData;
        }
    }
}
