import type { IBlockSerializerV1 } from "@babylonjs/smart-filters";
import { blurBlockSerializer } from "../blocks/effects/blurBlock.serializer.js";
import { directionalBlurBlockSerializer } from "../blocks/effects/directionalBlurBlock.serializer.js";
import { compositionBlockSerializer } from "../blocks/effects/compositionBlock.serializer.js";
import { tileBlockSerializer } from "../blocks/transitions/tileBlock.serializer.js";
import { wipeBlockSerializer } from "../blocks/transitions/wipeBlock.serializer.js";
import { BlockNames } from "../blocks/blockNames.js";

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
    BlockNames.glitch,
    BlockNames.mask,
    BlockNames.particle,
    BlockNames.spritesheet,
    BlockNames.tint,
    BlockNames.premultiplyAlpha,
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
