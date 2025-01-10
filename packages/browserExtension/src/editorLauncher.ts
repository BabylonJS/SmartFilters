import { Observable } from "@babylonjs/core/Misc/observable.js";
import type { SmartFilter } from "@babylonjs/smart-filters";
import { SmartFilterEditor } from "@babylonjs/smart-filters-editor";

const smartFilter = (window as any).currentSmartFilter;
const thinEngine = (window as any).thinEngine;
const beforeRenderObservable = new Observable<void>();

if (smartFilter) {
    // Display the editor
    SmartFilterEditor.Show({
        engine: thinEngine,
        filter: smartFilter,
        downloadSmartFilter: () => {},
        beforeRenderObservable,
        rebuildRuntime: (_smartFilter: SmartFilter) => {},
        reloadAssets: (_: SmartFilter) => {},
    });
}
