import type { IBlockSerializerV1 } from "@babylonjs/smart-filters";
import { BlockNames } from "./blocks/blockNames";
import { blurBlockSerializer } from "./blocks/effects/blurBlock.serializer";
import { directionalBlurBlockSerializer } from "./blocks/effects/directionalBlurBlock.serializer";
import { compositionBlockSerializer } from "./blocks/effects/compositionBlock.serializer";
import { tileBlockSerializer } from "./blocks/transitions/tileBlock.serializer";
import { wipeBlockSerializer } from "./blocks/transitions/wipeBlock.serializer";

/**
 * Any blocks that do not need to make use of ISerializedBlockV1.data can use the default serialization and
 * should go in this list. If the serializer needs to store additional info in ISerializedBlockV1.data (e.g.
 * webcam source name), then it should be registered in additionalBlockSerializers below.
 */
export const blocksUsingDefaultSerialization: string[] = [
    BlockNames.blackAndWhite,
    BlockNames.pixelate,
    BlockNames.exposure,
    BlockNames.contrast,
    BlockNames.desaturate,
    BlockNames.posterize,
    BlockNames.kaleidoscope,
    BlockNames.greenScreen,
    BlockNames.glass,
    BlockNames.frame,
    BlockNames.blackAndWhiteAndBlur,
    BlockNames.glitch,
    BlockNames.mask,
];

/**
 * Any blocks which require serializing more information than just the connections should be registered here.
 * They should make use of the ISerializedBlockV1.data field to store this information.
 */
export const additionalBlockSerializers: IBlockSerializerV1[] = [
    blurBlockSerializer,
    directionalBlurBlockSerializer,
    compositionBlockSerializer,
    tileBlockSerializer,
    wipeBlockSerializer,
];
