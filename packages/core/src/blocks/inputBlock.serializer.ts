import { InputBlockBase, type InputBlock } from "./inputBlock.js";
import type { BaseBlock } from "./baseBlock.js";
import { ConnectionPointType } from "../connection/connectionPointType.js";
import type {
    BooleanInputBlockData,
    Color3InputBlockData,
    Color4InputBlockData,
    FloatInputBlockData,
    SerializedInputBlockData,
    TextureInputBlockData,
    Vector2InputBlockData,
} from "./inputBlock.serialization.types";
import type { IBlockSerializerV1 } from "../serialization/v1/serialization.types";

function serializeInputBlockData(inputBlock: InputBlockBase): SerializedInputBlockData {
    switch (inputBlock.type) {
        case ConnectionPointType.Texture:
            return serializeTextureInputBlock(inputBlock as InputBlock<ConnectionPointType.Texture>);
        case ConnectionPointType.Boolean:
            return serializeBooleanInputBlock(inputBlock as InputBlock<ConnectionPointType.Boolean>);
        case ConnectionPointType.Float:
            return serializeFloatInputBlock(inputBlock as InputBlock<ConnectionPointType.Float>);
        case ConnectionPointType.Color3:
            return serializeColor3InputBlock(inputBlock as InputBlock<ConnectionPointType.Color3>);
        case ConnectionPointType.Color4:
            return serializeColor4InputBlock(inputBlock as InputBlock<ConnectionPointType.Color4>);
        case ConnectionPointType.Vector2:
            return serializeVector2InputBlock(inputBlock as InputBlock<ConnectionPointType.Vector2>);
    }
}

function serializeTextureInputBlock(inputBlock: InputBlock<ConnectionPointType.Texture>): TextureInputBlockData {
    return {
        inputType: ConnectionPointType.Texture,
        url: inputBlock.runtimeValue.value?.getInternalTexture()?.url || null,
    };
}

function serializeBooleanInputBlock(inputBlock: InputBlock<ConnectionPointType.Boolean>): BooleanInputBlockData {
    return {
        inputType: ConnectionPointType.Boolean,
        value: inputBlock.runtimeValue.value,
    };
}

function serializeFloatInputBlock(inputBlock: InputBlock<ConnectionPointType.Float>): FloatInputBlockData {
    return {
        inputType: ConnectionPointType.Float,
        value: inputBlock.runtimeValue.value,
    };
}

function serializeColor3InputBlock(inputBlock: InputBlock<ConnectionPointType.Color3>): Color3InputBlockData {
    return {
        inputType: ConnectionPointType.Color3,
        value: inputBlock.runtimeValue.value,
    };
}

function serializeColor4InputBlock(inputBlock: InputBlock<ConnectionPointType.Color4>): Color4InputBlockData {
    return {
        inputType: ConnectionPointType.Color4,
        value: inputBlock.runtimeValue.value,
    };
}

function serializeVector2InputBlock(inputBlock: InputBlock<ConnectionPointType.Vector2>): Vector2InputBlockData {
    return {
        inputType: ConnectionPointType.Vector2,
        value: inputBlock.runtimeValue.value,
    };
}

export const inputBlockSerializer: IBlockSerializerV1 = {
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
