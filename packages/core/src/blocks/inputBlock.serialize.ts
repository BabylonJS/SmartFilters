import type { Nullable } from "@babylonjs/core";
import { InputBlockBase, type InputBlock } from "./inputBlock.js";
import type { IBlockSerializer } from "../serialization/smartFilterSerializer";
import type { BaseBlock } from "./baseBlock";
import { ConnectionPointType } from "../connection/connectionPointType.js";

interface IInputBlockDataBase {
    inputType: ConnectionPointType;
}

interface ITextureInputBlockData extends IInputBlockDataBase {
    inputType: ConnectionPointType.Texture;
    url: Nullable<string>;
}

interface IBooleanInputBlockData extends IInputBlockDataBase {
    inputType: ConnectionPointType.Boolean;
    value: Nullable<boolean>;
}

interface IFloatInputBlockData extends IInputBlockDataBase {
    inputType: ConnectionPointType.Float;
    value: Nullable<number>;
}

function serializeInputBlock(inputBlock: InputBlockBase): IInputBlockDataBase {
    switch (inputBlock.type) {
        case ConnectionPointType.Texture:
            return SerializeTextureInputBlock(inputBlock as InputBlock<ConnectionPointType.Texture>);
        case ConnectionPointType.Boolean:
            return SerializeBooleanInputBlock(inputBlock as InputBlock<ConnectionPointType.Boolean>);
        case ConnectionPointType.Float:
            return SerializeFloatInputBlock(inputBlock as InputBlock<ConnectionPointType.Float>);
        default: // TODO: All the others
            throw new Error("Not implemented for type " + inputBlock.type);
    }
}

function SerializeTextureInputBlock(inputBlock: InputBlock<ConnectionPointType.Texture>): ITextureInputBlockData {
    return {
        inputType: ConnectionPointType.Texture,
        url: inputBlock.runtimeValue.value?.getInternalTexture()?.url || null,
    };
}

function SerializeBooleanInputBlock(inputBlock: InputBlock<ConnectionPointType.Boolean>): IBooleanInputBlockData {
    return {
        inputType: ConnectionPointType.Boolean,
        value: inputBlock.runtimeValue.value,
    };
}

function SerializeFloatInputBlock(inputBlock: InputBlock<ConnectionPointType.Float>): IFloatInputBlockData {
    return {
        inputType: ConnectionPointType.Float,
        value: inputBlock.runtimeValue.value,
    };
}

export const inputBlockSerializer: IBlockSerializer = {
    className: InputBlockBase.ClassName,
    serializeData: (block: BaseBlock) => {
        if (block.getClassName() !== InputBlockBase.ClassName) {
            throw new Error("Was asked to serialize an unrecognized block type");
        }
        return serializeInputBlock(block as unknown as InputBlockBase);
    },
};
