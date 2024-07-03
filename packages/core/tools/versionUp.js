import * as fs from "fs";
import { exec } from "child_process";
import { determineVersion, getNpmVersion } from "./determineVersion.js";

exec("npm view @babylonjs/smart-filters dist-tags.preview", (err, stdout) => {
    const alpha = true;

    const packageText = fs.readFileSync("package.json");
    const packageJSON = JSON.parse(packageText);

    let npmVersion = getNpmVersion(err, stdout);

    console.log("Current NPM Registry version:", npmVersion);
    console.log("Current package.json version:", packageJSON.version);

    let versionToUse = determineVersion(npmVersion, packageJSON.version, alpha);

    console.log("Version to use:", versionToUse);

    if (packageJSON.version !== versionToUse) {
        packageJSON.version = versionToUse;
        fs.writeFileSync("package.json", JSON.stringify(packageJSON, null, 4));
        console.log("Version updated in package.json");
    } else {
        console.log("No need to update package.json");
    }
});
