import * as react from "react";

export interface IButtonLineComponentProps {
    data: string;

    tooltip: string;
}

export class DraggableLineComponent extends react.Component<IButtonLineComponentProps> {
    constructor(props: IButtonLineComponentProps) {
        super(props);
    }

    override render() {
        return (
            <div
                className="draggableLine"
                title={this.props.tooltip}
                draggable={true}
                onDragStart={(event) => {
                    event.dataTransfer.setData("babylonjs-smartfilter-node", this.props.data);
                }}
            >
                {this.props.data.replace("Block", "")}
            </div>
        );
    }
}
