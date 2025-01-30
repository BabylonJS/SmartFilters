import type { IBlockSerializerV1 } from "@babylonjs/smart-filters";
import { BlockNames } from "./blocks/hardcoded/blockNames";
import { blurBlockSerializer } from "./blocks/hardcoded/effects/blurBlock.serializer";
import { directionalBlurBlockSerializer } from "./blocks/hardcoded/effects/directionalBlurBlock.serializer";
import { compositionBlockSerializer } from "./blocks/hardcoded/effects/compositionBlock.serializer";
import { tileBlockSerializer } from "./blocks/hardcoded/transitions/tileBlock.serializer";
import { wipeBlockSerializer } from "./blocks/hardcoded/transitions/wipeBlock.serializer";

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
    BlockNames.starryPlanes,
    BlockNames.tunnel,
    BlockNames.vhsGlitch,
    BlockNames.fireworks,
    BlockNames.aurora,
    BlockNames.softThreshold,
    BlockNames.sketch,
    BlockNames.particle,
    BlockNames.hearts,
    BlockNames.neonHeart,
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
