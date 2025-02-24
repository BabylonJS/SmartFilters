import { SmartFilterSerializer, type SmartFilter } from "@babylonjs/smart-filters";

/**
 * Serializes the provided smart filter to a JSON string.
 * @param smartFilter - The smart filter to serialize
 * @returns The serialized smart filter
 */
export async function serializeSmartFilter(smartFilter: SmartFilter): Promise<string> {
    const serializerModule = await import(
        /* webpackChunkName: "serializers" */ "@babylonjs/smart-filters-blocks/dist/blockRegistration/blockSerializers.js"
    );
    const serializer = new SmartFilterSerializer(
        serializerModule.blocksUsingDefaultSerialization,
        serializerModule.additionalBlockSerializers
    );

    return JSON.stringify(serializer.serialize(smartFilter), null, 2);
}
