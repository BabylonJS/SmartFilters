import { blackAndWhiteBlockDeserializer, pixelateBlockDeserializer } from "@babylonjs/smart-filters-editor";
import type { IBlockDeserializer } from "@babylonjs/smart-filters";

/**
 * The list of
 */
export const blockDeserializers: IBlockDeserializer[] = [blackAndWhiteBlockDeserializer, pixelateBlockDeserializer];
