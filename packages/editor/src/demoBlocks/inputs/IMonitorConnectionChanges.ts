export interface IMonitorConnectionChanges {
    onConnectionsChanged(): void;
}

export function asIMonitorConnectionChanges(obj: any): IMonitorConnectionChanges | undefined {
    if (obj && typeof (obj as IMonitorConnectionChanges).onConnectionsChanged === "function") {
        return obj as IMonitorConnectionChanges;
    }
    return undefined;
}
