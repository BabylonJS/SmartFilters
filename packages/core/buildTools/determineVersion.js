/**
 * Determines if the major and minor versions of two semver strings match
 * @param version1 - The first semver string
 * @param version2 - The second semver string
 * @returns True if the major and minor versions match, false otherwise
 */
function majorAndMinorVersionsMatch(version1, version2) {
    const version1split = version1.split(".");
    const version2split = version2.split(".");
    return version1split[0] === version2split[0] && version1split[1] === version2split[1];
}

/**
 * Takes in a semver string (e.g. "0.1.0") and increments the patch version.
 * Note: it does not preserve any prerelease flags in the patch version.
 * @param version - The semver string to operate on
 * @returns The incremented version string
 */
function incrementPatchVersion(version) {
    const spl = version.split(".");
    spl[spl.length - 1] = Number.parseInt(spl[spl.length - 1]) + 1;
    return spl.join(".");
}

/**
 * Takes in a semver string (e.g. "0.1.0" or "0.1.0-alpha") and removes any prerelease flag.
 * @param version - The semver string to operate on
 * @returns The version string with the prerelease flag removed
 */
export function removePrereleaseFlags(version) {
    const spl = version.split(".");
    spl[spl.length - 1] = Number.parseInt(spl[spl.length - 1]);
    return spl.join(".");
}

/**
 * Given the npmVersion, packageJSONVersion, and alpha flag, determines the version to use
 * @param npmVersion - The version from the NPM registry
 * @param packageJSONVersion - The version from the package.json file
 * @param alpha - A flag to indicate if the version should have an alpha prerelease flag
 * @returns The version to use
 */
export function determineVersion(npmVersion, packageJSONVersion, alpha) {
    packageJSONVersion = removePrereleaseFlags(packageJSONVersion);
    npmVersion = npmVersion === null ? null : removePrereleaseFlags(npmVersion);

    let versionToUse;
    if (npmVersion === null || !majorAndMinorVersionsMatch(npmVersion, packageJSONVersion)) {
        console.log("Major & minor versions do not match: using the current package.json version");
        versionToUse = packageJSONVersion;
    } else {
        console.log("Major & minor versions match: using the NPM registry version with an incremented patch version.");
        versionToUse = incrementPatchVersion(npmVersion);
    }

    if (alpha) {
        console.log("Ensuring -alpha prerelease flag is present");
        versionToUse += "-alpha";
    }

    return versionToUse;
}

/**
 * Parses the npm view results to get the version of the package
 * @param err - The error object
 * @param stdout - The stdout string
 * @returns The version of the package
 */
export function getNpmVersion(err, stdout) {
    let npmVersion = null;
    if (err?.message && err.message.indexOf("E404") !== -1) {
        console.warn("NPM registry does not have a preview version.");
    } else if (err) {
        console.error(err);
        throw err;
    } else {
        npmVersion = stdout;
    }
    return npmVersion;
}
