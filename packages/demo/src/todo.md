# To Do

1. Default images
    - Pass in list of texture images to editor (not baked in)
    - Displayed as dropdown under Upload button
1. BUG: use texture input, change, create new texture input, use it - new one is disposed
1. Serialization system
    - Each block should come with serialize / deserialize / editor "extensions" (note that you should be able to include deserialize without the others)
    - Consider naming convention:
        - fooBlock.ts
        - fooBlock.glsl
        - fooBlock.editor.ts
        - fooBlock.serialize.ts
        - fooBlock.deserialize.ts
    - Change how demo blocks are registered in editor - they should use the "extension" approach and be passed in
    - Serializer / deserializer should take in list of "extensions" for all of the block types it should be expected to handle
        - It should throw if it encounters a block type without a registered "extension"
    - Use async functions where necessary so blocks can be loaded in separate chunks if desired in the future (e.g. when looking for an "extension" for a block type "foo" - getFooExtension() should be async)
1. Add smart filter registration system to demo app
    - Should support either serialized or hard coded smart filters
    - Should populate demo UI which allows switching between them
    - Demo app should persist which is selected so it survives page refreshes (e.g. during block development dev inner loop)
1. Move shader code out into .glsl files
    - Look up run-p approach used in Babylon.js repo
    - .ts files are .gitignored
    - Trick: no extension in the import statement
