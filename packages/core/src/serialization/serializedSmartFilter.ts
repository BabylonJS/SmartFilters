import type { SerializedSmartFilterV1 } from "./v1/serialization.types";

/**
 * The base type of all serialized SmartFilters, used to determine the version of the SmartFilter so the
 * correct deserialization logic can be used.
 */
export type SerializedSmartFilterBase = {
    /**
     * The version of the serialized SmartFilter.
     */
    version: 1;
};

/**
 * Type union of all versions of serialized SmartFilters
 */
export type SerializedSmartFilter = SerializedSmartFilterV1;
