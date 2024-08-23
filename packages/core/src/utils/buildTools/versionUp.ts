import * as fs from "fs";
import { exec, type ExecException } from "child_process";
import { determineVersion, getNpmVersion } from "./determineVersion.js";
import type { Nullable } from "@babylonjs/core/types.js";

const alpha = process.argv.includes("--alpha");
const packageText = fs.readFileSync("package.json");
const packageJSON = JSON.parse(packageText.toString());

const packageName = packageJSON.name;
console.log("Processing package:", packageName);
console.log("Alpha flag:", alpha);
console.log("Current package.json version:", packageJSON.version);
console.log("Querying NPM Registry for last published version...");
exec(`npm view ${packageName} dist-tags.preview`, (err: Nullable<ExecException>, stdout) => {
    const npmVersion = getNpmVersion(err, stdout);

    console.log("Current NPM Registry version:", npmVersion);

    const versionToUse = determineVersion(npmVersion, packageJSON.version, alpha);

    console.log("Version to use:", versionToUse);

    if (packageJSON.version !== versionToUse) {
        packageJSON.version = versionToUse;
        fs.writeFileSync("package.json", JSON.stringify(packageJSON, null, 4));
        console.log("Version updated in package.json");
    } else {
        console.log("No need to update package.json");
    }
});
