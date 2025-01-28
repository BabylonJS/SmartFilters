import type { SerializedBlockDefinitionV1 } from "./v1/blockSerialization.types";

/**
 * The base type of all serialized block definitions, used to determine the version of the
 * serialized block definition so the correct deserialization logic can be used.
 * Note: this is separate from a block serialized into a SmartFilter. This defines a serialized block definition,
 * which can then be used in a SmartFilter graph. It, and coded blocks, are referenced in serialized SmartFilters
 * by className.
 */
export type SerializedBlockDefinitionBase = {
    /**
     * The version of the serialized block.
     */
    version: 1;
};

/**
 * Type union of all versions of serialized SmartFilter block definitions
 */
export type SerializedBlockDefinition = SerializedBlockDefinitionV1;
