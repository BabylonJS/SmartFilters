# Babylon.js Smart Filters - PREVIEW

# PREVIEW WARNING

This package is currently in preview form, and updates will likely include breaking changes. It is not yet intended to be used by other projects.

## Editor

The package contains a visual editor for Smart Filters - it is currently in preview form, and will undergo significant, possibly breaking, changes before leaving preview.

## How to use

The editor can be open with the following code:

import { SmartFilterEditor } from "@babylonjs/smart-filters-editor";

```
    // Configure options
    const options: SmartFilterEditorOptions = {
        ... // See SmartFilterEditorOptions docstrings
    }

    // Display the editor
    SmartFilterEditor.Show(options);
```

The options provide the filter to display, information about the supported blocks, and callbacks for operations that must be implemented by the application hosting the application, such as rendering a newly created runtime, or loading and saving serialized versions of the Smart Filter.
