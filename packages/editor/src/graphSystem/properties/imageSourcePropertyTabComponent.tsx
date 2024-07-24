import * as react from "react";
import { LineContainerComponent } from "../../sharedComponents/lineContainerComponent.js";
import { FileButtonLine } from "@babylonjs/shared-ui-components/lines/fileButtonLineComponent.js";
import { GeneralPropertyTabComponent } from "./genericNodePropertyComponent.js";
import { createImageTexture, type ConnectionPointType, type InputBlock } from "@babylonjs/smart-filters";
import type { IPropertyComponentProps } from "@babylonjs/shared-ui-components/nodeGraphSystem/interfaces/propertyComponentProps.js";
import { Tools } from "@babylonjs/core/Misc/tools.js";
import type { GlobalState } from "../../globalState.js";

export interface ImageSourcePropertyTabComponentProps extends IPropertyComponentProps {
    inputBlock: InputBlock<ConnectionPointType.Texture>;
}

export class ImageSourcePropertyTabComponent extends react.Component<ImageSourcePropertyTabComponentProps> {
    constructor(props: ImageSourcePropertyTabComponentProps) {
        super(props);
    }

    override componentDidMount() {}

    override componentWillUnmount() {}

    setDefaultValue() {}

    override render() {
        return (
            <div>
                <GeneralPropertyTabComponent stateManager={this.props.stateManager} nodeData={this.props.nodeData} />
                <LineContainerComponent title="PROPERTIES">
                    <FileButtonLine
                        label="Upload"
                        onClick={(file) => this._replaceTexture(file)}
                        accept=".jpg, .png, .tga, .dds, .env"
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
                };
            },
            undefined,
            true
        );
    }
}
