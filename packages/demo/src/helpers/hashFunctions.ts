// Constants
const DELIMITER = "#"; // TODO: Pick another delimiter?

/**
 * Extracts the snippet info from the URL hash.
 * @returns The snippet token and version from the URL hash as an array.
 */
export function getSnippet() {
    const [snippetToken, version] = location.hash.substring(1).split(DELIMITER);
    return [snippetToken, version];
}

/**
 * Set the snippet info in the URL hash.
 * @param snippetToken - Snippet token to set
 * @param version - Version of the snippet to set
 */
export function setSnippet(snippetToken: string, version: string | undefined) {
    let newHash = snippetToken;
    if (version && version != "0") {
        newHash += DELIMITER + version;
    }
    location.hash = newHash;
}
