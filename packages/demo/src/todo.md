# To Do

1. BUG: use texture input, change, create new texture input, use it - new one is disposed
1. Serialization system
    - Add "save" ui to editor
    - Add serializers / deserializers for all demo blocks
    - Editor metadata
    - Use async functions where necessary so blocks can be loaded in separate chunks if desired in the future (e.g. when looking for an "extension" for a block type "foo" - getFooExtension() should be async)
1. Move shader code out into .glsl files
    - Look up run-p approach used in Babylon.js repo
    - .ts files are .gitignored
    - Trick: no extension in the import statement
1. Ressurect smart filter with frame, blur, and video
1. Move editor code into another chunk and confirm blocks are now delay loaded by the deserializer (also move hardcoded SFs into another chunk)
1. Consider: move into another project out of the repo (need to publish editor)
