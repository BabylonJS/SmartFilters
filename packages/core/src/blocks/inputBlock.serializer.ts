import { InputBlockBase, type InputBlock } from "./inputBlock.js";
import type { BaseBlock } from "./baseBlock.js";
import { ConnectionPointType } from "../connection/connectionPointType.js";
import type {
    SerializedBooleanInputBlockData,
    SerializedFloatInputBlockData,
    SerializedInputBlockData,
    SerializedTextureInputBlockData,
} from "./inputBlock.serialization.types";
import type { IBlockSerializer } from "../serialization/smartFilterSerializer.types.js";

function serializeInputBlockData(inputBlock: InputBlockBase): SerializedInputBlockData {
    switch (inputBlock.type) {
        case ConnectionPointType.Texture:
            return serializeTextureInputBlock(inputBlock as InputBlock<ConnectionPointType.Texture>);
        case ConnectionPointType.Boolean:
            return serializeBooleanInputBlock(inputBlock as InputBlock<ConnectionPointType.Boolean>);
        case ConnectionPointType.Float:
            return serializeFloatInputBlock(inputBlock as InputBlock<ConnectionPointType.Float>);
        case ConnectionPointType.Color3:
            throw new Error("Not implemented: Color3");
        case ConnectionPointType.Color4:
            throw new Error("Not implemented: Color4");
        case ConnectionPointType.Vector2:
            throw new Error("Not implemented: Vector2");
    }
}

function serializeTextureInputBlock(
    inputBlock: InputBlock<ConnectionPointType.Texture>
): SerializedTextureInputBlockData {
    return {
        inputType: ConnectionPointType.Texture,
        url: inputBlock.runtimeValue.value?.getInternalTexture()?.url || null,
    };
}

function serializeBooleanInputBlock(
    inputBlock: InputBlock<ConnectionPointType.Boolean>
): SerializedBooleanInputBlockData {
    return {
        inputType: ConnectionPointType.Boolean,
        value: inputBlock.runtimeValue.value,
    };
}

function serializeFloatInputBlock(inputBlock: InputBlock<ConnectionPointType.Float>): SerializedFloatInputBlockData {
    return {
        inputType: ConnectionPointType.Float,
        value: inputBlock.runtimeValue.value,
    };
}

export const inputBlockSerializer: IBlockSerializer = {
    className: InputBlockBase.ClassName,
    serialize: (block: BaseBlock) => {
        if (block.getClassName() !== InputBlockBase.ClassName) {
            throw new Error("Was asked to serialize an unrecognized block type");
        }
        return {
            name: block.name,
            uniqueId: block.uniqueId,
            className: InputBlockBase.ClassName,
            comments: block.comments,
            data: serializeInputBlockData(block as unknown as InputBlockBase),
        };
    },
};
