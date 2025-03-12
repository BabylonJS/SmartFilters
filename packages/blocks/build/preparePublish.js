/* eslint-disable no-console */
import * as fs from "fs";

const corePackageText = fs.readFileSync("../core/package.json");
const corePackageJSON = JSON.parse(corePackageText.toString());

const blocksPackageText = fs.readFileSync("package.json");
const blocksPackageJSON = JSON.parse(blocksPackageText.toString());

console.log("Setting blocks package version to match core package version:", corePackageJSON.version);
blocksPackageJSON.version = corePackageJSON.version;

console.log("Adding dependency on core package to blocks package");
if (!blocksPackageJSON.dependencies) {
    blocksPackageJSON.dependencies = {};
}
blocksPackageJSON.dependencies["@babylonjs/smart-filters"] = corePackageJSON.version;

console.log("Saving changes to blocks package.json");
fs.writeFileSync("package.json", JSON.stringify(blocksPackageJSON, null, 4));
