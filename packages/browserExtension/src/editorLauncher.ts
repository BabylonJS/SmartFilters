/* eslint-disable no-console */
import { SmartFilterEditorControl } from "@babylonjs/smart-filters-editor-control";

const smartFilter = (window as any).currentSmartFilter;
const thinEngine = (window as any).thinEngine;

if (smartFilter) {
    console.log("A SmartFilter was found in the page, launching the editor");
    // Display the editor
    SmartFilterEditorControl.Show({
        engine: thinEngine,
        filter: smartFilter,
    });
} else {
    console.log("No SmartFilter was found in the page");
}
