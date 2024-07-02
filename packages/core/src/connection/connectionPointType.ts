import type { ThinTexture } from "@babylonjs/core/Materials/Textures/thinTexture";
import type { IColor3Like, IColor4Like } from "@babylonjs/core/Maths/math.like";

/**
 * Defines the type of a connection point.
 */
export enum ConnectionPointType {
    /** Float */
    Float = 1,
    /** Texture */
    Texture = 2,
    /** Color3 */
    Color3 = 3,
    /** Color4 */
    Color4 = 4,
    /** Boolean */
    Boolean = 5,
}

/**
 * Retrieves the type of the value from the Connection point type.
 */
// prettier-ignore
export type ConnectionPointValue<T extends ConnectionPointType = ConnectionPointType> =
    T extends ConnectionPointType.Float ? number :
    T extends ConnectionPointType.Texture ? ThinTexture :
    T extends ConnectionPointType.Color3 ? IColor3Like :
    T extends ConnectionPointType.Color4 ? IColor4Like :
    T extends ConnectionPointType.Boolean ? boolean :
    never;
