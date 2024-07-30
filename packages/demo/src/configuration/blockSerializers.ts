import type { IBlockSerializer } from "@babylonjs/smart-filters";
import { BlackAndWhiteBlock, PixelateBlock } from "./blocks";

export const blocksUsingDefaultSerialization: string[] = [BlackAndWhiteBlock.ClassName, PixelateBlock.ClassName];

export const additionalBlockSerializers: IBlockSerializer[] = [];
