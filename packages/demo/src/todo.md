# To Do

1. BUG: use texture input, change, create new texture input, use it - new one is disposed
1. Serialization system
    - Add "save" ui to editor
    - Add serializers / deserializers for all demo blocks
    - Use async functions where necessary so blocks can be loaded in separate chunks if desired in the future (e.g. when looking for an "extension" for a block type "foo" - getFooExtension() should be async)
1. Move shader code out into .glsl files
    - Look up run-p approach used in Babylon.js repo
    - .ts files are .gitignored
    - Trick: no extension in the import statement
