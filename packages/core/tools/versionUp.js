import * as fs from "fs";
import { exec } from "child_process";
import { determineVersion } from "./determineVersion.js";

exec("npm view @babylonjs/smart-filters dist-tags.preview", (err, stdout) => {
    let npmVersion = null;
    if (err?.message && err.message.indexOf("E404") !== -1) {
        console.warn("NPM registry does not have a preview version.");
    } else if (err) {
        console.error(err);
        throw err;
    } else {
        npmVersion = stdout;
    }

    console.log("Current NPM Registry version:", npmVersion);
    const packageText = fs.readFileSync("package.json");
    const packageJSON = JSON.parse(packageText);
    console.log("Current package.json version:", packageJSON.version);

    let versionToUse = determineVersion(npmVersion, packageJSON.version);
    console.log("Version to use:", versionToUse);

    packageJSON.version = versionToUse;
    //fs.writeFileSync("package.json", JSON.stringify(packageJSON, null, 4));
    console.log("Version updated in package.json");
});
