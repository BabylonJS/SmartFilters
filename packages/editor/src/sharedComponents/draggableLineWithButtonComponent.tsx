import * as react from "react";

export interface IDraggableLineWithButtonComponent {
    data: string;

    tooltip: string;

    iconImage: any;

    onIconClick: (value: string) => void;

    iconTitle: string;

    lenSuffixToRemove?: number;
}

export class DraggableLineWithButtonComponent extends react.Component<IDraggableLineWithButtonComponent> {
    constructor(props: IDraggableLineWithButtonComponent) {
        super(props);
    }

    override render() {
        return (
            <div
                className="draggableLine withButton"
                title={this.props.tooltip}
                draggable={true}
                onDragStart={(event) => {
                    event.dataTransfer.setData("babylonjs-smartfilter-node", this.props.data);
                }}
            >
                {this.props.data.replace("Block", "")}
                <div
                    className="icon"
                    onClick={() => {
                        this.props.onIconClick(this.props.data);
                    }}
                    title={this.props.iconTitle}
                >
                    <img className="img" title={this.props.iconTitle} src={this.props.iconImage} />
                </div>
            </div>
        );
    }
}
