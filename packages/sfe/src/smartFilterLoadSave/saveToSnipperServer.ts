import { type SmartFilter, SmartFilterSerializer } from "@babylonjs/smart-filters";
import { getSnippet, setSnippet } from "./hashFunctions.js";
import { SnippetUrl } from "./constants.js";

/**
 * Saves the provided SmartFilter to the snippet server
 * @param smartFilter - SmartFilter to save
 */
export async function saveToSnippetServer(smartFilter: SmartFilter): Promise<void> {
    const serializerModule = await import(
        /* webpackChunkName: "serializers" */ "@babylonjs/smart-filters-blocks/dist/blockRegistration/blockSerializers.js"
    );
    const serializer = new SmartFilterSerializer(
        serializerModule.blocksUsingDefaultSerialization,
        serializerModule.additionalBlockSerializers
    );

    const smartFilterJson = JSON.stringify(serializer.serialize(smartFilter));

    const dataToSend = {
        payload: JSON.stringify({
            smartFilter: smartFilterJson,
        }),
        name: "",
        description: "",
        tags: "",
    };

    const [snippetToken] = getSnippet();

    const response = await fetch(`${SnippetUrl}/${snippetToken || ""}`, {
        method: "POST",
        headers: {
            // eslint-disable-next-line @typescript-eslint/naming-convention
            "Content-Type": "application/json",
        },
        body: JSON.stringify(dataToSend),
    });

    if (!response.ok) {
        throw new Error(`Could not save snippet: ${response.statusText}`);
    }

    const snippet = await response.json();

    // Update the location hash to trigger a hashchange event
    setSnippet(snippet.id, snippet.version);
}
