/**
 * Interface for objects that can monitor changes to the set of connections.
 */
export interface IMonitorConnectionChanges {
    /**
     * Called when the set of connections changes.
     */
    onConnectionsChanged(): void;
}

/**
 * Tries to convert an object to IMonitorConnectionChanges, returning undefined if unable to
 * @param obj - The object to convert
 * @returns IMonitorConnectionChanges | undefined
 */
export function asIMonitorConnectionChanges(obj: any): IMonitorConnectionChanges | undefined {
    if (obj && typeof (obj as IMonitorConnectionChanges).onConnectionsChanged === "function") {
        return obj as IMonitorConnectionChanges;
    }
    return undefined;
}
