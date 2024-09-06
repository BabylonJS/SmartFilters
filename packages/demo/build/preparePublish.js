import * as fs from "fs";

const corePackageText = fs.readFileSync("../core/package.json");
const corePackageJSON = JSON.parse(corePackageText.toString());

let versionFileContents = fs.readFileSync("./www/version.json");
console.log("Setting version to display to the core version:", corePackageJSON.version);

versionFileContents = versionFileContents.replace("Locally Built", `Version: ${corePackageJSON.version}`);

console.log("Saving changes to version.json");
fs.writeFileSync("./www/version.json", versionFileContents);
