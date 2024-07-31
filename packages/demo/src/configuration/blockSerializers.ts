import type { IBlockSerializer } from "@babylonjs/smart-filters";
import { BlackAndWhiteBlock, PixelateBlock } from "./blocks";

/**
 * Any blocks that do not need to make use of ISerializedBlockV1.data can use the default serialization and
 * should go in this list. If the serializer needs to store additional info in ISerializedBlockV1.data (e.g.
 * webcam source name), then it should be registered in additionalBlockSerializers below.
 */
export const blocksUsingDefaultSerialization: string[] = [BlackAndWhiteBlock.ClassName, PixelateBlock.ClassName];

/**
 * Any blocks which require serializing more information than just the connections should be registered here.
 * They should make use of the ISerializedBlockV1.data field to store this information.
 */
export const additionalBlockSerializers: IBlockSerializer[] = [];
