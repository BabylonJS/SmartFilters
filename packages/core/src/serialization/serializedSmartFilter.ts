import type { SerializedSmartFilterV1 } from "./v1/smartFilterSerialization.types";

/**
 * The base type of all serialized SmartFilters, used to determine the version of the SmartFilter
 * serialization format so the correct deserialization logic can be used.
 */
export type SerializedSmartFilterBase = {
    /** The format version of the serialized data (not the version of the SmartFilter itself). */
    version: number;
};

/**
 * Type union of all versions of serialized SmartFilters
 */
export type SerializedSmartFilter = SerializedSmartFilterV1;
