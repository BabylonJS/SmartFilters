import { SmartFilterEditor } from "@babylonjs/smart-filters-editor";

const smartFilter = (window as any).currentSmartFilter;
const thinEngine = (window as any).thinEngine;

if (smartFilter) {
    console.log("A SmartFilter was found in this document, launching the editor");
    // Display the editor
    SmartFilterEditor.Show({
        engine: thinEngine,
        filter: smartFilter,
    });
} else {
    console.log("No SmartFilter was found in this document");
}
