import type { IBlockSerializer } from "@babylonjs/smart-filters";
import { BlackAndWhiteBlock, PixelateBlock } from "@babylonjs/smart-filters-demo-block-library";

export const blocksUsingDefaultSerialization: string[] = [BlackAndWhiteBlock.ClassName, PixelateBlock.ClassName];

export const additionalBlockSerializers: IBlockSerializer[] = [];
