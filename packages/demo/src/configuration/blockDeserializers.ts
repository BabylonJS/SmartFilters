import type { ThinEngine } from "@babylonjs/core/Engines/thinEngine";
import {
    defaultShaderBlockDeserializer,
    type SmartFilter,
    type IBlockDeserializerV1,
    type ISerializedBlockV1,
} from "@babylonjs/smart-filters";
import { BlackAndWhiteBlock, PixelateBlock } from "@babylonjs/smart-filters-demo-block-library";

/**
 * The list of block deserializers used when loaded serialized Smart Filters.
 * If a ShaderBlock subclass only uses ConnectionPoints and has no custom properties or constructor parameters, you can
 * use the defaultShaderBlockDeserializer() helper.
 * Otherwise, implement IBlockDeserializer for your block, using the blockClassName.deserializer.ts naming convention.
 */
export const blockDeserializers: IBlockDeserializerV1[] = [
    defaultShaderBlockDeserializer(
        PixelateBlock.ClassName,
        (_engine: ThinEngine, smartFilter: SmartFilter, serializedBlock: ISerializedBlockV1) =>
            new PixelateBlock(smartFilter, serializedBlock.name)
    ),
    defaultShaderBlockDeserializer(
        BlackAndWhiteBlock.ClassName,
        (_engine: ThinEngine, smartFilter: SmartFilter, serializedBlock: ISerializedBlockV1) =>
            new BlackAndWhiteBlock(smartFilter, serializedBlock.name)
    ),
];
