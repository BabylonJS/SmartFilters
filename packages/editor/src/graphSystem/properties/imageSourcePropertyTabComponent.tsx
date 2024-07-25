import * as react from "react";
import { LineContainerComponent } from "../../sharedComponents/lineContainerComponent.js";
import { FileButtonLine } from "@babylonjs/shared-ui-components/lines/fileButtonLineComponent.js";
import { GeneralPropertyTabComponent } from "./genericNodePropertyComponent.js";
import { createImageTexture, type ConnectionPointType, type InputBlock } from "@babylonjs/smart-filters";
import type { IPropertyComponentProps } from "@babylonjs/shared-ui-components/nodeGraphSystem/interfaces/propertyComponentProps.js";
import { Tools } from "@babylonjs/core/Misc/tools.js";
import type { GlobalState, TexturePreset } from "../../globalState.js";
import { OptionsLine } from "@babylonjs/shared-ui-components/lines/optionsLineComponent.js";
import type { IInspectableOptions } from "@babylonjs/core/Misc/iInspectable.js";

export interface ImageSourcePropertyTabComponentProps extends IPropertyComponentProps {
    inputBlock: InputBlock<ConnectionPointType.Texture>;
}

const CustomImageOption = -1;

export class ImageSourcePropertyTabComponent extends react.Component<ImageSourcePropertyTabComponentProps> {
    private readonly _imageOptions: IInspectableOptions[];
    private readonly _texturePresets: TexturePreset[];

    constructor(props: ImageSourcePropertyTabComponentProps) {
        super(props);
        this._imageOptions = [{ label: "Custom", value: CustomImageOption }];
        this._texturePresets = (props.stateManager.data as GlobalState).texturePresets;

        let index = 0;
        this._texturePresets.forEach((preset: TexturePreset) => {
            this._imageOptions.push({
                label: preset.name,
                value: index++,
            });
        });

        this._imageOptions;
    }

    override componentDidMount() {}

    override componentWillUnmount() {}

    setDefaultValue() {}

    override render() {
        return (
            <div>
                <GeneralPropertyTabComponent stateManager={this.props.stateManager} nodeData={this.props.nodeData} />
                <LineContainerComponent title="PROPERTIES">
                    <OptionsLine
                        label="Texture"
                        target={{}}
                        propertyName="value"
                        options={this._imageOptions}
                        noDirectUpdate
                        extractValue={() => {
                            const url = this.props.inputBlock.runtimeValue.value?.getInternalTexture()?.url;
                            if (
                                !url ||
                                this._imageOptions.findIndex((c: IInspectableOptions) => c.value === url) === -1
                            ) {
                                return CustomImageOption;
                            }
                            return url;
                        }}
                        onSelect={(newSelectionValue: string | number) => {
                            if (newSelectionValue === CustomImageOption || typeof newSelectionValue === "string") {
                                // Take no action, let the user click the Upload button
                                return;
                            }
                            if (this.props.inputBlock.runtimeValue.value) {
                                this.props.inputBlock.runtimeValue.value.dispose();
                            }
                            this.props.inputBlock.runtimeValue.value = createImageTexture(
                                (this.props.stateManager.data as GlobalState).engine,
                                this._texturePresets[newSelectionValue]?.url || "",
                                true,
                                undefined
                            );
                            this.props.nodeData.refreshCallback?.();
                            this.forceUpdate();
                        }}
                    />
                    <FileButtonLine
                        label="Upload Custom"
                        onClick={(file) => this._replaceTexture(file)}
                        accept=".jpg, .jpeg, .png, .tga, .dds, .env"
                    />
                </LineContainerComponent>
            </div>
        );
    }

    private _replaceTexture(file: File) {
        Tools.ReadFile(
            file,
            (data) => {
                const blob = new Blob([data], { type: "octet/stream" });
                const reader = new FileReader();
                reader.readAsDataURL(blob);
                reader.onloadend = () => {
                    const base64data = reader.result as string;
                    let extension: string | undefined = undefined;
                    if (file.name.toLowerCase().indexOf(".dds") > 0) {
                        extension = ".dds";
                    } else if (file.name.toLowerCase().indexOf(".env") > 0) {
                        extension = ".env";
                    }

                    if (this.props.inputBlock.runtimeValue.value) {
                        this.props.inputBlock.runtimeValue.value.dispose();
                    }
                    this.props.inputBlock.runtimeValue.value = createImageTexture(
                        (this.props.stateManager.data as GlobalState).engine,
                        base64data,
                        true,
                        undefined,
                        extension
                    );
                    this.props.nodeData.refreshCallback?.();
                    this.forceUpdate();
                };
            },
            undefined,
            true
        );
    }
}
