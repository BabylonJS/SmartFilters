import type { DeserializeBlockV1, IBlockDeserializerV1 } from "./smartFilterDeserializer.types";

/**
 * Helper function to create a IBlockDeserializer for a ShaderBlock subclass that only uses ConnectionPoints, no custom properties,
 * and no custom constructor parameters.
 * @param className - The class name of the ShaderBlock subclass
 * @param constructionFn - A function that creates a new instance of the ShaderBlock subclass
 */
export function defaultShaderBlockDeserializer(
    className: string,
    constructionFn: DeserializeBlockV1
): IBlockDeserializerV1 {
    return {
        className,
        deserialize: constructionFn,
    };
}
