function majorAndMinorVersionsMatch(version1, version2) {
    const version1split = version1.split(".");
    const version2split = version2.split(".");
    return version1split[0] === version2split[0] && version1split[1] === version2split[1];
}

function incrementPatchVersion(version) {
    const spl = version.split(".");
    spl[spl.length - 1]++;
    return spl.join(".");
}

export function determineVersion(npmVersion, packageJSONVersion) {
    let versionToUse;
    if (npmVersion === null || !majorAndMinorVersionsMatch(npmVersion, packageJSONVersion)) {
        console.log("Major & minor versions do not match: using the current package.json version");
        versionToUse = packageJSONVersion;
    } else {
        console.log("Major & minor versions match: using the NPM registry version with an incremented patch version.");
        versionToUse = incrementPatchVersion(npmVersion);
    }
    return versionToUse;
}
