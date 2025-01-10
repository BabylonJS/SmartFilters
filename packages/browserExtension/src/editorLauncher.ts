import type { SmartFilter } from "@babylonjs/smart-filters";
import { SmartFilterEditor } from "@babylonjs/smart-filters-editor";

const smartFilter = (window as any).currentSmartFilter;
const thinEngine = (window as any).thinEngine;

if (smartFilter) {
    // Display the editor
    SmartFilterEditor.Show({
        engine: thinEngine,
        filter: smartFilter,
        rebuildRuntime: (_smartFilter: SmartFilter) => {},
        reloadAssets: (_: SmartFilter) => {},
    });
}
