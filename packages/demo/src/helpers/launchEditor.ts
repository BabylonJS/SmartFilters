import {
    type BaseBlock,
    logCommands,
    type SmartFilter,
    type SmartFilterRuntime,
    SmartFilterSerializer,
} from "@babylonjs/smart-filters";
import { blockEditorRegistrations } from "../configuration/editor/blockEditorRegistrations";
import { type BlockRegistration, SmartFilterEditor } from "@babylonjs/smart-filters-editor";
import { createInputBlock } from "../configuration/editor/createInputBlock";
import { CustomInputDisplayManager } from "../configuration/editor/customInputDisplayManager";
import { getInputNodePropertyComponent } from "../configuration/editor/getInputNodePropertyComponent";
import { getIsUniqueBlock } from "../configuration/editor/getIsUniqueBlock";
import type { IBlockEditorRegistration } from "../configuration/editor/IBlockEditorRegistration";
import { texturePresets } from "../configuration/texturePresets";
import type { ThinEngine } from "@babylonjs/core/Engines/thinEngine";
import type { SmartFilterRenderer } from "../smartFilterRenderer";
import { StringTools } from "@babylonjs/shared-ui-components/stringTools";
import { additionalBlockSerializers, blocksUsingDefaultSerialization } from "../configuration/blockSerializers";

/**
 * Launches the editor - in a separate file so it can be dynamically imported, since it brings in code which
 * knows how to instantiate all registered blocks (so it includes all the block code).
 * @param currentSmartFilter - The smart filter to edit
 * @param engine - The engine to use
 * @param renderer - The renderer to use
 */
export function launchEditor(currentSmartFilter: SmartFilter, engine: ThinEngine, renderer: SmartFilterRenderer) {
    // Set up block registration
    const blockTooltips: { [key: string]: string } = {};
    const allBlockNames: { [key: string]: string[] } = {};
    blockEditorRegistrations.forEach((registration: IBlockEditorRegistration) => {
        blockTooltips[registration.name] = registration.tooltip;
        if (typeof allBlockNames[registration.category] === "object") {
            allBlockNames[registration.category]!.push(registration.name);
        } else {
            allBlockNames[registration.category] = [registration.name];
        }
    });
    const getBlockFromString = (blockType: string, smartFilter: SmartFilter): BaseBlock | null => {
        const registration = blockEditorRegistrations.find((r) => r.name === blockType);
        if (registration && registration.factory) {
            return registration.factory(smartFilter);
        }
        return null;
    };

    const blockRegistration: BlockRegistration = {
        getIsUniqueBlock,
        getBlockFromString,
        getInputNodePropertyComponent,
        createInputBlock,
        allBlockNames,
        blockTooltips,
        inputDisplayManager: CustomInputDisplayManager,
    };

    if (currentSmartFilter) {
        // Display the editor
        SmartFilterEditor.Show({
            engine,
            blockRegistration,
            filter: currentSmartFilter,
            onRuntimeCreated: (runtime: SmartFilterRuntime) => {
                renderer.setRuntime(runtime);
            },
            saveSmartFilter: () => {
                const serializer = new SmartFilterSerializer(
                    blocksUsingDefaultSerialization,
                    additionalBlockSerializers
                );

                StringTools.DownloadAsFile(
                    document,
                    JSON.stringify(serializer.serialize(currentSmartFilter), null, 2),
                    currentSmartFilter.name + ".json"
                );
            },
            texturePresets,
        });
    }
    if (renderer.runtime) {
        // Display debug info in the console
        logCommands(renderer.runtime.commandBuffer);
    }
}