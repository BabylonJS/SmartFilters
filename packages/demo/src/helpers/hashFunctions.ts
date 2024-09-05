// Constants
const DELIMITER = "#"; // TODO: Pick another delimiter?
const SAFARI_DELIMITER = "%23";
const HASH_REGEX = new RegExp(`^${DELIMITER}([A-Za-z\\d]+)(${DELIMITER}|${SAFARI_DELIMITER})?([\\d]+)?$`);

/**
 * Extracts the snippet info from the URL hash and cleans it up for consistency.
 * @returns The snippet token and version from the URL hash as an array.
 */
export function getSnippet() {
    let snippetToken = "";
    let version = undefined;

    const match = location.hash.match(HASH_REGEX);
    if (match) {
        snippetToken = match[1]!; // Should always be defined
        version = match[3]; // May be undefined-- that's okay

        // Clean up the hash, if necessary
        const usingSafariDelimiter = match[2] === SAFARI_DELIMITER;
        const delimiterWithoutVersion = match[2] && !version;
        const versionIsZero = version === "0";
        if (usingSafariDelimiter || delimiterWithoutVersion || versionIsZero) {
            setSnippet(snippetToken, version, false);
        }
    }

    return [snippetToken, version];
}

/**
 * Set the snippet info in the URL hash.
 * @param snippetToken - Snippet token to set
 * @param version - Version of the snippet to set
 * @param allowHashChange - Whether to trigger a hash change event
 */
export function setSnippet(snippetToken: string, version: string | undefined, allowHashChange: boolean = true) {
    let newHash = snippetToken;
    if (version && version != "0") {
        newHash += DELIMITER + version;
    }

    if (allowHashChange) {
        location.hash = newHash;
    } else {
        history.replaceState(null, "", window.location.pathname + DELIMITER + newHash);
    }
}
