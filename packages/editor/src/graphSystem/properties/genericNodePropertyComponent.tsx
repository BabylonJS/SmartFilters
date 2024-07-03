import * as react from "react";
import { LineContainerComponent } from "../../sharedComponents/lineContainerComponent.js";

import { TextInputLineComponent } from "@babylonjs/shared-ui-components/lines/textInputLineComponent.js";
import { TextLineComponent } from "@babylonjs/shared-ui-components/lines/textLineComponent.js";
import type { IPropertyComponentProps } from "@babylonjs/shared-ui-components/nodeGraphSystem/interfaces/propertyComponentProps";
import type { GlobalState } from "../../globalState";
import type { BaseBlock } from "@babylonjs/smart-filters";
import type { ThinEngine } from "@babylonjs/core/Engines/thinEngine";

export class GenericPropertyComponent extends react.Component<IPropertyComponentProps> {
    constructor(props: IPropertyComponentProps) {
        super(props);
    }

    override render() {
        return (
            <>
                <GeneralPropertyTabComponent stateManager={this.props.stateManager} nodeData={this.props.nodeData} />
                <GenericPropertyTabComponent stateManager={this.props.stateManager} nodeData={this.props.nodeData} />
            </>
        );
    }
}

export class GeneralPropertyTabComponent extends react.Component<IPropertyComponentProps> {
    constructor(props: IPropertyComponentProps) {
        super(props);
    }

    override render() {
        const block = this.props.nodeData.data as BaseBlock;

        return (
            <>
                <LineContainerComponent title="GENERAL">
                    {
                        <TextInputLineComponent
                            label="Name"
                            propertyName="name"
                            target={block}
                            lockObject={this.props.stateManager.lockObject}
                            onChange={() => this.props.stateManager.onUpdateRequiredObservable.notifyObservers(block)}
                            // validator={(newName) => {
                            //     if (!block.validateBlockName(newName)) {
                            //         this.props.stateManager.onErrorMessageDialogRequiredObservable.notifyObservers(`"${newName}" is a reserved name, please choose another`);
                            //         return false;
                            //     }
                            //     return true;
                            // }}
                        />
                    }
                    <TextLineComponent label="Type" value={block.getClassName()} />
                    <TextInputLineComponent
                        label="Comments"
                        propertyName="comments"
                        lockObject={this.props.stateManager.lockObject}
                        target={block}
                        onChange={() => this.props.stateManager.onUpdateRequiredObservable.notifyObservers(block)}
                    />
                </LineContainerComponent>
            </>
        );
    }
}

export class GenericPropertyTabComponent extends react.Component<IPropertyComponentProps> {
    constructor(props: IPropertyComponentProps) {
        super(props);
    }

    forceRebuild(notifiers?: {
        rebuild?: boolean;
        update?: boolean;
        activatePreviewCommand?: boolean;
        callback?: (scene: ThinEngine) => void;
    }) {
        if (!notifiers || notifiers.update) {
            this.props.stateManager.onUpdateRequiredObservable.notifyObservers(this.props.nodeData.data as BaseBlock);
        }

        if (!notifiers || notifiers.rebuild) {
            this.props.stateManager.onRebuildRequiredObservable.notifyObservers();
        }

        // if (notifiers?.activatePreviewCommand) {
        //     (this.props.stateManager.data as GlobalState).onPreviewCommandActivated.notifyObservers(true);
        // }

        notifiers?.callback?.((this.props.stateManager.data as GlobalState).engine);
    }

    override render() {
        const block = this.props.nodeData.data as BaseBlock,
            //propStore: IPropertyDescriptionForEdition[] = (block as any)._propStore;
            propStore: any[] = (block as any)._propStore;

        if (!propStore) {
            return <></>;
        }

        const componentList: { [groupName: string]: JSX.Element[] } = {},
            groups: string[] = [];

        // for (const { propertyName, displayName, type, groupName, options } of propStore) {
        //     let components = componentList[groupName];

        //     if (!components) {
        //         components = [];
        //         componentList[groupName] = components;
        //         groups.push(groupName);
        //     }

        //     switch (type) {
        //         case PropertyTypeForEdition.Boolean: {
        //             components.push(
        //                 <CheckBoxLineComponent label={displayName} target={block} propertyName={propertyName} onValueChanged={() => this.forceRebuild(options.notifiers)} />
        //             );
        //             break;
        //         }
        //         case PropertyTypeForEdition.Float: {
        //             const cantDisplaySlider = isNaN(options.min as number) || isNaN(options.max as number) || options.min === options.max;
        //             if (cantDisplaySlider) {
        //                 components.push(
        //                     <FloatLineComponent
        //                         lockObject={this.props.stateManager.lockObject}
        //                         label={displayName}
        //                         propertyName={propertyName}
        //                         target={block}
        //                         onChange={() => this.forceRebuild(options.notifiers)}
        //                     />
        //                 );
        //             } else {
        //                 components.push(
        //                     <SliderLineComponent
        //                         lockObject={this.props.stateManager.lockObject}
        //                         label={displayName}
        //                         target={block}
        //                         propertyName={propertyName}
        //                         step={Math.abs((options.max as number) - (options.min as number)) / 100.0}
        //                         minimum={Math.min(options.min as number, options.max as number)}
        //                         maximum={options.max as number}
        //                         onChange={() => this.forceRebuild(options.notifiers)}
        //                     />
        //                 );
        //             }
        //             break;
        //         }
        //         case PropertyTypeForEdition.Int: {
        //             components.push(
        //                 <FloatLineComponent
        //                     lockObject={this.props.stateManager.lockObject}
        //                     digits={0}
        //                     step={"1"}
        //                     isInteger={true}
        //                     label={displayName}
        //                     propertyName={propertyName}
        //                     target={block}
        //                     onChange={() => this.forceRebuild(options.notifiers)}
        //                 />
        //             );
        //             break;
        //         }
        //         case PropertyTypeForEdition.Vector2: {
        //             components.push(
        //                 <Vector2LineComponent
        //                     lockObject={this.props.stateManager.lockObject}
        //                     label={displayName}
        //                     propertyName={propertyName}
        //                     target={block}
        //                     onChange={() => this.forceRebuild(options.notifiers)}
        //                 />
        //             );
        //             break;
        //         }
        //         case PropertyTypeForEdition.List: {
        //             components.push(
        //                 <OptionsLineComponent
        //                     label={displayName}
        //                     options={options.options as IEditablePropertyListOption[]}
        //                     target={block}
        //                     propertyName={propertyName}
        //                     onSelect={() => this.forceRebuild(options.notifiers)}
        //                 />
        //             );
        //             break;
        //         }
        //     }
        // }

        return (
            <>
                {groups.map((group) => (
                    <LineContainerComponent title={group}>{componentList[group]}</LineContainerComponent>
                ))}
            </>
        );
    }
}
