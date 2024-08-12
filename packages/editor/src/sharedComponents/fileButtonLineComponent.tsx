import * as react from "react";

interface IFileButtonLineComponentProps {
    label: string;
    onClick: (file: File) => void;
    accept: string;
    uploadName?: string;
}

export class FileButtonLineComponent extends react.Component<IFileButtonLineComponentProps> {
    private _uploadRef: react.RefObject<HTMLInputElement>;

    constructor(props: IFileButtonLineComponentProps) {
        super(props);

        this._uploadRef = react.createRef();
    }

    onChange(evt: any) {
        const files: File[] = evt.target.files;
        if (files && files.length && files[0]) {
            this.props.onClick(files[0]);
        }

        evt.target.value = "";
    }

    override render() {
        return (
            <div className="buttonLine">
                <label htmlFor={this.props.uploadName ? this.props.uploadName : "file-upload"} className="file-upload">
                    {this.props.label}
                </label>
                <input
                    ref={this._uploadRef}
                    id={this.props.uploadName ? this.props.uploadName : "file-upload"}
                    type="file"
                    accept={this.props.accept}
                    onChange={(evt) => this.onChange(evt)}
                />
            </div>
        );
    }
}
