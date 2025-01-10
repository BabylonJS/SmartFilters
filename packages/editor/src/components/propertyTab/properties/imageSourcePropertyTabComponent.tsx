import * as react from "react";
import { FileButtonLine } from "@babylonjs/shared-ui-components/lines/fileButtonLineComponent.js";
import { NumericInput } from "@babylonjs/shared-ui-components/lines/numericInputComponent.js";
import { type ConnectionPointType, type InputBlock } from "@babylonjs/smart-filters";
import { Tools } from "@babylonjs/core/Misc/tools.js";
import type { GlobalState, TexturePreset } from "../../../globalState.js";
import { OptionsLine } from "@babylonjs/shared-ui-components/lines/optionsLineComponent.js";
import type { IInspectableOptions } from "@babylonjs/core/Misc/iInspectable.js";
import { CheckBoxLineComponent } from "../../../sharedComponents/checkBoxLineComponent.js";

import type { Nullable } from "@babylonjs/core/types.js";
import { getTextureInputBlockEditorData } from "../../../graphSystem/getEditorData.js";
import { TextInputLineComponent } from "@babylonjs/shared-ui-components/lines/textInputLineComponent.js";
import { debounce } from "../../../helpers/debounce.js";
import type { StateManager } from "@babylonjs/shared-ui-components/nodeGraphSystem/stateManager.js";

export interface ImageSourcePropertyTabComponentProps {
    stateManager: StateManager;
    inputBlock: InputBlock<ConnectionPointType.Texture>;
}

const CustomImageOption = -1;
const AssetTypeOptionArray = ["image", "video"];
const AssetTypeOptions: IInspectableOptions[] = AssetTypeOptionArray.map((value, index) => {
    return { label: value, value: index };
});

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
        const editorData = getTextureInputBlockEditorData(this.props.inputBlock);

        if ((this.props.stateManager.data as GlobalState).reloadAssets === null) {
            return <div />;
        } else {
            return (
                <div>
                    <OptionsLine
                        label="Source"
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
                            editorData.url = this._texturePresets[newSelectionValue]?.url || "";
                            editorData.urlTypeHint = this._getUrlTypeHint(editorData.url);

                            this._triggerAssetUpdate(true);
                        }}
                    />
                    <FileButtonLine
                        label="Upload Custom Image"
                        onClick={(file: File) => {
                            Tools.ReadFile(
                                file,
                                (data) => {
                                    const blob = new Blob([data], { type: "octet/stream" });
                                    const reader = new FileReader();
                                    reader.readAsDataURL(blob);
                                    reader.onloadend = () => {
                                        const base64data = reader.result as string;
                                        let extension: Nullable<string> = null;
                                        if (file.name.toLowerCase().indexOf(".dds") > 0) {
                                            extension = ".dds";
                                        } else if (file.name.toLowerCase().indexOf(".env") > 0) {
                                            extension = ".env";
                                        }

                                        editorData.url = base64data;
                                        editorData.forcedExtension = extension;
                                        editorData.urlTypeHint = this._getUrlTypeHint(file.name);

                                        this._triggerAssetUpdate(true);
                                    };
                                },
                                undefined,
                                true
                            );
                        }}
                        accept=".jpg, .jpeg, .png, .tga, .dds, .env"
                    />
                    <OptionsLine
                        label="Asset Type"
                        target={{}}
                        propertyName="value"
                        options={AssetTypeOptions}
                        noDirectUpdate
                        extractValue={() => {
                            const value = editorData.urlTypeHint ?? "image";
                            return AssetTypeOptionArray.indexOf(value);
                        }}
                        onSelect={(newSelectionValue: string | number) => {
                            if (typeof newSelectionValue === "number") {
                                editorData.urlTypeHint = AssetTypeOptionArray[newSelectionValue] as "image" | "video";
                                this._triggerAssetUpdate(true);
                            }
                        }}
                    />
                    <TextInputLineComponent
                        label="URL"
                        propertyName="url"
                        lockObject={this.props.stateManager.lockObject}
                        target={{ url: (editorData.url ?? "").indexOf("data:") === 0 ? "" : editorData.url }}
                        onChange={(newValue: string) => {
                            editorData.url = newValue;
                            editorData.urlTypeHint = this._getUrlTypeHint(newValue);

                            this._triggerAssetUpdate();
                        }}
                    />
                    <CheckBoxLineComponent
                        label="FlipY"
                        target={editorData}
                        propertyName="flipY"
                        onValueChanged={() => this._triggerAssetUpdate(true)}
                    />
                    <NumericInput
                        lockObject={(this.props.stateManager.data as GlobalState).lockObject}
                        label="AFL"
                        labelTooltip="anisotropicFilteringLevel"
                        precision={0}
                        value={editorData.anisotropicFilteringLevel ?? 4}
                        onChange={(value: number) => {
                            editorData.anisotropicFilteringLevel = value;
                            this._triggerAssetUpdate(true);
                        }}
                    />
                </div>
            );
        }
    }

    private _triggerAssetUpdate(instant: boolean = false) {
        const globalState = this.props.stateManager.data as GlobalState;
        const reloadAssets = globalState.reloadAssets;

        if (reloadAssets) {
            this.props.stateManager.onUpdateRequiredObservable.notifyObservers(this.props.inputBlock);
            this.forceUpdate();

            const update = () => {
                reloadAssets(globalState.smartFilter);
            };

            if (instant) {
                update();
            } else {
                debounce(update, 1000)();
            }
        }
    }

    private _getUrlTypeHint(url: string): "image" | "video" {
        const extension: Nullable<string> = url.toLowerCase().split(".").pop() ?? null;
        return extension === "mp4" ? "video" : "image";
    }
}
