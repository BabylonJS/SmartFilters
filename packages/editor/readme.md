# Babylon.js Smart Filters

## Editor

The package contains a visual editor for Smart Filters - it is currently in prototype form, and is only consumed by the demo package.

## How to use

The editor can be open with the following code:

import { SmartFilterEditor } from "@babylonjs/smart-filters-editor";

```
    // Display the editor
    SmartFilterEditor.Show({
        engine,
        filter,
        onRuntimeCreated: (runtime: SmartFilterRuntime) => {
            renderer.setRuntime(runtime);
        },
    });
```

The only 2 required pieces of information for the editor are the Babylon Engine to create a runtime for as well as the filter to edit.

When editing, a new runtime will be created for each changes so it is the developer's responsibility to either discard or keep the previous one while rendering.
