import * as fs from "fs";

const corePackageText = fs.readFileSync("../core/package.json");
const corePackageJSON = JSON.parse(corePackageText.toString());

const editorPackageText = fs.readFileSync("package.json");
const editorPackageJSON = JSON.parse(editorPackageText.toString());

console.log("Setting editor package version to match core package version:", corePackageJSON.version);
editorPackageJSON.version = corePackageJSON.version;

console.log("Adding dependency on core package to editor package");
if (!editorPackageJSON.dependencies) {
    editorPackageJSON.dependencies = {};
}
editorPackageJSON.dependencies["@babylonjs/core"] = corePackageJSON.version;

console.log("Saving changes to editor package.json");
fs.writeFileSync("package.json", JSON.stringify(editorPackageJSON, null, 4));
